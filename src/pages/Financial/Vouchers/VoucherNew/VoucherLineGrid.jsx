import CustomDataGrid from "../../../../components/common/CustomizedDataGrid";
import { Button } from '@mui/material';
import styles from "./VoucherLineGrid.module.css";
import useVoucherGrid from "./useVoucherGrid";
import { Snackbar, Alert } from "@mui/material"; // برای خطا ایمپورت‌های جدید متیریال

const VoucherLineGrid = ({ voucher, setVoucher }) => {

   //  اضافه کردن snackbar و closeSnackbar به متغیرهای خروجی هوک
  // اضافه کردن onCellKeyDown به متغیرهای خروجی از هوک      
  const { apiRef, columns, processRowUpdate, addLine, onCellKeyDown, snackbar, closeSnackbar  } = useVoucherGrid(voucher, setVoucher);  
    
  return (
    <>
    <div className={styles.GHeight}>
        <CustomDataGrid 
            apiRef={apiRef}
            rows={voucher.lines}
            columns={columns}
            processRowUpdate={processRowUpdate}
            onCellKeyDown={onCellKeyDown} // فعال کردن پروپرتی کی‌داون برای اعمال جابه‌جایی با Enter
        />
    </div>
        
    <Button className={styles.Bttn} variant="contained" onClick={addLine}>
        افزودن ردیف
    </Button>
    
    {/* //  کامپوننت رندر اسنک‌بار در پایین صفحه */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} // پس از ۴ ثانیه خودکار بسته می‌شود
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // موقعیت نمایش در پایین و وسط صفحه
            >
                <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', fontFamily: 'Vazir, Tahoma' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
   </>
  );
}

export default VoucherLineGrid;
