import { useGridApiRef } from "@mui/x-data-grid-pro";
import {getColumns} from "./VoucherColumns";

export default function useVoucherGrid(voucher, setVoucher) {
    const apiRef = useGridApiRef();
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

    // تولید ستون‌ها همراه با پاس دادن تابع حذف به آن‌ها
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
                alert("لطفاً ابتدا کد حساب ردیف فعلی را وارد کنید.");
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

        //  [ فوکوس ایمن روی سطر جدید با تاخیر ۵۰ میلی‌ثانیه‌ای] 
        // =========================================================
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


        //  [تغییر جدید - کپی شرح با کلید 
        // =========================================================
        // ۱. چک می‌کنیم که کاربر حتماً روی فیلد "شرح" باشد و دکمه اسلش (/) را زده باشد
        if (params.field === 'sharh' && event.key === '/') {
            // ۲. موقعیت (ایندکس) سطر فعلی در جدول را پیدا می‌کنیم
            const currentRowIndex = voucher.lines.findIndex((line) => line.id === params.id);
            
            // ۳. اگر سطر فعلی ردیف اول نباشد (یعنی سطری بالاتر از آن وجود داشته باشد)
            if (currentRowIndex > 0) {
                event.preventDefault(); // جلوگیری از تایپ شدن خود کاراکتر "/" در کادر
                
                // ۴. شرحِ سطر بالایی را استخراج می‌کنیم
                const previousRowSharh = voucher.lines[currentRowIndex - 1].sharh;

                // ۵. با استفاده از متد رسمی دیتاگرید، مقدار سطر فعلی را زنده آپدیت می‌کنیم تا در لحظه روی صفحه دیده شود
                apiRef.current.setEditCellValue({
                    id: params.id,
                    field: 'sharh',
                    value: previousRowSharh
                });
            }
            return;
        }


        // =========================================================
      //  [تغییر جدید - اصلاح برعکس بودن کلیدهای چپ و راست در حالت RTL]
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

    return { apiRef, columns:dynamicColumns , processRowUpdate, addLine, onCellKeyDown };
}
