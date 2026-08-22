import CustomDataGrid from "../../../../components/common/CustomizedDataGrid";
import styles from "./VoucherLineGrid.module.css";
import useVoucherGrid from "./useVoucherGrid";
import { Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, TextField, List, ListItemButton, ListItemText, CircularProgress, Tabs, Tab, Box } from "@mui/material";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { toPersianDigits } from "../../../../utils/formatter";

// تعریف توابع کمکی بازگشتی خارج از کامپوننت برای جلوگیری از خطای Hoisting و رندرهای مجدد
function findNodeByCode(nodes, code) {
  if (!nodes) return null;
  for (const node of nodes) {
    if (String(node.code).trim() === String(code).trim()) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeByCode(node.children, code);
      if (found) return found;
    }
  }
  return null;
}

function findNodeById(nodes, id) {
  if (!nodes) return null;
  for (const node of nodes) {
    if (String(node.id) === String(id)) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

const VoucherLineGrid = ({ voucher, setVoucher }) => {

    const [searchTerm, setSearchTerm] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTabOverride, setActiveTabOverride] = useState(null);
    const [allAccounts, setAllAccounts] = useState([]);
    const [treeLoading, setTreeLoading] = useState(false);

    const [treeData, setTreeData] = useState([]); 
    const [expandedTreeItems, setExpandedTreeItems] = useState([]); 


    const { 
        apiRef, 
        columns, 
        processRowUpdate, 
        addLine, 
        onCellKeyDown, 
        snackbar, 
        closeSnackbar, 
        accountModal, 
        closeAccountModal, 
        selectAccountFromModal,
    } = useVoucherGrid(voucher, setVoucher, setSearchTerm, setActiveTabOverride, allAccounts, setExpandedTreeItems, setAllAccounts,setTreeData);

    const activeTab = useMemo(() => {
        if (activeTabOverride !== null) return activeTabOverride;
        return 0;
    }, [activeTabOverride]);

    const [focusedRowId, setFocusedRowId] = useState(null);

    useEffect(() => {
        if (!apiRef.current) return undefined;
        const unsubscribe = apiRef.current.subscribeEvent("cellFocusIn", (params) => {
           setFocusedRowId(params.id);
        });
        return () => unsubscribe();
    }, [apiRef]);

    const focusedLine = useMemo(() => {
        const lines = voucher && voucher.lines ? voucher.lines : [];
        return lines.find((line) => line.id === focusedRowId) || null;
    }, [voucher, focusedRowId]);

    const focusedAccountHierarchy = useMemo(() => {
        if (!focusedLine || !focusedLine.accountCode || allAccounts.length === 0) {
            return null;
        }

        const codeStr = String(focusedLine.accountCode).trim();
        const accountNode = allAccounts.find((acc) => String(acc.code).trim() === codeStr);
        if (!accountNode) return null;

        const chain = [];
        let current = accountNode;
        let depth = 0;
        const MAX_DEPTH = 20;

        while (current && depth < MAX_DEPTH) {
            chain.unshift(current);
            if (!current.parentCode) break;
            const parentCodeStr = String(current.parentCode).trim();
            current = allAccounts.find((acc) => String(acc.code).trim() === parentCodeStr) || null;
            depth += 1;
        }


        return chain;


    }, [focusedLine, allAccounts]);

    const totals = useMemo(() => {
      const lines = voucher && voucher.lines ? voucher.lines : [];     
      const totalDebit = lines.reduce((sum, line) => sum + Number(line.debtorAmount || 0), 0);
      const totalCredit = lines.reduce((sum, line) => sum + Number(line.creditorAmount || 0), 0);
      const difference = Math.abs(totalDebit - totalCredit);
      const isBalanced = totalDebit === totalCredit && lines.length > 0;

      return { totalDebit, totalCredit, difference, isBalanced };
    }, [voucher]);

    useEffect(() => {
      if (!accountModal.open) return;
      const fetchAccounts = async () => {
        setLoading(true);
        try {
          const query = searchTerm;
          const response = await axios.post("http://ecipc107:8049/api/Account/GetAll", {
            filter: query.trim(),
            forSearch: true
          });
          setAccounts(response.data || []);
        } catch (err) {
          console.error("خطا در بارگذاری حساب‌های مودال:", err);
        } finally {
          setLoading(false);
        }
      };

      const delayDebounceFn = setTimeout(() => {
        fetchAccounts();
      }, 400);

      return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, accountModal.open]);

    useEffect(() => {
      const fetchRootAccounts = async () => {
        setTreeLoading(true);
        try {
          const response = await axios.post("http://ecipc107:8049/api/Account/SearchTreeView", { code: "" });
          const roots = (response.data || []).map((item) => ({
            ...item,
            children: item.childCount > 0 ? [{ id: `${item.id}-dummy`, name: 'بارگذاری...', isDummy: true }] : []
          }));
          setTreeData(roots);
          setAllAccounts(roots);
        } catch (err) {
          console.error("خطا در دریافت حساب‌ها برای درخت:", err);
        } finally {
          setTreeLoading(false);
        }
      };

      fetchRootAccounts();
    }, []);

const loadChildrenForNode = useCallback(async (node) => {
  if (!node || node.childCount <= 0) return [];

  try {
    const response = await axios.post(
      "http://ecipc107:8049/api/Account/SearchTreeView",
      {
        code: node.code
      }
    );

    const fetchedData = response.data || [];

    const directChildren = fetchedData
      .filter(
        (item) =>
          String(item.parentCode).trim() === String(node.code).trim()
      )
      .map((item) => ({
        ...item,
        children:
          item.childCount > 0
            ? [
                {
                  id: `${item.id}-dummy`,
                  name: "بارگذاری...",
                  isDummy: true
                }
              ]
            : []
      }));

    // وارد کردن بچه‌ها داخل treeData
    setTreeData((prevTree) => {
      const updateNode = (nodes) => {
        return nodes.map((item) => {
          if (String(item.id) === String(node.id)) {
            return {
              ...item,
              children: directChildren
            };
          }

          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: updateNode(item.children)
            };
          }

          return item;
        });
      };

      return updateNode(prevTree);
    });

    // اضافه کردن حساب‌ها به کش allAccounts
    setAllAccounts((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));

      const newAccounts = directChildren.filter(
        (a) => !existingIds.has(a.id)
      );

      return [...prev, ...newAccounts];
    });

    return directChildren;
  } catch (error) {
    console.error(
      "خطا در دریافت زیرمجموعه‌های حساب:",
      error
    );

      return [];
    }
  }, [setAllAccounts]);



