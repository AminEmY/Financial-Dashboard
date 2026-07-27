import { useGridApiRef } from "@mui/x-data-grid-pro";
import columns from "./VoucherColumns";

export default function useVoucherGrid(voucher, setVoucher) {
    const apiRef = useGridApiRef();

    const processRowUpdate = (newRow, oldRow) => {
        const updatedRow = { ...newRow };
        const debtor = Number(updatedRow.debtorAmount || 0);
        const creditor = Number(updatedRow.creditorAmount || 0);
        const oldDebtor = Number(oldRow.debtorAmount || 0);
        const oldCreditor = Number(oldRow.creditorAmount || 0);

        if (debtor !== 0 && debtor !== oldDebtor) {
            updatedRow.creditorAmount = 0;
        } else if (creditor !== 0 && creditor !== oldCreditor) {
            updatedRow.debtorAmount = 0;
        }

        const updatedLines = voucher.lines.map((line) =>
            line.id === newRow.id ? updatedRow : line
        );
        
        setVoucher((prev) => ({
            ...prev,
            lines: updatedLines
        }));

        return updatedRow;
    };

    const addLine = () => {
        if (voucher.lines.length > 0) {
            const lastLine = voucher.lines[voucher.lines.length - 1];
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

        // =========================================================
        // ✨ اصلاح کلیدهای جهت‌نما (راست و چپ) هماهنگ با ماهیت لایه‌ای MUI
        // =========================================================
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            // اگر کاربر در حال ادیت و تایپ متن داخل سلول است، دخالت نکن تا بتواند نشانگر را بین حروف جابه‌جا کند
            if (apiRef.current.getCellMode(params.id, params.field) === 'edit') {
                return; 
            }

            event.preventDefault(); // جلو رفتارهای پیش‌فرض اشتباه را می‌گیریم

            // بر اساس اینکه دکمه فشرده شده چیست، جهت یابی دقیق انجام می‌دهیم
            // اگر کلید چپ فشرده شد یعنی کاربر می‌خواهد به سلول سمت چپ (ستون بعدی در چیدمان فارسی) برود
            let step = event.key === 'ArrowLeft' ? 1 : -1;
            let targetIndex = currentColumnIndex + step;

            // اگر به ستون غیرقابل ادیت "accountName" رسیدیم، یک گام دیگر بردارد تا گیر نکند
            if (visibleColumns[targetIndex] && visibleColumns[targetIndex].field === 'accountName') {
                targetIndex = targetIndex + step;
            }

            // اعمال فوکوس روی خانه مقصد نهایی
            if (targetIndex >= 0 && targetIndex < visibleColumns.length) {
                const targetColumn = visibleColumns[targetIndex];
                apiRef.current.setCellFocus(params.id, targetColumn.field);
            }
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

    return { apiRef, columns, processRowUpdate, addLine, onCellKeyDown };
}
