import CustomDataGrid from "../../../../components/common/CustomizedDataGrid";
import getVoucherColumns from "./VoucherColumns";
import { useGridApiRef } from "@mui/x-data-grid-pro";
import { Button } from '@mui/material';
import styles from "./VoucherLineGrid.module.css";
import { useMemo } from "react";
import { addLine, handleCellKeyDown } from "./VoucherGridEvents";


const VoucherLineGrid = ({ voucher, setVoucher}) => {
    
    const columns = useMemo(() => getVoucherColumns(), []);//برای اینکه هر بار اجرا نشه و فقط وقتی تغییر کرد []
    const apiRef = useGridApiRef();
    
const processRowUpdate = (newRow) => {

    const updatedRow = {
        ...newRow,
        debtorAmount: Number(newRow.debtorAmount || 0),
        creditorAmount: Number(newRow.creditorAmount || 0),
    };

    console.log(updatedRow);


        setVoucher((prev) => ({
            ...prev,
    
            lines: prev.lines.map((line) =>
            line.id === updatedRow.id  ? updatedRow : line ),
                }));
  
             return updatedRow }; //که اگر کاربر ردیفی رو ویرایش کرد، بره بر اساس آیدی همون ردیف رو جایگزین کنه و فقط یو آی رو تغییر نده استیت هم تغییر بده واقعا

    
    const onAddLine = () => addLine({ voucher, setVoucher, apiRef });
    
    const onCellKeyDown = (params, event) => handleCellKeyDown({ params, event, apiRef, voucher, setVoucher }) ;


    
    
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
        
        <Button className={styles.Bttn} variant="contained" onClick={onAddLine}> افزودن ردیف </Button>
   </> );
}

export default VoucherLineGrid;