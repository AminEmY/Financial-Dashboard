import CustomDataGrid from "../../../../components/common/CustomizedDataGrid";
import { Button } from '@mui/material';
import styles from "./VoucherLineGrid.module.css";
import useVoucherGrid from "./useVoucherGrid";

const VoucherLineGrid = ({ voucher, setVoucher }) => {
  // اضافه کردن onCellKeyDown به متغیرهای خروجی از هوک      
  const { apiRef, columns, processRowUpdate, addLine, onCellKeyDown } = useVoucherGrid(voucher, setVoucher);  
    
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
   </>
  );
}

export default VoucherLineGrid;
