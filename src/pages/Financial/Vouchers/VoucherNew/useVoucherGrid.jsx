import { useGridApiRef } from "@mui/x-data-grid-pro";
import {getColumns} from "./VoucherColumns";
import { useState } from "react";

export default function useVoucherGrid(voucher, setVoucher) {
    const apiRef = useGridApiRef();

        //  استیت و توابع مدیریت Snackbar
    // =========================================================
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "error" // می‌تواند success، info، warning یا error باشد
    });

    const closeSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    };



        // =========================================================
    //   تابع حذف ردیف و مرتب‌سازی شماره ردیف‌ها
   
    const deleteLine = (id) => {
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
    };

    // تولید ستون‌ها همراه با پاس دادن تابع حذف به آن‌ها و پاس دادن آرایه سطرها به ستون‌ها برای استخراج تاریخچه شرح‌ها
    const dynamicColumns = getColumns(deleteLine);


    const processRowUpdate = (newRow, oldRow) => {
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

    const addLine = () => {

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

        // برای حل مشکل خطای تکثیر نشدن سطر یا MissingRowIdError
        // ۵۰ میلی‌ثانیه صبر می‌کنیم تا ابتدا رندر ری‌اکت تمام شود و سطر در DOM بنشیند

        setTimeout(() => {
            if (apiRef.current && apiRef.current.setCellFocus) {
                apiRef.current.setCellFocus(newId, "accountCode");
                apiRef.current.startCellEditMode({
                    id: newId,
                    field: "accountCode",
                });
            }
        }, 50);
    };

    const onCellKeyDown = (params, event) => {
        const visibleColumns = apiRef.current.getVisibleColumns();
        const currentColumnIndex = visibleColumns.findIndex((col) => col.field === params.field);



        
      //  [  اصلاح برعکس بودن کلیدهای چپ و راست در حالت فارسی 
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

        // مدیریت کلید Enter
        if (event.key === 'Enter') {
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
    };

    return { apiRef, columns:dynamicColumns , processRowUpdate, addLine, onCellKeyDown, snackbar, closeSnackbar }; //+ اسنک بار 
}
