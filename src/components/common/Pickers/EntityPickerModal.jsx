import { useEffect, useState, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, Box, Tabs, Tab, TextField, List, ListItemButton, ListItemText, CircularProgress, Button } from "@mui/material";
import { toPersianDigits } from "../../../utils/formatter";
import styles from "./EntityPickerModal.module.css";
import { FixedSizeList } from "react-window";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";




// تبدیل درخت تودرتو به یک لیست تخت با عمق (depth)، فقط شامل نودهایی که مسیرشون باز است
function flattenTree(nodes, depth, expandedItems) {
    let result = [];
    for (const node of nodes) {
        result.push({ node, depth });
        const idStr = String(node.id);
        if (expandedItems.includes(idStr) && node.children?.length > 0) {
            result = result.concat(flattenTree(node.children, depth + 1, expandedItems));
        }
    }
    return result;
}

function findFlatIndexById(flatNodes, id) {
    return flatNodes.findIndex((entry) => String(entry.node.id) === String(id));
}


// مودال عمومی انتخاب کد؛ با یک picker (خروجی useEntityPicker) و یک onSelect کار می‌کند
const EntityPickerModal = ({ title, picker, onSelect }) => {

    const {
        modal, close,
        activeTab, setActiveTab,
        searchTerm, setSearchTerm, searchResults, searchLoading,
        treeData, treeLoading, expandedItems, toggleNode,
        scrollTargetId, clearScrollTarget,
    } = picker;

    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const virtualListRef = useRef(null);
    
    const treeListRef = useRef(null);
    
        // محاسبه‌ی لیست تخت درخت، برای رندر virtualized
    const flatTreeNodes = flattenTree(treeData, 0, expandedItems);
    
    const [highlightedTreeIndex, setHighlightedTreeIndex] = useState(0);
    const treeContainerRef = useRef(null);

    // 🟢 الگوی رسمی ری‌اکت: وقتی scrollTargetId (از بیرون) تغییر کرد، هایلایت را همین‌جا در رندر تنظیم کن
    const [prevScrollTargetId, setPrevScrollTargetId] = useState(scrollTargetId);
    if (scrollTargetId !== prevScrollTargetId) {
        setPrevScrollTargetId(scrollTargetId);
        if (scrollTargetId) {
            const index = findFlatIndexById(flatTreeNodes, scrollTargetId);
            if (index >= 0) {
                setHighlightedTreeIndex(index);
            }
        }
    }



    // با تغییر لیست تخت (باز/بسته شدن یه نود)، هایلایت برنمی‌گرده به صفر؛ فقط اگه ایندکس فعلی دیگه معتبر نبود، اصلاحش کن
    if (highlightedTreeIndex > 0 && highlightedTreeIndex >= flatTreeNodes.length) {
        setHighlightedTreeIndex(Math.max(0, flatTreeNodes.length - 1));
    }



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
        virtualListRef.current?.scrollToItem(highlightedIndex, "smart");
    }, [highlightedIndex]);

    const handleSelect = (node) => {
        onSelect(node);
        close();
    };

    // اسکرول به نودی که از تایپ مستقیم کد پیدا شده (resolveTypedCode)
    useEffect(() => {
        if (!modal.open || activeTab !== 1 || !scrollTargetId) return;

        const index = findFlatIndexById(flatTreeNodes, scrollTargetId);
        if (index >= 0) {
            treeListRef.current?.scrollToItem(index, "smart");
        }
        clearScrollTarget();
    }, [modal.open, activeTab, scrollTargetId, flatTreeNodes, clearScrollTarget]);

    // فوکوس روی اولین ریشه، فقط وقتی مودال با focusFirstRoot باز شده
    useEffect(() => {
        if (!modal.open || activeTab !== 1 || !modal.focusFirstRoot) return;
        treeListRef.current?.scrollToItem(0, "smart");
        
    }, [modal.open, activeTab, modal.focusFirstRoot]);


    // فوکوس گرفتن خودِ لیست درخت وقتی تب باز می‌شه، تا فوراً کیبورد کار کند
    useEffect(() => {
        if (!modal.open || activeTab !== 1) return;
        const timer = setTimeout(() => {
            treeContainerRef.current?.focus();
        }, 60);
        return () => clearTimeout(timer);
    }, [modal.open, activeTab]);



    return (

        <Dialog open={modal.open} onClose={close} fullWidth maxWidth="sm" >
            <DialogTitle className={styles.ModalTitle}>{title}</DialogTitle>

            <Box sx={{ borderBottom: 1, borderColor: "divider" }} dir="rtl">
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
                    <Tab label="جستجو" className={styles.TabFont} />
                    <Tab label="ساختار درختی" className={styles.TabFont} />
                </Tabs>
            </Box>

            <DialogContent dir="rtl">
                {activeTab === 0 && (
                    <Box sx={{ pt: 2 }} className={styles.TreeWrapper}>
                        <TextField className={styles.SearchInput}
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
                        {searchResults.length === 0 ? (
                            <div className={styles.EmptyResult}>چیزی یافت نشد.</div>
                        ) : (
                            <FixedSizeList
                                ref={virtualListRef}
                                height={320}
                                width="100%"
                                itemCount={searchResults.length}
                                itemSize={58}
                            >
                                {({ index, style }) => {
                                    const item = searchResults[index];
                                    const isParent = item.childCount > 0;

                                    return (
                                        <div style={style}>
                                            <ListItemButton
                                                className={styles.ResultItem}
                                                selected={index === highlightedIndex}
                                                disabled={isParent}
                                                onClick={() => !isParent && handleSelect(item)}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <span className={styles.ResultNameText}>
                                                            {item.name}
                                                            {isParent && <small style={{ color: "orange", marginRight: 8 }}>(دارای زیرمجموعه)</small>}
                                                        </span>
                                                    }
                                                    secondary={<span className={styles.ResultCodeText}>کد: {toPersianDigits(item.code)}</span>}
                                                />
                                            </ListItemButton>
                                        </div>
                                    );
                                }}
                            </FixedSizeList>
                        )}
                            </List>
                        )}
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box sx={{ pt: 2 }} className={styles.TreeWrapper}>
                        {treeLoading ? (
                            <div className={styles.LoadingContainer}><CircularProgress size={30} /></div>
                        ) : treeData.length > 0 ? (
                            <div
                                ref={treeContainerRef}
                                tabIndex={0}
                                style={{ outline: "none" }}
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        setHighlightedTreeIndex((prev) =>
                                            Math.min(prev + 1, flatTreeNodes.length - 1)
                                        );
                                    } else if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        setHighlightedTreeIndex((prev) => Math.max(prev - 1, 0));
                                    } else if (e.key === "Enter") {
                                        e.preventDefault();
                                        const entry = flatTreeNodes[highlightedTreeIndex];
                                        if (entry && !entry.node.isDummy) {
                                            toggleNode(entry.node, handleSelect);
                                        }
                                    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                                        // جهت راست/چپ فقط برای باز/بسته کردن، تا با اسکرول افقی صفحه تصادم نکند
                                        e.preventDefault();
                                        const entry = flatTreeNodes[highlightedTreeIndex];
                                        if (entry && entry.node.childCount > 0) {
                                            toggleNode(entry.node, handleSelect);
                                        }
                                    }
                                }}
                            >
                                <FixedSizeList
                                    ref={treeListRef}
                                    height={360}
                                    width="100%"
                                    itemCount={flatTreeNodes.length}
                                    itemSize={44}
                                >
                                    {({ index, style }) => {
                                        const { node, depth } = flatTreeNodes[index];
                                        const isParent = node.childCount > 0;
                                        const isDummy = node.isDummy;
                                        const isExpanded = expandedItems.includes(String(node.id));
                                        const isHighlighted = index === highlightedTreeIndex;

                                        if (isDummy) {
                                            return (
                                                <div style={{ ...style, paddingRight: depth * 20 + 16, color: "#999", fontSize: 13, display: "flex", alignItems: "center" }}>
                                                    در حال بارگذاری...
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                className={`${styles.TreeRowHover} ${isHighlighted ? styles.TreeRowSelected : ""}`}
                                                style={{
                                                    ...style,
                                                    direction: "rtl",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    paddingRight: depth * 20 + 8,
                                                    paddingLeft: 8,
                                                    cursor: "pointer",
                                                    gap: 8,
                                                    boxSizing: "border-box",
                                                }}
                                                onClick={() => {
                                                    setHighlightedTreeIndex(index);
                                                    toggleNode(node, handleSelect);
                                                }}
                                            >
                                                {isParent && (
                                                    <span className={styles.TreeExpandIcon}>
                                                        {isExpanded ? (
                                                            <ExpandMoreIcon fontSize="inherit" />
                                                        ) : (
                                                            <ChevronLeftIcon fontSize="inherit" />
                                                        )}
                                                    </span>
                                                )}
                                                <span className={styles.TreeLabelContainer}>
                                                    <span>{node.name}</span>
                                                    <span className={styles.TreeCodeSpan}>({toPersianDigits(node.code)})</span>
                                                </span>
                                                {!isParent && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        className={styles.TreeSelectBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelect(node);
                                                        }}
                                                    >
                                                        انتخاب
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    }}
                                </FixedSizeList>
                            </div>
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