const handleToggleOrExpandNode = useCallback(async (node) => {
          if (!node) return;

          const isParent = node.childCount > 0;

          // اگر حساب سطح آخر است، انتخابش کن
          if (!isParent) {
              selectAccountFromModal(node);
              setSearchTerm("");
              setActiveTabOverride(null);
              return;
          }

          const nodeIdStr = String(node.id);

          // آیا این نود هنوز placeholder «در حال بارگذاری...» دارد؟
          const hasDummy =
              Array.isArray(node.children) &&
              node.children.length === 1 &&
              node.children[0].isDummy;

          // آیا قبلاً فرزندان واقعی آن را گرفته‌ایم؟
          const hasRealChildren =
              Array.isArray(node.children) &&
              node.children.length > 0 &&
              !hasDummy;

          const isExpanded = expandedTreeItems.includes(nodeIdStr);

          console.log("TREE CLICK:", {
              code: node.code,
              id: node.id,
              isExpanded,
              hasDummy,
              hasRealChildren,
              children: node.children
          });

          // =========================================================
          // اگر قبلاً بچه‌های واقعی را گرفته‌ایم:
          // فقط باز و بسته کن و دوباره API نزن
          // =========================================================
          if (hasRealChildren) {
              if (isExpanded) {
                  setExpandedTreeItems((prev) =>
                      prev.filter((id) => id !== nodeIdStr)
                  );
              } else {
                  setExpandedTreeItems((prev) => [
                      ...prev,
                      nodeIdStr
                  ]);
              }

              return;
          }

          // =========================================================
          // اینجا یعنی:
          // - هنوز بچه‌ها لود نشده‌اند
          // - یا dummy داریم
          //
          // حتی اگر isExpanded=true باشد، باز هم باید API بزنیم
          // =========================================================

          console.log("FETCH CHILDREN:", node.code);

          // اول مطمئن شو نود باز است
          setExpandedTreeItems((prev) =>
              prev.includes(nodeIdStr)
                  ? prev
                  : [...prev, nodeIdStr]
          );

          try {
console.log("🔵 TREE REQUEST:", node.code);

const response = await axios.post(
    "http://ecipc107:8049/api/Account/SearchTreeView",
    { code: node.code }
);

const fetchedData = response.data || [];

console.log("🟢 TREE RESPONSE:", node.code, fetchedData);

             

              console.log(
                  "API RESULT FOR:",
                  node.code,
                  fetchedData
              );

              // فقط فرزندان مستقیم همین حساب
              const directChildren = fetchedData
                  .filter(
                      (item) =>
                          String(item.parentCode) ===
                          String(node.code)
                  )
                  .map((item) => ({
                      ...item,
                      children:
                          item.childCount > 0
                              ? [
                                  {
                                      id: `${item.id}-dummy`,
                                      name: "بارگذاری...",
                                      isDummy: true
                                  }
                              ]
                              : []
                  }));

              console.log(
                  "DIRECT CHILDREN:",
                  node.code,
                  directChildren
              );

              // =====================================================
              // جایگزین کردن dummy با فرزندان واقعی
              // =====================================================

              setTreeData((prevTree) => {

                  const updateChildrenRecursively = (nodes) => {

                      return nodes.map((item) => {

                          if (String(item.id) === nodeIdStr) {

                              return {
                                  ...item,
                                  children: directChildren
                              };
                          }

                          if (
                              Array.isArray(item.children) &&
                              item.children.length > 0
                          ) {

                              return {
                                  ...item,
                                  children:
                                      updateChildrenRecursively(
                                          item.children
                                      )
                              };
                          }

                          return item;
                      });
                  };

                  return updateChildrenRecursively(prevTree);
              });

              // =====================================================
              // اضافه کردن حساب‌های جدید به کش allAccounts
              // =====================================================

              setAllAccounts((prev) => {

                  const existingIds = new Set(
                      prev.map((account) => account.id)
                  );

                  const newAccounts =
                      directChildren.filter(
                          (account) =>
                              !existingIds.has(account.id)
                      );

                  return [
                      ...prev,
                      ...newAccounts
                  ];
              });

          } catch (error) {

              console.error(
                  "خطا در دریافت زیرمجموعه‌های حساب:",
                  error
              );

              // اگر API خطا داد، نود را از حالت باز خارج کن
              // تا «در حال بارگذاری...» دائمی نماند
              setExpandedTreeItems((prev) =>
                  prev.filter((id) => id !== nodeIdStr)
              );
          }

      }, [
          expandedTreeItems,
          selectAccountFromModal,
          setActiveTabOverride,
          setAllAccounts,
          setSearchTerm
      ]);

    useEffect(() => {
      if (!accountModal.open) return;
      const searchVal = accountModal.initialSearch || searchTerm;
      if (!searchVal) return;

      const timer = setTimeout(async () => {
        const targetNode = findNodeByCode(treeData, searchVal);
        if (targetNode && targetNode.childCount > 0) {
          setActiveTabOverride(1);
          await handleToggleOrExpandNode(targetNode);
        }
      }, 200);

      return () => clearTimeout(timer);
    }, [
      accountModal.open, 
      accountModal.initialSearch, 
      searchTerm, 
      treeData, 
      handleToggleOrExpandNode, 
      setActiveTabOverride
    ]);

    const handleCloseModal = () => {
      setSearchTerm("");
      setActiveTabOverride(null);
      closeAccountModal();
    };

    const searchInputRef = (element) => {
      if (element && accountModal.open) {
        setTimeout(() => {
          element.focus();
          const length = element.value ? element.value.length : 0;
          if (length > 0 && typeof element.setSelectionRange === "function") {
            element.setSelectionRange(length, length);
          }
        }, 60);
      }
    };

