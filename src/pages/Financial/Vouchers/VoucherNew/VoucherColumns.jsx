import { formatNumber, toPersianDigits } from "../../../../utils/formatter";

const getVoucherColumns = () => {
   
    return (
           [
               {
                 field: "row",
                 headerName: "ردیف",
                 width: 80,
                 valueFormatter: toPersianDigits,
               },
               {
                 field: "accountCode",
                 headerName: "کد حساب",
                 flex: 1,
                 editable: true,
                 valueFormatter: toPersianDigits,
               },
               {
                 field: "accountName",
                 headerName: "عنوان حساب",
                 flex: 2,
               editable: false,
             },
             {
               field: "sharh",
               headerName: "شرح",
               flex: 2,
               editable: true,
             },
             {
               field: "debtorAmount",
               headerName: "بدهکار",
               flex: 1,
               editable: true,
               valueFormatter: formatNumber,
             },
             {
               field: "creditorAmount",
               headerName: "بستانکار",
               flex: 1,
               editable: true,
               valueFormatter: formatNumber,
             },
           ]);
}
 
export default getVoucherColumns;