import { useState, useCallback, useEffect } from "react";
import axios from "axios";


// یک آبجکت خالی و ثابت؛ به‌جای {} تازه در هر بار صدا زدن هوک، تا در dependency array هی رفرنس عوض نشه
const EMPTY_EXTRA_BODY = {};

// هوک عمومی انتخاب کد (کالا / مرکز۱ تا مرکز۴ / هرچیز مشابه دیگه)
// apiBase مثلاً "Good" یا "Markaz1" تا "Markaz4" است -> آدرس نهایی: /api/{apiBase}/GetAll و /api/{apiBase}/SearchTreeView
export default function useEntityPicker(apiBase, searchExtraBody = EMPTY_EXTRA_BODY) {
    const [modal, setModal] = useState({
        open: false,
        activeRowId: null,
        initialSearch: "",
        focusFirstRoot: false,
    });
    const [activeTab, setActiveTab] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const [treeData, setTreeData] = useState([]);
    const [treeLoading, setTreeLoading] = useState(false);
    const [expandedItems, setExpandedItems] = useState([]);
    const [allItems, setAllItems] = useState([]);

    // شناسه‌ی نودی که باید بعد از رندر شدن درخت، بهش اسکرول و هایلایت بشه
    const [scrollTargetId, setScrollTargetId] = useState(null);
    const clearScrollTarget = useCallback(() => setScrollTargetId(null), []);

    const open = useCallback((rowId, initialSearch = "", focusFirstRoot = false) => {
        setModal({ open: true, activeRowId: rowId, initialSearch, focusFirstRoot });
        setSearchTerm(initialSearch);
        // اگر قرار است روی اولین ریشه‌ی درخت فوکوس بشه، همون لحظه‌ی باز شدن باید تب درخت باشه
        setActiveTab(focusFirstRoot ? 1 : 0);
    }, []);

    const close = useCallback(() => {
        setModal({ open: false, activeRowId: null, initialSearch: "", focusFirstRoot: false });
        setSearchTerm("");
        setScrollTargetId(null);
    }, []);

    // تب «جستجو»: تایپ -> فراخوانی GetAll
    useEffect(() => {
        if (!modal.open) return;

        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await axios.post(
                    `http://ecipc107:8049/api/${apiBase}/GetAll`,
                    { filter: searchTerm.trim(), ...searchExtraBody }
                );
                setSearchResults(res.data || []);
            } catch (error) {
                console.error(`خطا در جستجوی ${apiBase}:`, error);
            } finally {
                setSearchLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchTerm, modal.open, apiBase, searchExtraBody]);

    // تب «درخت»: فقط یک‌بار ریشه‌ها را می‌گیرد
    useEffect(() => {
        const fetchRoots = async () => {
            setTreeLoading(true);
            try {
                const res = await axios.post(
                    `http://ecipc107:8049/api/${apiBase}/SearchTreeView`,
                    { code: "" }
                );
                console.log (res);
                const roots = (res.data || []).map((item) => ({
                    ...item,
                    children:
                        item.childCount > 0
                            ? [{ id: `${item.id}-dummy`, name: "در حال بارگذاری...", isDummy: true }]
                            : [],
                }));
                setTreeData(roots);
                setAllItems(roots);
            } catch (error) {
                console.error(`خطا در دریافت ساختار درختی ${apiBase}:`, error);
            } finally {
                setTreeLoading(false);
            }
        };
        fetchRoots();
    }, [apiBase]);

    // بارگذاری تنبل فرزندان یک نود موقع باز شدنش
    const loadChildren = useCallback(async (node) => {
        if (!node || node.childCount <= 0) return [];

        try {
            const res = await axios.post(
                `http://ecipc107:8049/api/${apiBase}/SearchTreeView`,
                { code: node.code }
            );
            const fetched = res.data || [];

            const directChildren = fetched
                .filter((item) => String(item.parentCode).trim() === String(node.code).trim())
                .map((item) => ({
                    ...item,
                    children:
                        item.childCount > 0
                            ? [{ id: `${item.id}-dummy`, name: "در حال بارگذاری...", isDummy: true }]
                            : [],
                }));

            setTreeData((prev) => {
                const update = (nodes) =>
                    nodes.map((n) => {
                        if (String(n.id) === String(node.id)) return { ...n, children: directChildren };
                        if (n.children?.length > 0) return { ...n, children: update(n.children) };
                        return n;
                    });
                return update(prev);
            });

            setAllItems((prev) => {
                const existingIds = new Set(prev.map((a) => a.id));
                return [...prev, ...directChildren.filter((a) => !existingIds.has(a.id))];
            });

            return directChildren;
        } catch (error) {
            console.error(`خطا در دریافت زیرمجموعه‌های ${apiBase}:`, error);
            return [];
        }
    }, [apiBase]);

    // باز/بسته کردن یک نود؛ اگر برگ باشد، انتخاب می‌شود
    const toggleNode = useCallback(async (node, onLeafSelected) => {
        if (!node) return;
        const isParent = node.childCount > 0;

        if (!isParent) {
            onLeafSelected(node);
            return;
        }

        const idStr = String(node.id);
        const hasDummy = node.children?.length === 1 && node.children[0].isDummy;
        const hasRealChildren = node.children?.length > 0 && !hasDummy;
        const isExpanded = expandedItems.includes(idStr);

        if (hasRealChildren) {
            setExpandedItems((prev) =>
                isExpanded ? prev.filter((id) => id !== idStr) : [...prev, idStr]
            );
            return;
        }

        setExpandedItems((prev) => (prev.includes(idStr) ? prev : [...prev, idStr]));
        await loadChildren(node);
    }, [expandedItems, loadChildren]);

    // =========================================================
    // سناریوی «کد مستقیم توی سلول تایپ شد»:
    // اگر برگ باشد caller خودش انتخابش می‌کند (نیازی به این تابع نیست)
    // اگر والد باشد: مودال باز می‌شود، مسیر درخت باز می‌شود، و روی خودش اسکرول/هایلایت می‌شود
    // =========================================================
    const resolveTypedCode = useCallback(async (code, rowId) => {
        const typedCode = String(code).trim();

        try {
            const res = await axios.post(
                `http://ecipc107:8049/api/${apiBase}/SearchTreeView`,
                { code: typedCode }
            );
            const fetched = res.data || [];



            const node = fetched.find((item) => String(item.code).trim() === typedCode);

            if (!node) {
                return { status: "invalid" };
            }

            const childrenByParentCode = new Map();

            for (const item of fetched) {
                const parentCode = item.parentCode == null
                    ? null
                    : String(item.parentCode).trim();

                if (!childrenByParentCode.has(parentCode)) {
                    childrenByParentCode.set(parentCode, []);
                }

                childrenByParentCode.get(parentCode).push(item);
            }

            if (node.childCount > 0) {
                // دنبال کردن زنجیره‌ی واقعی والدها با parentCode
                const parentsToOpen = [];
                let current = node;
                let depth = 0;
                while (current && depth < 10) {
                    parentsToOpen.unshift(String(current.id));
                    if (!current.parentCode) break;
                    const parentCodeStr = String(current.parentCode).trim();
                    current =
                        fetched.find((item) => String(item.code).trim() === parentCodeStr) ||
                        allItems.find((item) => String(item.code).trim() === parentCodeStr) ||
                        null;
                    depth += 1;
                }

                setTreeData((prevTree) => {

                    const buildChildren = (item) => {
                        const directChildren =
                            childrenByParentCode.get(String(item.code).trim()) || [];

                        return directChildren.map((acc) => {
                            if (parentsToOpen.includes(String(acc.id))) {
                                return {
                                    ...acc,
                                    children: buildChildren(acc)
                                };
                            }

                            return {
                                ...acc,
                                children:
                                    acc.childCount > 0
                                        ? [{
                                            id: `${acc.id}-dummy`,
                                            name: "در حال بارگذاری...",
                                            isDummy: true
                                        }]
                                        : []
                            };
                        });
                    };

                    const updateTreeRecursively = (nodes) =>
                        nodes.map((item) => {
                            if (parentsToOpen.includes(String(item.id))) {
                                return { ...item, children: buildChildren(item) };
                            }
                            if (item.children?.length > 0) {
                                return { ...item, children: updateTreeRecursively(item.children) };
                            }
                            return item;
                        });

                    return updateTreeRecursively(prevTree);
                });

                setExpandedItems(parentsToOpen);
                open(rowId, "");
                setActiveTab(1);
                setScrollTargetId(String(node.id));

                return { status: "parent", node };
            }

            return { status: "leaf", node };
        } catch (error) {
            console.error(`خطا در بررسی کد ${apiBase}:`, error);
            return { status: "error" };
        }
    }, [apiBase, allItems, open]);

    return {
        modal, open, close,
        activeTab, setActiveTab,
        searchTerm, setSearchTerm, searchResults, searchLoading,
        treeData, treeLoading, expandedItems, setExpandedItems,
        allItems,
        loadChildren, toggleNode, resolveTypedCode,
        scrollTargetId, clearScrollTarget,
    };
}