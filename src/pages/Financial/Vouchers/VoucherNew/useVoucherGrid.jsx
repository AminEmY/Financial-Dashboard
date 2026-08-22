import { useGridApiRef } from "@mui/x-data-grid-pro";
import {getColumns} from "./VoucherColumns";
import { useState, useCallback, useMemo } from "react"; //  اضافه شدن هوک‌های ری‌اکت برای حل باگ رندر
import axios from "axios";




//  اضافه شدن استیت‌های فیلد متنی و تب‌ها به ورودی‌های هوک برای هدایت سناریوی اینتر و سرچ سریع
export default function useVoucherGrid(voucher, setVoucher, setSearchTerm, setActiveTabOverride, allAccounts, setExpandedTreeItems,setAllAccounts,setTreeData  ) {

    const apiRef = useGridApiRef();

        //  استیت و توابع مدیریت Snackbar
    // =========================================================
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "error" // می‌تواند success، info، warning یا error باشد
    });


    // =========================================================
    //  استیت‌های مدیریت مودال حساب‌ها
    // =========================================================
    const [accountModal, setAccountModal] = useState({
        open: false,
        activeRowId: null, // ذخیره شناسه سطری که قرار است حساب انتخابی روی آن بنشیند
        initialSearch: "",
        focusFirstRoot: false
    });

     //  هماهنگ‌سازی پارامترها بر اساس فیلتر متنی گرید و آیدی ردیف
 const openAccountModal = useCallback(
    (initialSearch = "", rowId = null, focusFirstRoot = false) => {
        setAccountModal({
            open: true,
            initialSearch,
            activeRowId: rowId,
            focusFirstRoot
        });

        setSearchTerm(initialSearch);
    },
    [setSearchTerm]
);

const closeAccountModal = useCallback(() => {
    setAccountModal({
        open: false,
        initialSearch: "",
        activeRowId: null,
        focusFirstRoot: false
    });
}, []);


    //     تابع نهایی کردن انتخاب حساب از داخل مودال 
const selectAccountFromModal = async (account) => {
    if (!accountModal.activeRowId || !account) return;

    // اگر حساب والد بود، اجازه انتخاب نداریم
    if (account.childCount > 0) {
        setSnackbar({
            open: true,
            message: `حساب "${account.name}" دارای زیرمجموعه است. لطفاً تا آخرین سطح درخت پیش رفته و حساب برگ را انتخاب کنید.`,
            severity: "warning"
        });
        return;
    }

    // ⭐ جدید
    // گرفتن زنجیره والدهای حساب انتخاب‌شده
    try {
        const response = await axios.post(
            "http://ecipc107:8049/api/Account/SearchTreeView",
            {
                code: String(account.code).trim()
            }
        );

        const hierarchyAccounts = response.data || [];

        if (setAllAccounts) {
            setAllAccounts((prev) => {
                const merged = [...prev];

                hierarchyAccounts.forEach((newAccount) => {
                    const index = merged.findIndex(
                        (item) =>
                            String(item.code).trim() ===
                            String(newAccount.code).trim()
                    );

                    if (index >= 0) {
                        merged[index] = newAccount;
                    } else {
                        merged.push(newAccount);
                    }
                });

                return merged;
            });
        }
    } catch (error) {
        console.error("خطا در دریافت ساختار والدهای حساب:", error);
    }

    // ادامه کد قبلی
    const updatedLines = voucher.lines.map((line) => {
        if (line.id === accountModal.activeRowId) {
            return {
                ...line,
                accountId: account.id,
                accountCode: account.code,
                accountName: account.name
            };
        }
        return line;
    });

    setVoucher((prev) => ({
        ...prev,
        lines: updatedLines
    }));

    const targetId = accountModal.activeRowId;

    setTimeout(() => {
        if (apiRef.current && apiRef.current.setCellFocus) {
            apiRef.current.setCellFocus(targetId, "sharh");
            apiRef.current.startCellEditMode({
                id: targetId,
                field: "sharh"
            });
        }
    }, 50);

    closeAccountModal();
};


    const closeSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    };



        // =========================================================
         // =========================================================
    //   تابع حذف ردیف و مرتب‌سازی شماره ردیف‌ها
   
    const deleteLine = useCallback((id) => {
        // ۱. فیلتر کردن و حذف سطر مورد نظر
        const filteredLines = voucher.lines.filter((line) => line.id !== id);

        // ۲. بازنشانی شماره ردیف‌ها (field: row) از ۱ تا آخر تا ترتیب شماره‌ها به هم نریزد
        const reIndexedLines = filteredLines.map((line, index) => ({
            ...line,
            row: index + 1
        }));

        // ۳. آپدیت استیت اصلی سند
        setVoucher((prev) => ({
            ...prev,
            lines: reIndexedLines
        }));
    }, [voucher.lines, setVoucher]);