const handleTreeKeyDown = (event) => {
      if (event.key === 'Enter') {
        const focusedElement = document.activeElement;

        if (focusedElement && focusedElement.getAttribute('role') === 'treeitem') {
          event.preventDefault();
          event.stopPropagation();

          const itemId = focusedElement.getAttribute('id')?.split('-').pop();
          if (!itemId) return;

          const targetNode = findNodeById(treeData, itemId);
          if (targetNode) {
            handleToggleOrExpandNode(targetNode);
          }
        }
      }
    };

    useEffect(() => {
      if (!accountModal.open || activeTab !== 1) return;


    // فقط در سناریوی Enter روی سلول خالی
    // اولین ریشه را فوکوس کن.
    if (!accountModal.focusFirstRoot) return;

      const observer = new MutationObserver((mutations, obs) => {
        const treeRoot = document.querySelector('.MuiSimpleTreeView-root');
        if (treeRoot) {
          obs.disconnect();

          setTimeout(() => {
            const firstRootNode = treeRoot.querySelector('[role="treeitem"] .MuiTreeItem-content') || 
                                  treeRoot.querySelector('[role="treeitem"]');
            
            if (firstRootNode && firstRootNode instanceof HTMLElement) {
              firstRootNode.setAttribute('tabindex', '0');
              firstRootNode.focus();
              firstRootNode.classList.add("Mui-focused");
              firstRootNode.classList.add("Mui-selected");

              const parentTreeItem = firstRootNode.closest('[role="treeitem"]');
              if (parentTreeItem && parentTreeItem instanceof HTMLElement) {
                parentTreeItem.setAttribute('tabindex', '0');
                parentTreeItem.focus();
              }
            }
          }, 150);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    }, [accountModal.open, activeTab, accountModal.focusFirstRoot]);

 const renderTreeItems = (nodes) => {
      return nodes.map((node) => {
        const isParent = node.childCount > 0;
        const hasDummy = node.children && node.children.length === 1 && node.children[0].isDummy;

        return (
          <TreeItem 
            key={node.id} 
            itemId={String(node.id)} 
            label={
              <div 
                className={styles.TreeLabelContainer}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleOrExpandNode(node);
                }}
              >
                <span>{node.name}</span>
                <span className={styles.TreeCodeSpan}>({toPersianDigits(node.code)})</span>
                {!isParent && (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    className={styles.TreeSelectBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      
                      if (e.currentTarget instanceof HTMLElement) {
                        e.currentTarget.blur();
                      }
                      
                      setTimeout(() => {
                        selectAccountFromModal(node);
                        setSearchTerm("");
                        setActiveTabOverride(null);
                      }, 50);
                    }}
                  >
                    انتخاب
                  </Button>
                )}
              </div>
            }
          >
            {hasDummy ? (
              <TreeItem key={`${node.id}-loading`} itemId={`${node.id}-loading`} label="در حال بارگذاری..." disabled />
            ) : (
              Array.isArray(node.children) && node.children.length > 0 ? renderTreeItems(node.children) : null
            )}
          </TreeItem>
        );
      });
    };

    return (
      <>
      <div className={styles.GHeight}>
          <CustomDataGrid 
              apiRef={apiRef}
              rows={voucher.lines}
              columns={columns}
              processRowUpdate={processRowUpdate} 
              onCellKeyDown={onCellKeyDown}
              sx={{
             '& .MuiDataGrid-footerContainer': {
                 display: 'none', // مخفی کردن کامل نوار پایینی (Total Rows و Row Selected)
             },
             '& .MuiDataGrid-overlay': {
                 fontSize: '0.9rem',
                 fontFamily: 'inherit',
             }
         }}
         localeText={{
             noRowsLabel: 'هیچ ردیفی ثبت نشده است',
         }}
          />
      </div>
          
        <Button className={styles.Bttn} variant="contained" onClick={addLine}>
          افزودن ردیف
        </Button>
        
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar}>
          <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" className={styles.AlertFont}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Dialog open={accountModal.open} onClose={handleCloseModal} fullWidth maxWidth="sm" disableEnforceFocus={true} aria-hidden={!accountModal.open} >
          <DialogTitle className={styles.ModalTitle}> انتخاب حساب </DialogTitle>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }} dir="rtl">
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTabOverride(newValue)} variant="fullWidth">
              <Tab label="جستجوی حساب" className={styles.TabFont} />
              <Tab label="ساختار درختی حساب‌ها" className={styles.TabFont} />
            </Tabs>
          </Box>

          <DialogContent dir="rtl">
            {activeTab === 0 && (
              <Box sx={{ pt: 1 }}>
                <TextField
                  fullWidth
                  placeholder="کد یا نام حساب را برای جستجو تایپ کنید..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.SearchInput}
                  inputRef={searchInputRef}
                />

                {loading ? (
                  <div className={styles.LoadingContainer}><CircularProgress size={30} /></div>
                ) : (
                  <List className={styles.AccountsList}>

                    {accounts.map((account) => {
                      const isParent = account.childCount > 0 || (account.childCount === undefined && String(account.code).length < 4);

                      return (
                        <ListItemButton 
                          key={account.id} 
                          disabled={isParent}
                          onClick={() => { 
                            if (!isParent) {
                              selectAccountFromModal(account); 
                              setSearchTerm(""); 
                            }
                          }} 
                          className={styles.AccountItem}
                        >
                          <ListItemText 
                            primary={
                              <span className={styles.AccountNameText}>
                                {account.name}
                                {isParent && <small style={{ color: 'orange', marginRight: '8px' }}>(حساب والد - غیرقابل انتخاب)</small>}
                              </span>
                            } 
                            secondary={<span className={styles.AccountCodeText}>کد حساب: {toPersianDigits(account.code)}</span>} 
                          />
                        </ListItemButton>
                      );
                    })}
                    {accounts.length === 0 && <div className={styles.EmptyResult}>هیچ حسابی یافت نشد.</div>}
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
                    expandedItems={expandedTreeItems} 
                    onExpandedItemsChange={async (event, itemIds) => {
                        const newlyExpandedId = itemIds.find(
                            (id) => !expandedTreeItems.includes(id)
                        );

                        setExpandedTreeItems(itemIds);

                        if (newlyExpandedId) {
                            const targetNode = findNodeById(
                                treeData,
                                newlyExpandedId
                            );

                            if (targetNode) {
                                await loadChildrenForNode(targetNode);
                            }
                        }
                    }}
                     onKeyDown={handleTreeKeyDown}
                  >
                    {renderTreeItems(treeData)}
                  </SimpleTreeView>

                ) : (
                  <div className={styles.EmptyResult}>ساختار درختی یافت نشد.</div>
                )}
              </Box>
            )}
          </DialogContent>
        </Dialog>

        <div dir="rtl" className={styles.SummaryBar}>

          <div className={styles.AccountHierarchyBox}>
                    {focusedAccountHierarchy ? (
                        <>
                            {focusedAccountHierarchy.map((account, index) => {

                                let label;

                                if (index === 0) {
                                    label = "گروه حساب";
                                } else if (index === 1) {
                                    label = "حساب کل";
                                } else {
                                    label = `حساب معین${index - 1}`;
                                }

                                return (
                                    <div
                                        className={styles.AccountHierarchyRow}
                                        key={account.id}
                                    >
                                        <span className={styles.SummaryLabel}>
                                            {label}:
                                        </span>

                                        <strong className={styles.AccountInfoText}>
                                            {account.name}

                                            <span className={styles.AccountInfoCode}>
                                                ({toPersianDigits(account.code)})
                                            </span>
                                        </strong>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <span className={styles.EmptyAccountText}>
                            ردیفی انتخاب نشده
                        </span>
                    )}
          </div>

          <div className={styles.BalanceBox}>
            <div className={styles.BalanceItem}>
              <span className={styles.SummaryLabel}>بستانکار:</span>
              <strong className={styles.CreditText}>{totals.totalCredit.toLocaleString()}</strong>
            </div>
            <div className={styles.BalanceItem}>
              <span className={styles.SummaryLabel}>بدهکار:</span>
              <strong className={styles.DebitText}>{totals.totalDebit.toLocaleString()}</strong>
            </div>
            <div className={styles.BalanceItem}>
              <span className={styles.SummaryLabel}>مانده:</span>
              <strong className={totals.isBalanced ? styles.StatusBalanced : styles.StatusUnbalanced}>
                {totals.isBalanced ? '۰' : totals.difference.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

     </>
    );
}

export default VoucherLineGrid;