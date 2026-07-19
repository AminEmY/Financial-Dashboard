import CustomDataGrid from "../../../../components/common/CustomizedDataGrid";
import getVoucherColumns from "./VoucherColumns";
import { useGridApiRef } from "@mui/x-data-grid-pro";
import { Button } from '@mui/material';
import styles from "./VoucherLineGrid.module.css";
import { useMemo } from "react";


const VoucherLineGrid = ({ voucher, setVoucher}) => {
    
    const columns = useMemo(() => getVoucherColumns(), []);//برای اینکه هر بار اجرا نشه و فقط وقتی تغییر کرد []
    const apiRef = useGridApiRef();
    const processRowUpdate = (newRow) => {

        setVoucher((prev) => ({
            ...prev,
    
            lines: prev.lines.map((line) =>
            line.id === newRow.id  ? newRow : line ),
                }));
  
             return newRow;
    }; //که اگر کاربر ردیفی رو ویرایش کرد، بره بر اساس آیدی همون ردیف رو جایگزین کنه و فقط یو آی رو تغییر نده استیت هم تغییر بده واقعا

    const addLine = () => {
  
        const newId = Date.now();
        const newRow = {
        id: newId,
        row: voucher.lines.length + 1,
        accountCode: "",
        accountName: "",
        sharh: "",
        debtorAmount: 0,
         creditorAmount: 0,
     };


     setVoucher((prev) => ({
        ...prev,
        lines: [ ...prev.lines, newRow ],
        }));

        requestAnimationFrame(() => {
        apiRef.current.startCellEditMode({
         id: newId,
         field: "accountCode",
           });
        });
  
    };

    const handleCellKeyDown = (params, event) => {

        // console.log("Enter", params.field);

        if (event.key !== "Enter") return ;

        event.preventDefault();

        const order = [
        "accountCode",
         "sharh",
         "debtorAmount",
         "creditorAmount",
        ];

        const currentIndex = order.indexOf(params.field);
        //  console.log("currentIndex:", currentIndex);

         if (currentIndex === -1)  {console.log("field not found") 
            return;}

        // ستون بعدی
        if (currentIndex < order.length - 1) {
         //     console.log(
         //   "move to:",
         //   order[currentIndex + 1]
         // );

        const nextField = order[currentIndex + 1];

         apiRef.current.startCellEditMode({
         id: params.id,
         field: nextField,
        });


        setTimeout(() => {
            apiRef.current.setCellFocus(
            params.id,
            nextField
        );
                         }, 100);

            return;
        }

            // console.log("last column");
            // آخرین ستون
        addLine();
                                                }
    
    
    return (
    <>
    <div className={styles.GHeight}>
        <CustomDataGrid 

            apiRef={apiRef}
            rows={voucher.lines}
            columns={columns}
            processRowUpdate={processRowUpdate}
            onCellKeyDown={handleCellKeyDown}
            
        />
    </div>
        
        <Button className={styles.Bttn} variant="contained" onClick={addLine}> افزودن ردیف </Button>
   </> );
}

export default VoucherLineGrid;