// تولید ستون‌ها همراه با پاس دادن تابع حذف به آن‌ها و پاس دادن آرایه سطرها به ستون‌ها برای استخراج تاریخچه شرح‌ها و انتخاب حساب
    //   استفاده از useMemo و کالبک ناشناس برای حل کامل باگ Cannot access refs during render متیریال یو‌آی
    // تولید ستون‌ها همراه با پاس دادن تابع حذف، کالبک مودال و توابع تغییر استیت تب‌ها و سرچ
    //   پاس دادن setSearchTerm و setActiveTabOverride به تابع getColumns
    //  آرگومان‌های پنجم و ششم (allAccounts و setExpandedTreeItems) به تابع getColumns اضافه شدند
const dynamicColumns = useMemo(() => {
    return getColumns(
        deleteLine, 
        (...args) => openAccountModal(...args),
        setSearchTerm,       
        setActiveTabOverride
    );
}, [deleteLine, openAccountModal, setSearchTerm, setActiveTabOverride]);



   


//  رد کردن سطر دارای فرزند و ریست کردن سلول
const processRowUpdate = async (newRow, oldRow) => {
        const updatedRow = { ...newRow };

        // ۱. منطق بدهکار و بستانکار خودتان 
        const debtor = Number(updatedRow.debtorAmount || 0);
        const creditor = Number(updatedRow.creditorAmount || 0);
        const oldDebtor = Number(oldRow.debtorAmount || 0);
        const oldCreditor = Number(oldRow.creditorAmount || 0);

        if (debtor !== 0 && debtor !== oldDebtor) {
            updatedRow.creditorAmount = 0;
        } else if (creditor !== 0 && creditor !== oldCreditor) {
            updatedRow.debtorAmount = 0;
        }

        // ۲. ذخیره شرح در حافظه مرورگر
        if (updatedRow.sharh && updatedRow.sharh.trim() !== "") {
            const localData = localStorage.getItem("sharh_history");
            let currentHistory = localData ? JSON.parse(localData) : [];
            currentHistory.push(updatedRow.sharh.trim());
            const uniqueHistory = Array.from(new Set(currentHistory));
            localStorage.setItem("sharh_history", JSON.stringify(uniqueHistory));
        }

                //  بررسی فرزند داشتن حساب بر اساس کدهای واقعی سرور
if (updatedRow.accountCode && updatedRow.accountCode !== oldRow.accountCode) {
            const typedCode = updatedRow.accountCode.trim();
            const typedCodeStr = String(typedCode);

            try {
                // 🔍 این درخواست، هم خودِ حساب تایپ‌شده (با childCount دقیق)، هم زنجیره والدهاش رو برمی‌گردونه
                const response = await axios.post("http://ecipc107:8049/api/Account/SearchTreeView", {
                    code: typedCodeStr
                });

                const fetchedAccounts = response.data || [];

                // ✨ نتایج تازه رو با allAccounts موجود ادغام می‌کنیم (بدون تکراری‌شدن) تا کش کم‌کم کامل بشه
                if (setAllAccounts) {
                    setAllAccounts((prev) => {
                        const merged = [...prev];
                        fetchedAccounts.forEach((acc) => {
                            const existingIndex = merged.findIndex((m) => String(m.code).trim() === String(acc.code).trim());
                            if (existingIndex >= 0) {
                                merged[existingIndex] = acc;
                            } else {
                                merged.push(acc);
                            }
                        });
                        return merged;
                    });
                }

                const accountNode = fetchedAccounts.find((acc) => String(acc.code).trim() === typedCodeStr);

                if (!accountNode) {
                    updatedRow.accountCode = "";
                    updatedRow.accountId = null;
                    updatedRow.accountName = "";
                    setSnackbar({ open: true, message: "کد حساب وارد شده در سیستم معتبر نیست.", severity: "error" });
                    return oldRow;
                }

                // دیگه نیازی به حدس زدن با startsWith نیست؛ childCount مستقیم از سرور میاد
                const hasChildren = accountNode.childCount > 0;

            if (hasChildren) {
                // 🚨 حساب فرزند دارد! یعنی سطح آخر نیست.
                setSnackbar({
                    open: true,
                    message: "کد حساب " + typedCode + " دارای " + accountNode.childCount + " زیرمجموعه است. لطفاً حساب سطح آخر را انتخاب کنید.",
                    severity: "warning"
                });

                // ✨ دنبال کردن زنجیره واقعی والدها با فیلد parentCode (به‌جای حدس زدن با پیشوند کد)
                const parentsToOpen = [];
                let current = accountNode;
                let depth = 0;
                const MAX_DEPTH = 10; // فقط برای جلوگیری از حلقه بی‌نهایت در صورت دیتای خراب

                while (current && depth < MAX_DEPTH) {
                    parentsToOpen.unshift(String(current.id));
                    if (!current.parentCode) break;
                    const parentCodeStr = String(current.parentCode).trim();
                    current = fetchedAccounts.find((acc) => String(acc.code).trim() === parentCodeStr)
                        || allAccounts.find((acc) => String(acc.code).trim() === parentCodeStr)
                        || null;
                    depth += 1;
                            }
            // باز کردن مودال درخت حساب‌ها
            setTimeout(() => {
                setActiveTabOverride(1);

                // مسیر والدها را باز نگه می‌داریم
                setExpandedTreeItems(parentsToOpen);

                // =====================================================
                // ⭐ مهم:
                // بچه‌های تمام نودهای مسیر را از پاسخ API داخل treeData می‌ریزیم
                // =====================================================
setTreeData((prevTree) => {

    const buildChildren = (item) => {

        // بچه‌های مستقیم این حساب
        const directChildren = fetchedAccounts
            .filter(
                (acc) =>
                    String(acc.parentCode).trim() ===
                    String(item.code).trim()
            )
            .map((acc) => {

                // اگر این بچه خودش یکی از والدهای مسیر است،
                // بچه‌های خودش را هم همین الان بساز
                if (parentsToOpen.includes(String(acc.id))) {
                    return {
                        ...acc,
                        children: buildChildren(acc)
                    };
                }

                // در غیر این صورت فقط dummy نشان بده
                return {
                    ...acc,
                    children:
                        acc.childCount > 0
                            ? [
                                {
                                    id: `${acc.id}-dummy`,
                                    name: "بارگذاری...",
                                    isDummy: true
                                }
                            ]
                            : []
                };
            });

        return directChildren;
    };


    const updateTreeRecursively = (nodes) => {

        return nodes.map((item) => {

            // اگر این نود یکی از مسیرهای ماست
            if (parentsToOpen.includes(String(item.id))) {

                return {
                    ...item,
                    children: buildChildren(item)
                };
            }

            // در سایر شاخه‌ها دنبال نود موردنظر بگرد
            if (Array.isArray(item.children) && item.children.length > 0) {

                return {
                    ...item,
                    children: updateTreeRecursively(item.children)
                };
            }

            return item;
        });
    };

    return updateTreeRecursively(prevTree);
});

                // مودال را باز کن
                openAccountModal("", newRow.id);

                const typedCodeStr = String(typedCode).trim();

                // =====================================================
                // ⭐ بعد از رندر شدن درخت، خود حساب تایپ‌شده را پیدا کن
                // و روی همان فوکوس کن
                // =====================================================
                const observer = new MutationObserver((mutations, obs) => {

         console.log("🔥 ACCOUNT TREE OBSERVER RUNNING");

                    const treeRoot = document.querySelector(
                        ".MuiSimpleTreeView-root"
                    );
         console.log("🔥 TREE ROOT:", treeRoot);  
                    if (!treeRoot) return;

                 let nodeElement = null;
                
                 // پیدا کردن مستقیم خود TreeItem با ID واقعی حساب
                 // چون کد داخل UI ممکن است فارسی (۷۱) نمایش داده شود
                 const targetElement = treeRoot.querySelector(
                     `[id$="-${accountNode.id}"]`
                 );
                
                 if (targetElement) {
                     nodeElement = targetElement.querySelector(
                         ".MuiTreeItem-content"
                     );
                
                     if (!nodeElement) {
                         nodeElement = targetElement;
                     }
                 }
                
                 console.log("🎯 TARGET ELEMENT:", targetElement);
                 console.log("🎯 NODE ELEMENT:", nodeElement);

                    if (nodeElement) {

                        obs.disconnect();
                 

                        requestAnimationFrame(() => {

                            setTimeout(() => {

                                nodeElement.scrollIntoView({
                                    block: "center",
                                    behavior: "smooth"
                                });

                           const treeItem =
                               nodeElement.closest('[role="treeitem"]');
                
                           if (treeItem instanceof HTMLElement) {
                               treeItem.focus();
                               treeItem.classList.add("Mui-focused");
                               treeItem.classList.add("Mui-selected");
                
                               console.log(
                                   "🎯 FOCUS ON ACCOUNT:",
                                   typedCodeStr,
                                   document.activeElement
                               );
                           }


                            }, 220);
                        });
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
        console.log("🔥 OBSERVER STARTED");
                setTimeout(() => {
                    observer.disconnect();
                }, 3000);

            }, 50);

                return oldRow;
            }

            // 🎯 سناریو: حساب فرزند ندارد و آخرین سطح است -> از همون accountNode بالا استفاده می‌کنیم
            updatedRow.accountId = accountNode.id;
            updatedRow.accountName = accountNode.name;

                setTimeout(() => {
                    if (apiRef.current && apiRef.current.setCellFocus) {
                        apiRef.current.setCellFocus(newRow.id, "sharh");
                        apiRef.current.startCellEditMode({ id: newRow.id, field: "sharh" });
                    }
                }, 80);

            } catch (error) {
                console.error("API Error:", error);
                return oldRow;
            }

        }


        // ۵. آپدیت نهایی استیت در صورت معتبر بودن حساب
        const updatedLines = voucher.lines.map((line) =>
            line.id === newRow.id ? updatedRow : line
        );
        setVoucher((prev) => ({ ...prev, lines: updatedLines }));
        return updatedRow;
    };




//  نسخه اصلاح‌شده و بهینه تابع addLine در فایل 
const addLine = useCallback(() => {
    //  [جلوگیری از ایجاد سطر بدون کد حساب] 
    if (voucher.lines.length > 0) {
        const lastLine = voucher.lines[voucher.lines.length - 1];
        // اگر کد حساب آخرین سطر خالی بود، پیام داده و عملیات را متوقف کن
        if (!lastLine.accountCode || lastLine.accountCode.trim() === "") {
            //  از استیت اسنک‌بار استفاده می‌کنیم
            setSnackbar({
                open: true,
                message: "لطفاً ابتدا کد حساب ردیف فعلی را وارد کنید",
                severity: "warning"
            });
            return;
        }
    }

    const newId = Date.now();
    const newRow = {
        id: newId,
        row: voucher.lines.length + 1,
        accountId: null,
        accountCode: "",
        accountName: "",
        sharh: "",
        debtorAmount: 0,
        creditorAmount: 0,
    };

    setVoucher((prev) => ({
        ...prev,
        lines: [...prev.lines, newRow],
    }));

    //   فوکوس ایمن روی سطر جدید با تاخیر ۵۰ میلی‌ثانیه‌ای
    setTimeout(() => {
        if (apiRef.current && apiRef.current.setCellFocus) {
            apiRef.current.setCellFocus(newId, "accountCode");
            apiRef.current.startCellEditMode({
                id: newId,
                field: "accountCode",
            });
        }
    }, 50);
}, [voucher.lines, setVoucher, apiRef]); // 👈 اضافه کردن وابستگی‌ها برای عملکرد صحیح

    //  برگرداندن تابع به منطق حرکتی جهت‌نماها و اینتر عمومی 
const onCellKeyDown = useCallback((params, event) => {
        const visibleColumns = apiRef.current.getVisibleColumns();
        const currentColumnIndex = visibleColumns.findIndex((col) => col.field === params.field);

        //  اصلاح برعکس بودن کلیدهای چپ و راست در حالت فارسی
        // =========================================================
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (apiRef.current.getCellMode(params.id, params.field) === 'edit') {
                return; 
            }
            const invertedKey = event.key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
            Object.defineProperty(event, 'key', {
                get: function() { return invertedKey; }
            });

            // const step = invertedKey === 'ArrowRight' ? 1 : -1;
            // const targetColumn = visibleColumns[currentColumnIndex + step];
            
            // if (targetColumn && targetColumn.field === 'accountName') {
            //     event.preventDefault();
            //     const skipStep = invertedKey === 'ArrowRight' ? 2 : -2;
            //     const finalColumn = visibleColumns[currentColumnIndex + skipStep];
            //     if (finalColumn) {
            //         apiRef.current.setCellFocus(params.id, finalColumn.field);
            //     }
            //     return;
            // }
            return;
        }

        // مدیریت کلید Enter عمومی 
        if (event.key === 'Enter') {
            //   فیکس اصلی: اگر روی ستون کد حساب بودیم، تمام منطق‌های قدیمی باز کردن دستی مودال را پاک می‌کنیم.
            //  فقط اجازه می‌دهیم سلول از حالت ادیت خارج شود و کارهای ثبت طبیعی گرید را جلو ببرد.
            if (params.field === 'accountCode') {
                if (apiRef.current.getCellMode(params.id, params.field) === 'edit') {
                    apiRef.current.stopCellEditMode({ id: params.id, field: params.field });
                }
                // قطع اجرای کدهای بعدی جابه‌جایی سطر، تا متد processRowUpdate شانس ثبت و تغییر استیت را داشته باشد
                return; 
            }

            // روال عادی کلید اینتر برای سایر ستون‌ها (شرح، بدهکار، بستانکار )
            if (apiRef.current.getCellMode(params.id, params.field) === 'edit') {
                apiRef.current.stopCellEditMode({ id: params.id, field: params.field });
            }

            event.defaultMuiPrevented = true;
            
            if (params.field === 'creditorAmount') {
                setTimeout(() => {
                    addLine();
                }, 50);
                return;
            }

            if (currentColumnIndex < visibleColumns.length - 1) {
                // let nextColumn = visibleColumns[currentColumnIndex + 1];

                // if (nextColumn.field === 'accountName') {
                //     nextColumn = visibleColumns[currentColumnIndex + 2];
                // }
                const nextColumn = visibleColumns[currentColumnIndex + 1];
                if (nextColumn) {
                    setTimeout(() => {
                        apiRef.current.setCellFocus(params.id, nextColumn.field);
                        apiRef.current.startCellEditMode({ id: params.id, field: nextColumn.field });
                    }, 0);
                }
            }
        }


    //  اضافه کردن وابستگی‌های جا افتاده به انتهای تابع onCellKeyDown:
}, [apiRef, addLine,]);




    // خروجی نهایی هوک همراه با اضافه شدن متد کلیدها و ستون‌های داینامیک اصلاح شده
    return { 
        apiRef, 
        columns: dynamicColumns, 
        processRowUpdate, 
        addLine, 
        onCellKeyDown, 
        snackbar, 
        closeSnackbar, 
        accountModal, 
        closeAccountModal, 
        selectAccountFromModal,
         
    }; 
}




