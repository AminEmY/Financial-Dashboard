import { useEffect, useState, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, Box, Tabs, Tab, TextField, List, ListItemButton, ListItemText, CircularProgress, Button } from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { toPersianDigits } from "../../../utils/formatter";
import styles from "./EntityPickerModal.module.css";

function findNodeById(nodes, id) {
    for (const node of nodes) {
        if (String(node.id) === String(id)) return node;
        if (node.children?.length > 0) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}


// مودال عمومی انتخاب کد؛ با یک picker (خروجی useEntityPicker) و یک onSelect کار می‌کند
const EntityPickerModal = ({ title, picker, onSelect }) => {

    const {
        modal, close,
        activeTab, setActiveTab,
        searchTerm, setSearchTerm, searchResults, searchLoading,
        treeData, treeLoading, expandedItems, setExpandedItems,
        loadChildren, toggleNode,
        scrollTargetId, clearScrollTarget,
    } = picker;

    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const resultRefs = useRef([]);

    const searchInputRef = (element) => {
        if (element && modal.open) {
            setTimeout(() => {
                element.focus();
                const length = element.value ? element.value.length : 0;
                if (length > 0 && typeof element.setSelectionRange === "function") {
                    element.setSelectionRange(length, length);
                }
            }, 60);
        }
    };


    // 🟢 الگوی رسمی ری‌اکت برای «تنظیم state هنگام تغییر یک prop» — بدون useEffect
    const [prevSearchResults, setPrevSearchResults] = useState(searchResults);
    if (searchResults !== prevSearchResults) {
        setPrevSearchResults(searchResults);
        setHighlightedIndex(0);
    }

    // این یکی می‌مونه چون واقعاً «سینک با سیستم خارجی» (اسکرول DOM) است، نه sync بین دو state
    useEffect(() => {
        const el = resultRefs.current[highlightedIndex];
        if (el) el.scrollIntoView({ block: "nearest" });
    }, [highlightedIndex]);

    const handleSelect = (node) => {
        onSelect(node);
        close();
    };

    // اسکرول و هایلایت به نودی که از تایپ مستقیم کد پیدا شده (resolveTypedCode)
    // به‌جای MutationObserver روی کل صفحه، یک polling سبک و محدود (حداکثر ۳ ثانیه)
    useEffect(() => {
        if (!modal.open || activeTab !== 1 || !scrollTargetId) return;

        let attempts = 0;
        const maxAttempts = 30;

        const interval = setInterval(() => {
            attempts += 1;

            const treeRoot = document.querySelector(".MuiSimpleTreeView-root");
            const targetElement = treeRoot?.querySelector(`[id$="-${scrollTargetId}"]`);
            const nodeElement = targetElement?.querySelector(".MuiTreeItem-content") || targetElement;

            if (nodeElement) {
                clearInterval(interval);

                nodeElement.scrollIntoView({ block: "center", behavior: "smooth" });

                const treeItem = nodeElement.closest('[role="treeitem"]');
                if (treeItem instanceof HTMLElement) {
                    treeItem.setAttribute("tabindex", "0");
                    treeItem.focus();
                    treeItem.classList.add("Mui-focused");
                    treeItem.classList.add("Mui-selected");
                }

                clearScrollTarget();
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                clearScrollTarget();
            }
        }, 100);

        return () => clearInterval(interval);
    }, [modal.open, activeTab, scrollTargetId, clearScrollTarget]);

    
    // فوکوس روی اولین ریشه، فقط وقتی مودال با focusFirstRoot باز شده (مثلاً Enter روی سلول خالی)
    useEffect(() => {
        if (!modal.open || activeTab !== 1 || !modal.focusFirstRoot) return;

        let attempts = 0;
        const maxAttempts = 30;

        const interval = setInterval(() => {
            attempts += 1;

            const treeRoot = document.querySelector('.MuiSimpleTreeView-root');
            const firstRootNode =
                treeRoot?.querySelector('[role="treeitem"] .MuiTreeItem-content') ||
                treeRoot?.querySelector('[role="treeitem"]');

            if (firstRootNode instanceof HTMLElement) {
                clearInterval(interval);

                firstRootNode.setAttribute('tabindex', '0');
                firstRootNode.focus();
                firstRootNode.classList.add("Mui-focused");
                firstRootNode.classList.add("Mui-selected");

                const parentTreeItem = firstRootNode.closest('[role="treeitem"]');
                if (parentTreeItem instanceof HTMLElement) {
                    parentTreeItem.setAttribute('tabindex', '0');
                    parentTreeItem.focus();
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [modal.open, activeTab, modal.focusFirstRoot]);


    const handleTreeKeyDown = (event) => {
        if (event.key !== "Enter") return;
        const focusedElement = document.activeElement;
        if (!focusedElement || focusedElement.getAttribute("role") !== "treeitem") return;

        event.preventDefault();
        event.stopPropagation();

        const itemId = focusedElement.getAttribute("id")?.split("-").pop();
        if (!itemId) return;

        const targetNode = findNodeById(treeData, itemId);
        if (targetNode) toggleNode(targetNode, handleSelect);
    };

    const renderTree = (nodes) =>
        nodes.map((node) => {
            const isParent = node.childCount > 0;
            const hasDummy = node.children?.length === 1 && node.children[0].isDummy;

            return (
                <TreeItem
                    key={node.id}
                    itemId={String(node.id)}
                    label={
                        <div
                            className={styles.TreeLabelContainer}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleNode(node, handleSelect);
                            }}
                        >
                            <span>{node.name}</span>
                            <span className={styles.TreeCodeSpan}>({toPersianDigits(node.code)})</span>
                            {!isParent && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(node);
                                    }}
                                >
                                    انتخاب
                                </Button>
                            )}
                        </div>
                    }
                >
                    {hasDummy ? (
                        <TreeItem itemId={`${node.id}-loading`} label="در حال بارگذاری..." disabled />
                    ) : (
                        node.children?.length > 0 ? renderTree(node.children) : null
                    )}
                </TreeItem>
            );
        });

    return (
        <Dialog open={modal.open} onClose={close} fullWidth maxWidth="sm" >
            <DialogTitle>{title}</DialogTitle>

            <Box sx={{ borderBottom: 1, borderColor: "divider" }} dir="rtl">
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
                    <Tab label="جستجو" />
                    <Tab label="ساختار درختی" />
                </Tabs>
            </Box>

            <DialogContent dir="rtl">
                {activeTab === 0 && (
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            inputRef={searchInputRef}
                            placeholder="کد یا نام را برای جستجو تایپ کنید..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setHighlightedIndex((prev) =>
                                        Math.min(prev + 1, searchResults.length - 1)
                                    );
                                } else if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                                } else if (e.key === "Enter") {
                                    e.preventDefault();
                                    const item = searchResults[highlightedIndex];
                                    if (item && !(item.childCount > 0)) {
                                        handleSelect(item);
                                    }
                                }
                            }}
                        />
                        {searchLoading ? (
                            <div className={styles.LoadingContainer}><CircularProgress size={30} /></div>
                        ) : (
                            <List>
                                {searchResults.map((item, index) => {
                                    const isParent = item.childCount > 0;
                                    return (
                                        <ListItemButton
                                            key={item.id ?? item.Id ?? item.code ?? index}
                                            ref={(el) => { resultRefs.current[index] = el; }}
                                            selected={index === highlightedIndex}
                                            disabled={isParent}
                                            onClick={() => !isParent && handleSelect(item)}
                                        >
                                            <ListItemText
                                                primary={
                                                    <span>
                                                        {item.name}
                                                        {isParent && <small style={{ color: "orange", marginRight: 8 }}>(دارای زیرمجموعه)</small>}
                                                    </span>
                                                }
                                                secondary={`کد: ${toPersianDigits(item.code)}`}
                                            />
                                        </ListItemButton>
                                    );
                                })}
                                {searchResults.length === 0 && <div className={styles.EmptyResult}>چیزی یافت نشد.</div>}
                            </List>
                        )}
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box sx={{ pt: 2 }} className={styles.TreeWrapper}>
                        {treeLoading ? (
                            <div className={styles.LoadingContainer}><CircularProgress size={30} /></div>
                        ) : treeData.length > 0 ? (
                            <SimpleTreeView
                                expandedItems={expandedItems}
                                onExpandedItemsChange={async (e, itemIds) => {
                                    const newId = itemIds.find((id) => !expandedItems.includes(id));
                                    setExpandedItems(itemIds);
                                    if (newId) {
                                        const node = findNodeById(treeData, newId);
                                        const hasDummy =
                                            node?.children?.length === 1 && node.children[0].isDummy;
                                        const hasRealChildren =
                                            node?.children?.length > 0 && !hasDummy;

                                        // اگر قبلاً فرزندان واقعی گرفته شده (مثلاً توسط toggleNode از کلیک روی لیبل)، دوباره fetch نزن
                                        if (node && !hasRealChildren) {
                                            await loadChildren(node);
                                        }
                                    }
                                }}
                                onKeyDown={handleTreeKeyDown}
                            >
                                {renderTree(treeData)}
                            </SimpleTreeView>
                        ) : (
                            <div className={styles.EmptyResult}>ساختار درختی یافت نشد.</div>
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EntityPickerModal;