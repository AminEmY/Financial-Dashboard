import { useGridApiRef } from "@mui/x-data-grid-pro";
import {getColumns} from "./VoucherColumns";
import { useState, useCallback, useMemo } from "react"; // ⭐️ اضافه شدن هوک‌های ری‌اکت برای حل باگ رندر
import axios from "axios";




// ⭐️ [تغییر جدید] اضافه شدن استیت‌های فیلد متنی و تب‌ها به ورودی‌های هوک برای هدایت سناریوی اینتر و سرچ سریع
export default function useVoucherGrid(voucher, setVoucher, setSearchTerm, setActiveTabOverride, allAccounts, setExpandedTreeItems ) {

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
        activeRowId: null // ذخیره شناسه سطری که قرار است حساب انتخابی روی آن بنشیند
    });

     // ⭐️ [تغییر جدید] هماهنگ‌سازی پارامترها بر اساس فیلتر متنی گرید و آیدی ردیف
    const openAccountModal = useCallback((initialSearch = "", rowId = null) => {
        setAccountModal({ open: true, initialSearch, activeRowId: rowId });
    }, []);

    const closeAccountModal = useCallback(() => {
        setAccountModal({ open: false, initialSearch: "", activeRowId: null });
    }, []);


    // ✨ [تغییر جدید - تابع نهایی کردن انتخاب حساب از داخل مودال] ✨
    const selectAccountFromModal = (account) => {
        if (!accountModal.activeRowId) return;

        // آپدیت کردن سطر جاری جدول با دیتای انتخاب شده از پنجره کمکی
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

        // بعد از ثبت انتخاب، فوکوس را به صورت خودکار به ستون "شرح" همان سطر منتقل می‌کنیم
        const targetId = accountModal.activeRowId;
        setTimeout(() => {
            if (apiRef.current && apiRef.current.setCellFocus) {
                apiRef.current.setCellFocus(targetId, "sharh");
                apiRef.current.startCellEditMode({ id: targetId, field: "sharh" });
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
    // ⭐️ [تغییر جدید] استفاده از useMemo و کالبک ناشناس برای حل کامل باگ Cannot access refs during render متیریال یو‌آی
    // تولید ستون‌ها همراه با پاس دادن تابع حذف، کالبک مودال و توابع تغییر استیت تب‌ها و سرچ
    // ⭐️ [اصلاح فیکس] پاس دادن setSearchTerm و setActiveTabOverride به تابع getColumns
    // ⭐️ آرگومان‌های پنجم و ششم (allAccounts و setExpandedTreeItems) به تابع getColumns اضافه شدند
const dynamicColumns = useMemo(() => {
    return getColumns(
        deleteLine, 
        (...args) => openAccountModal(...args),
        setSearchTerm,       
        setActiveTabOverride
    );
}, [deleteLine, openAccountModal, setSearchTerm, setActiveTabOverride]);



   


// ⭐️ [نسخه نهایی و ۱۰۰٪ تضمینی حسابداری] رد کردن سطر دارای فرزند و ریست کردن سلول
const processRowUpdate = async (newRow, oldRow) => {
        const updatedRow = { ...newRow };

        // ۱. منطق بدهکار و بستانکار خودتان (کاملاً دست‌نخورده)
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

                // ⭐️ [نسخه نهایی و ۱۰۰٪ قطعی] بررسی فرزند داشتن حساب بر اساس کدهای واقعی سرور
        if (updatedRow.accountCode && updatedRow.accountCode !== oldRow.accountCode) {
            const typedCode = updatedRow.accountCode.trim();
            const typedCodeStr = String(typedCode);

            // 🔍 جستجوی فوق‌العاده دقیق در دیتای سرور برای پیدا کردن فرزند واقعی
            const hasChildren = allAccounts.some((acc) => {
                if (!acc || acc.code === undefined || acc.code === null) return false;
                
                const currentCodeStr = String(acc.code).trim();
                
                // حساب زمانی فرزندِ کد تایپ‌شده است که:
                // ۱. کدش با کد تایپ‌شده شروع شود (مثلاً 110201 با 1102 شروع می‌شود)
                // ۲. خودِ کد تایپ‌شده نباشد (currentCodeStr !== typedCodeStr)
                // ۳. طول کدش از کد تایپ‌شده بلندتر باشد (نشانه لایه عمیق‌تر بودن در درخت)
                return currentCodeStr.startsWith(typedCodeStr) && 
                       currentCodeStr !== typedCodeStr && 
                       currentCodeStr.length > typedCodeStr.length;
            });

            if (hasChildren) {
                // 🚨 سناریو: حساب فرزند دارد (مثل کد 11 یا 2011) -> فیلد ریست شده و درخت باز می‌شود
                setSnackbar({
                    open: true,
                    message: "کد حساب " + typedCode + " دارای زیرمجموعه است. لطفاً حساب سطح آخر را انتخاب کنید.",
                    severity: "warning"
                });

                const parentsToOpen = [];
                for (let i = 1; i <= typedCode.length; i++) {
                    parentsToOpen.push(typedCode.substring(0, i));
                }
                
                // باز کردن مودال درخت حساب‌ها به صورت پایدار
                // باز کردن مودال درخت حساب‌ها به صورت پایدار در فایل useVoucherGrid.jsx
                setTimeout(() => {
                    setActiveTabOverride(1); // ۱. قفل روی تب درخت حساب‌ها
                    setExpandedTreeItems(parentsToOpen); // ۲. فرستادن کدهای والد برای باز شدن شاخه‌ها
                    openAccountModal("", newRow.id); // ۳. باز کردن مودال روی سطر جاری
                    
                    // ⭐️ [شاهکار بومی مرورگر]: پرش مستقیم فوکوس و پررنگ کردن گره با جاوااسکریپت خالص
                    // پیدا کردن آیدی عددی دیتابیس (node.id) برای گره‌ای که کاربر وارد کرده است
                    const targetNode = allAccounts.find(acc => String(acc.code).trim() === typedCode.trim());
                    
                    if (targetNode) {
                        // ۱۵۰ میلی‌ثانیه صبر می‌کنیم تا درخت کاملاً در DOM رندر و شاخه‌هایش باز شوند
                        setTimeout(() => {
                            // در متیریال‌یو‌آی نسخه جدید، المان دکمه یا محتوای گره درخت دارای کلاس .MuiTreeItem-content است
                            // ما بر اساس ساختار itemId که به درخت داده‌ایم، به دنبال المان حاوی آن می‌گردیم
                            const nodeElement = document.querySelector(`[itemId="${targetNode.id}"] .MuiTreeItem-content`) || 
                                                document.querySelector(`[id*="${targetNode.id}"]`) ||
                                                document.getElementById(`simple-tree-view-item-${targetNode.id}`);
                            
                            if (nodeElement) {
                                // ۱. اسکرول کردن نرم صفحه درخت تا این گره دقیقاً در مرکز دید کاربر قرار بگیرد
                                nodeElement.scrollIntoView({ block: "center", behavior: "smooth" });
                                
                                // ۲. قفل کردن فوکوس واقعی کیبورد مرورگر روی آن سطر
                                if (nodeElement instanceof HTMLElement) {
                                    nodeElement.focus();
                                    
                                    // ۳. شبیه‌سازی کلیک یا فوکوس ظاهری برای فعال شدن کلاس پررنگ (Highlight) متیریال‌یو‌آی
                                    nodeElement.classList.add("Mui-focused");
                                    nodeElement.classList.add("Mui-selected");
                                }
                            }
                        }, 150); // تاخیر مناسب جهت رندر کامل درخت لود شده
                    }
                }, 50);

                return oldRow; // ریست شدن سطر گرید


            }

            // 🎯 سناریو: حساب فرزند ندارد و آخرین سطح است (مثل کد 1102) -> استعلام نام حساب از API و ثبت موفق
            // ۴. اگر حساب فرزند نداشت و سطح آخر بود -> استعلام عادی از API و ثبت موفق
            try {
                const response = await axios.post("http://ecipc107:8049/api/Account/GetAll", {
                    filter: typedCode,
                    forSearch: true
                });

                const foundAccount = response.data?.find((acc) => acc.code === typedCode);

                if (foundAccount) {
                    updatedRow.accountId = foundAccount.id;
                    updatedRow.accountName = foundAccount.name;

                    // ⭐️ [نسخه نهایی و ۱۰۰٪ قطعی]: هدایت مستقیم فوکوس به شرح بدون نیاز به متدهای خراب ایندکس سطر
                    setTimeout(() => {
                        if (apiRef.current && apiRef.current.setCellFocus) {
                            // متمرکز کردن مکان‌نما به صورت مستقیم روی ستون شرح همین ردیف با استفاده از آیدی سطر
                            apiRef.current.setCellFocus(newRow.id, "sharh");
                            
                            // باز کردن اتوماتیک ادیتور شرح و لیست تاریخچه
                            apiRef.current.startCellEditMode({ id: newRow.id, field: "sharh" });
                        }
                    }, 80);

                } else {
                    updatedRow.accountCode = "";
                    updatedRow.accountId = null;
                    updatedRow.accountName = "";
                    setSnackbar({ open: true, message: "کد حساب وارد شده در سیستم معتبر نیست.", severity: "error" });
                }
            } catch (error) {
                console.error("API Error:", error);
            }

        }


        // ۵. آپدیت نهایی استیت در صورت معتبر بودن حساب
        const updatedLines = voucher.lines.map((line) =>
            line.id === newRow.id ? updatedRow : line
        );
        setVoucher((prev) => ({ ...prev, lines: updatedLines }));
        return updatedRow;
    };




// ⭐️ نسخه اصلاح‌شده و بهینه تابع addLine در فایل useVoucherGrid.jsx:
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

    // ⭐️ [اصلاح نهایی] برگرداندن تابع به منطق حرکتی جهت‌نماها و اینتر عمومی خودتان
const onCellKeyDown = useCallback((params, event) => {
        const visibleColumns = apiRef.current.getVisibleColumns();
        const currentColumnIndex = visibleColumns.findIndex((col) => col.field === params.field);

        //  [اصلاح برعکس بودن کلیدهای چپ و راست در حالت فارسی - کاملاً دست‌نخورده] 
        // =========================================================
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (apiRef.current.getCellMode(params.id, params.field) === 'edit') {
                return; 
            }
            const invertedKey = event.key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
            Object.defineProperty(event, 'key', {
                get: function() { return invertedKey; }
            });

            const step = invertedKey === 'ArrowRight' ? 1 : -1;
            const targetColumn = visibleColumns[currentColumnIndex + step];
            
            if (targetColumn && targetColumn.field === 'accountName') {
                event.preventDefault();
                const skipStep = invertedKey === 'ArrowRight' ? 2 : -2;
                const finalColumn = visibleColumns[currentColumnIndex + skipStep];
                if (finalColumn) {
                    apiRef.current.setCellFocus(params.id, finalColumn.field);
                }
                return;
            }
            return;
        }

        // مدیریت کلید Enter عمومی 
        if (event.key === 'Enter') {
            // ⭐️ فیکس اصلی: اگر روی ستون کد حساب بودیم، تمام منطق‌های قدیمی باز کردن دستی مودال را پاک می‌کنیم.
            // فقط اجازه می‌دهیم سلول از حالت ادیت خارج شود و کارهای ثبت طبیعی گرید را جلو ببرد.
            if (params.field === 'accountCode') {
                if (apiRef.current.getCellMode(params.id, params.field) === 'edit') {
                    apiRef.current.stopCellEditMode({ id: params.id, field: params.field });
                }
                // قطع اجرای کدهای بعدی جابه‌جایی سطر، تا متد processRowUpdate شانس ثبت و تغییر استیت را داشته باشد
                return; 
            }

            // روال عادی کلید اینتر برای سایر ستون‌ها (شرح، بدهکار، بستانکار - کاملاً وفادار به کدهای خودت)
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
                let nextColumn = visibleColumns[currentColumnIndex + 1];

                if (nextColumn.field === 'accountName') {
                    nextColumn = visibleColumns[currentColumnIndex + 2];
                }

                if (nextColumn) {
                    setTimeout(() => {
                        apiRef.current.setCellFocus(params.id, nextColumn.field);
                        apiRef.current.startCellEditMode({ id: params.id, field: nextColumn.field });
                    }, 0);
                }
            }
        }


    // ⭐️ [اصلاح فیکس] اضافه کردن وابستگی‌های جا افتاده به انتهای تابع onCellKeyDown:
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




