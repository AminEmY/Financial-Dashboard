import CustomDataGrid from "../../../../components/common/CustomizedDataGrid";
import styles from "./VoucherLineGrid.module.css";
import useVoucherGrid from "./useVoucherGrid";
import {Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, TextField, List, ListItemButton, ListItemText, CircularProgress,Tabs, Tab, Box  } from "@mui/material"; //  ایمپورت‌های جدید متیریال
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'; // ایمپورت‌های کامپوننت درخت
import { useEffect , useState , useMemo } from "react";
import axios from "axios";


const VoucherLineGrid = ({ voucher, setVoucher }) => {

      

      // =========================================================
    // استیت‌های بخش جستجوی متنی    
    const [searchTerm, setSearchTerm] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    // ✨ استیت‌های جدید برای مدیریت تب‌ها و دیتای ساختار درختی
    const [activeTabOverride, setActiveTabOverride] = useState(null); // 0 برای سرچ، 1 برای درخت
    const [allAccounts, setAllAccounts] = useState([]); // ذخیره کل حساب‌ها برای ساخت درخت
    const [treeLoading, setTreeLoading] = useState(false);

        //  استیت نگه‌دارنده شاخه‌های باز شده درخت !
    const [expandedTreeItems, setExpandedTreeItems] = useState([]); 



     //  پاس دادن توابع تغییر استیت فیلد متنی و تب‌ها به هوک، برای برطرف کردن خطای Not Defined و همگام‌سازی دکمه‌ها
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
    
    } = useVoucherGrid(voucher, setVoucher, setSearchTerm, setActiveTabOverride, allAccounts, setExpandedTreeItems)


    // ⭐️ [تغییر مهم] محاسبه داینامیک تب فعال بر اساس وضعیت فشرده شدن کلیدها در هوک
    const activeTab = useMemo(() => {
        if (activeTabOverride !== null) return activeTabOverride;
        return 0; // مقدار پیش‌فرض تب اول
    }, [activeTabOverride]);



    
  // ۳. محاسبه آنی و زنده جمع کل مبالغ و وضعیت تراز سند (مشابه راهکاران)
  const totals = useMemo(() => {
    // اگر کلاً شیء voucher یا آرایه lines وجود نداشت، یک آرایه خالی [] بگذار تا باگ نخوریم
    const lines = voucher && voucher.lines ? voucher.lines : [];     
    const totalDebit = lines.reduce((sum, line) => sum + Number(line.debtorAmount || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + Number(line.creditorAmount || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = totalDebit === totalCredit && lines.length > 0;

    return { totalDebit, totalCredit, difference, isBalanced };
  }, [voucher]);



    // هر زمان مودال باز شد یا کاربر عبارتی برای جستجو تایپ کرد، لیست لود می‌شود
 const currentSearchValue = accountModal.open && !searchTerm ? (accountModal.initialSearch || "") : searchTerm;

  // ۳. دریافت و فیلتر کردن لیست حساب‌ها از سرور با تکنیک Debounce (تاخیر ۴۰۰ میلی‌ثانیه‌ای)
  useEffect(() => {
    if (!accountModal.open) return;

    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const response = await axios.post("http://ecipc107:8049/api/Account/GetAll", {
          filter: currentSearchValue.trim(),
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
  }, [currentSearchValue, accountModal.open]);


  // افکت لود کل حساب‌ها برای ساخت درخت
 // ⭐️ افکت اصلاح شده در فایل VoucherLineGrid.jsx را به این شکل تغییر دهید:
// ⭐️ این افکت را در فایل VoucherLineGrid.jsx جایگزین افکت قبلی درخت کنید:
useEffect(() => {
  // شرط باز بودن مودال حذف شد تا به محض ورود کاربر به صفحه سند، دیتای مرجع حساب‌ها لود و آماده شود
  const fetchAllAccountsForTree = async () => {
    setTreeLoading(true);
    try {
      const response = await axios.post("http://ecipc107:8049/api/Account/GetAll", {
        filter: "", 
        forSearch: false
      });
      setAllAccounts(response.data || []);
    } catch (err) {
      console.error("خطا در دریافت حساب‌ها برای درخت:", err);
    } finally {
      setTreeLoading(false);
    }
  };

  fetchAllAccountsForTree();
}, []); // 👈 آرایه وابستگی خالی است تا فقط یک‌بار در ابتدای لود صفحه اجرا شود




   // ✨ الگوریتم هوشمند تبدیل لیست به درخت بر اساس طول کد حساب (کاملاً فیکس شده)
    const structuredTreeData = useMemo(() => {
      if (allAccounts.length === 0) return [];

      // ۱. مرتب‌سازی از کدهای کوتاه (گروه) به بلند (تفصیلی)
      const sortedAccounts = [...allAccounts].sort((a, b) => String(a.code).length - String(b.code).length);
      
      const roots = [];
      const nodesMap = {};

      sortedAccounts.forEach(acc => {
        const node = { ...acc, children: [] };
        nodesMap[acc.code] = node;

        const codeStr = String(acc.code);
        const codeLength = codeStr.length;

        let parentNode = null;

        if (codeLength > 1) {
          // پیدا کردن کدهای پدری که این کد با آن‌ها شروع می‌شود
          const possibleParents = Object.keys(nodesMap)
            .filter(pCode => pCode !== codeStr && codeStr.startsWith(pCode))
            .sort((a, b) => b.length - a.length); // انتخاب نزدیک‌ترین پدر (بلندترین کد منطبق)

          if (possibleParents.length > 0) {
            const targetParentCode = possibleParents[0];
            parentNode = nodesMap[targetParentCode];
          }
        }

        if (parentNode) {
          parentNode.children.push(node);
        } else {
          roots.push(node); // کدهای تک رقمی بدون پدر مستقیم در ریشه قرار می‌گیرند
        }
      });

      return roots;
    }, [allAccounts]);



  const handleCloseModal = () => {
    setSearchTerm("");
    setActiveTabOverride(null); // ⭐️ [تغییر مهم] ریست کردن مقدار اورراید تب‌ها هنگام بستن مودال
    closeAccountModal();
  };


    // ⭐️ [تغییر مهم] اضافه شدن تابع فوکوس خودکار هوشمند بدون پرش صفحه که بالاتر درباره‌اش صحبت کردیم
  const searchInputRef = (element) => {
    if (element && accountModal.open) {
      setTimeout(() => {
        element.focus();
        const length = element.value ? element.value.length : 0;
        if (length > 0 && typeof element.setSelectionRange === "function") {
          element.setSelectionRange(length, length);
        }
      }, 60); // تاخیر کوچک جهت اطمینان از رندر کامل مودال در DOM
    }
  };

  // ⭐️ [تغییر مهم] تابع کمکی بازگشتی برای پیدا کردن یک حساب خاص از درون درخت با استفاده از ID جهت استفاده در رویداد کلید اینتر
  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (String(node.id) === String(id)) return node;
      if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // ⭐️ [تغییر مهم] شنود کلید اینتر روی گره‌های درخت و انتخاب مستقیم حساب بدون نیاز به موس (طبق سناریوی شما)
  const handleTreeKeyDown = (event) => {
    if (event.key === 'Enter') {
      const focusedElement = document.activeElement;
      if (focusedElement && focusedElement.getAttribute('role') === 'treeitem') {
        const itemId = focusedElement.getAttribute('id')?.split('-').pop(); 
        if (itemId) {
          const targetNode = findNodeById(structuredTreeData, itemId);
          // بررسی اینکه حساب حتماً آخرین سطح (بدون فرزند) باشد تا گروه حساب اشتباهاً انتخاب نشود
          if (targetNode && (!targetNode.children || targetNode.children.length === 0)) {
            event.preventDefault();
            event.stopPropagation();
            
            if (focusedElement instanceof HTMLElement) {
              focusedElement.blur();
            }
            
            setTimeout(() => {
              selectAccountFromModal(targetNode);
              setSearchTerm("");
              setActiveTabOverride(null); 
            }, 50);
          }
        }
      }
    }
  };

  // تابع بازگشتی رندر درخت حساب‌ها
  const renderTreeItems = (nodes) => {
    return nodes.map((node) => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;

      return (
        <TreeItem 
          key={node.id} 
          itemId={String(node.id)} // 🎯 آیدی گره بر اساس آیدی عددی دیتابیس است و با parentsToOpen همخوانی دارد 
          label={
            <div className={styles.TreeLabelContainer}>
              <span>{node.name}</span>
              <span className={styles.TreeCodeSpan}>({node.code})</span>
              {/* دکمه انتخاب فقط برای آخرین لایه حساب‌ها که زیرمجموعه ندارند فعال می‌شود */}
              {!hasChildren && (
                <Button 
                      size="small" 
                      variant="outlined" 
                      className={styles.TreeSelectBtn}
                      onClick={(e) => {
                        e.stopPropagation(); // جلوگیری از حرکت یا باز و بسته شدن شاخه‌های درخت
                        
                        // ۱. آزاد کردن فوکوس جاری برای جلوگیری از باگ aria-hidden
                        if (e.currentTarget instanceof HTMLElement) {
                          e.currentTarget.blur();
                        }
                        
                        // ۲. اجرای با تاخیر فرآیند انتخاب و بستن مودال
                        setTimeout(() => {
                          selectAccountFromModal(node);
                          setSearchTerm("");
                          setActiveTabOverride(null); // ریست کردن تب‌ها
                        }, 50);
                      }}
                    >
                      انتخاب
                 </Button>
              )}
            </div>
          }
        >
          {hasChildren ? renderTreeItems(node.children) : null}
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
        />
    </div>
        
      <div dir="rtl" className={styles.SummaryBar}>
        <div className={styles.SummaryItem}>
          <span className={styles.SummaryLabel}>جمع بدهکار:</span>
          <strong className={styles.DebitText}>{totals.totalDebit.toLocaleString()}</strong>
        </div>
        <div className={styles.SummaryItem}>
          <span className={styles.SummaryLabel}>جمع بستانکار:</span>
          <strong className={styles.CreditText}>{totals.totalCredit.toLocaleString()}</strong>
        </div>
        <div className={styles.SummaryItem}>
          <span className={styles.SummaryLabel}>وضعیت سند:</span>
          <strong className={totals.isBalanced ? styles.StatusBalanced : styles.StatusUnbalanced}>
            {totals.isBalanced ? 'تراز' : `مغایرت: ${totals.difference.toLocaleString()}`}
          </strong>
        </div>
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
          {/* ⭐️ [تغییر مهم] اتصال متغیرهای تب به استیت‌های سراسری همگام شده با هوک */}
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTabOverride(newValue)} variant="fullWidth">
            <Tab label="جستجوی سریع متنی" className={styles.TabFont} />
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
                value={currentSearchValue}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.SearchInput}
                
                // ⭐️ [تغییر مهم] اضافه شدن ویژگی رف فیکس برای فوکوس قطعی و بدون پرش صفحه روی فیلد اصلی مودال
                inputRef={searchInputRef}
              />

              {loading ? (
                <div className={styles.LoadingContainer}><CircularProgress size={30} /></div>
              ) : (
                <List className={styles.AccountsList}>
                  {accounts.map((account) => (
                    <ListItemButton 
                      key={account.id} 
                      onClick={() => { selectAccountFromModal(account); setSearchTerm(""); }} 
                      className={styles.AccountItem}
                    >
                      <ListItemText 
                        primary={<span className={styles.AccountNameText}>{account.name}</span>} 
                        secondary={<span className={styles.AccountCodeText}>کد حساب: {account.code}</span>} 
                      />
                    </ListItemButton>
                  ))}
                  {accounts.length === 0 && <div className={styles.EmptyResult}>هیچ حسابی یافت نشد.</div>}
                </List>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ pt: 2 }} className={styles.TreeWrapper}>
              {treeLoading ? (
                <div className={styles.LoadingContainer}><CircularProgress size={30} /></div>
              ) : structuredTreeData.length > 0 ? (
                // ⭐️ [تغییر مهم] اضافه شدن شنود کلید برای انتخاب مستقیم ردیف با اینتر از داخل درخت حساب‌ها
                <SimpleTreeView 
                  expandedItems={expandedTreeItems} 
                  onExpandedItemsChange={(event, itemIds) => setExpandedTreeItems(itemIds)}                  
                  onKeyDown={handleTreeKeyDown}
                >
                  {renderTreeItems(structuredTreeData)}
                </SimpleTreeView>

              ) : (
                <div className={styles.EmptyResult}>ساختار درختی یافت نشد.</div>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

   </>
  );
}

export default VoucherLineGrid;
