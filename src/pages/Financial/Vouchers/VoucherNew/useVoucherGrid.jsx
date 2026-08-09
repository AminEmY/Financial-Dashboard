import { useGridApiRef } from "@mui/x-data-grid-pro";
import {getColumns} from "./VoucherColumns";
import { useState, useCallback, useMemo } from "react"; // ⭐️ اضافه شدن هوک‌های ری‌اکت برای حل باگ رندر
import axios from "axios";




// ⭐️ [تغییر جدید] اضافه شدن استیت‌های فیلد متنی و تب‌ها به ورودی‌های هوک برای هدایت سناریوی اینتر و سرچ سریع
export default function useVoucherGrid(voucher, setVoucher, setSearchTerm, setActiveTabOverride) {

    const apiRef = useGridApiRef();

        //  استیت و توابع مدیریت Snackbar
    // =========================================================
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "error" // می‌تواند success، info، warning یا error باشد
    });


    // =========================================================
    // ✨ [تغییر جدید - استیت‌های مدیریت مودال حساب‌ها] ✨
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
    const dynamicColumns = useMemo(() => {
        return getColumns(deleteLine, (...args) => openAccountModal(...args));
    }, [deleteLine, openAccountModal]);    


    const processRowUpdate = async (newRow, oldRow) => {
        const updatedRow = { ...newRow };

    // ۱. مبالغ جدید و قدیم را برای مقایسه راحت‌تر به عدد تبدیل می‌کنیم
        const debtor = Number(updatedRow.debtorAmount || 0);
        const creditor = Number(updatedRow.creditorAmount || 0);
        const oldDebtor = Number(oldRow.debtorAmount || 0);
        const oldCreditor = Number(oldRow.creditorAmount || 0);

    // ۲. اگر کاربر عدد جدیدی در بدهکار وارد کرد، بستانکار همان سطر صفر می‌شود
        if (debtor !== 0 && debtor !== oldDebtor) {
            updatedRow.creditorAmount = 0;}
    // ۳. اگر کاربر عدد جدیدی در بستانکار وارد کرد، بدهکار همان سطر صفر می‌شود
        else if (creditor !== 0 && creditor !== oldCreditor) {
            updatedRow.debtorAmount = 0;
        }

        //   ذخیره دائمی شرح در حافظه مرورگر
        // =========================================================
        if (updatedRow.sharh && updatedRow.sharh.trim() !== "") {
            // ۱. خواندن لیست تاریخچه قبلی از دیتابیس مرورگر
            const localData = localStorage.getItem("sharh_history");
            let currentHistory = localData ? JSON.parse(localData) : [];
            
            // ۲. اضافه کردن شرح جدید به آرایه تاریخچه
            currentHistory.push(updatedRow.sharh.trim());
            
            // ۳. فیلتر کردن مقادیر برای حذف موارد تکراری
            const uniqueHistory = Array.from(new Set(currentHistory));
            
            // ۴. ذخیره مجدد آرایه پاکسازی شده در دیتابیس مرورگر به صورت رشته متنی (String)
            localStorage.setItem("sharh_history", JSON.stringify(uniqueHistory));}


        // منطق استعلام مستقیم متنی کد حساب از API (سر جای خود باقی است)
        if (updatedRow.accountCode && updatedRow.accountCode !== oldRow.accountCode) {
            try {
                const response = await axios.post("http://ecipc107:8049/api/Account/GetAll", {
                    filter: updatedRow.accountCode.trim(),
                    forSearch: true
                });

                const foundAccount = response.data?.find(
                    (acc) => acc.code === updatedRow.accountCode.trim()
                );

                if (foundAccount) {
                    updatedRow.accountId = foundAccount.id;
                    updatedRow.accountName = foundAccount.name;
                } else {
                    updatedRow.accountCode = "";
                    updatedRow.accountId = null;
                    updatedRow.accountName = "";
                    
                    setSnackbar({
                        open: true,
                        message: "کد حساب وارد شده در سیستم معتبر نیست.",
                        severity: "error"
                    });
                }
            } catch (error) {
                console.error("API Error:", error);
                setSnackbar({
                    open: true,
                    message: "خطا در برقراری ارتباط با سرور حساب‌ها.",
                    severity: "error"
                });
            }
        }            


    // ۴. آرایه قبلی سطرها را مپ می‌کنیم تا سطر ادیت شده را جایگزین کنیم        
        const updatedLines = voucher.lines.map((line) =>
            line.id === newRow.id ? updatedRow : line
        );

    // ۵. استیت اصلی کامپوننت مادر را آپدیت می‌کنیم تا جمع کل در فوتر تغییر کند    
        setVoucher((prev) => ({
            ...prev,
            lines: updatedLines
        }));

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


    // ⭐️ [تلفیق کامل با کدهای خودت] مدیریت هوشمند کلیدها، جهت‌نماهای RTL و تفکیک مودال حساب‌ها
    const onCellKeyDown = useCallback((params, event) => {
        const visibleColumns = apiRef.current.getVisibleColumns();
        const currentColumnIndex = visibleColumns.findIndex((col) => col.field === params.field);

        //  [اصلاح برعکس بودن کلیدهای چپ و راست در حالت فارسی - کاملاً حفظ شده] 
        // =========================================================
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            // اگر در حالت ویرایش یک سلول هستیم، کاری به فلش‌ها نداریم تا کاربر بتواند روی متن عقب/جلو برود
            if (apiRef.current.getCellMode(params.id, params.field) === 'edit') {
                return; 
            }
            
            // معکوس کردن هویت کلید فشرده شده قبل از رسیدن رویداد به مغز اصلی دیتاگرید
            const invertedKey = event.key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
            
            // با استفاده از Object.defineProperty ویژگی رویداد اصلی را بازنویسی و معکوس می‌کنیم
            Object.defineProperty(event, 'key', {
                get: function() { return invertedKey; }
            });

            // برای عبور روان از روی ستون غیرقابل ویرایش "accountName"
            const step = invertedKey === 'ArrowRight' ? 1 : -1;
            const targetColumn = visibleColumns[currentColumnIndex + step];
            
            if (targetColumn && targetColumn.field === 'accountName') {
                // اگر مقصد بعدی ستون مسدود شده نام حساب بود، فوکوس را به صورت دستی هدایت کرده و رویداد اصلی را قطع می‌کنیم
                event.preventDefault();
                const skipStep = invertedKey === 'ArrowRight' ? 2 : -2;
                const finalColumn = visibleColumns[currentColumnIndex + skipStep];
                if (finalColumn) {
                    apiRef.current.setCellFocus(params.id, finalColumn.field);
                }
                return;
            }

            // در صورتی که ستون عادی بود، اجازه می‌دهیم رویداد معکوس شده ما به خوردِ هسته متیریال یوآی برود
            return;
        }

        // ⭐️ [بخش جدید و اصلاح‌شده سناریو] مدیریت اختصاصی کلیدها برای ستون کد حساب قبل از اینترهای عمومی گرید
        if (params.field === "accountCode") {
            // لیست کلیدهای سیستمی که نباید پنجره جستجوی متنی سریع را باز کنند
            const ignoredKeys = [
                "Escape", "Tab", "Shift", "Control", "Alt", "Meta",
                "ArrowUp", "ArrowDown", "Backspace", "Delete", "CapsLock"
            ];

            // اگر کاربر کلیدی غیر از اینتر و کلیدهای بالا زد (یعنی کلید متنی زد)
            if (event.key !== 'Enter' && !ignoredKeys.includes(event.key)) {
                event.preventDefault();
                event.stopPropagation();
                
                const typedChar = event.key;

                // خروج امن از ویرایش سلول برای جلوگیری از باگ تداخل رندر
                apiRef.current.stopCellEditMode({ id: params.id, field: params.field });

                setTimeout(() => {
                    setActiveTabOverride(0); // قفل روی تب جستجوی سریع متنی (تب شماره ۰)
                    setSearchTerm(typedChar); // پر کردن فیلد سرچ با کاراکتر فشرده شده
                    openAccountModal(typedChar, params.id);
                }, 60);
                return;
            }
        }

        // مدیریت عمومی کلید Enter (کاملاً وفادار به کدهای خودت)
        if (event.key === 'Enter') {
            // ⭐️ [اصلاح هوشمند سناریو] اگر روی کد حساب بودیم و مقدار خالی بود، اینتر عمومی گرید را متوقف می‌کنیم تا تب درخت باز شود
            if (params.field === "accountCode" && (!params.value || params.value.trim() === "")) {
                event.preventDefault();
                event.stopPropagation();
                apiRef.current.stopCellEditMode({ id: params.id, field: params.field });
                
                setTimeout(() => {
                    setActiveTabOverride(1); // قفل روی تب ساختار درختی (تب شماره ۱)
                    openAccountModal("", params.id);
                }, 60);
                return;
            }

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
    }, [apiRef, openAccountModal, setActiveTabOverride, setSearchTerm, addLine]);

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
        selectAccountFromModal 
    }; 
}




