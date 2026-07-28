import { formatNumber, toPersianDigits } from "../../../../utils/formatter";
import { GridActionsCellItem } from "@mui/x-data-grid-pro";
import DeleteIcon from "@mui/icons-material/Delete"; // حتماً این آیکون را ایمپورت کنید

// تابع کارخانه‌ای (Factory) برای ستون‌ها تا بتوانیم تابع حذف را به آن پاس دهیم
export const getColumns = (deleteLine) => [
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
     type: "number",
     valueFormatter: formatNumber,
   },
   {
     field: "creditorAmount",
     headerName: "بستانکار",
     flex: 1,
     editable: true,
     type: "number",
     valueFormatter: formatNumber,
   },
   // =========================================================
   // ✨ [تغییر جدید - اضافه شدن ستون عملیات حذف ردیف] ✨
   // =========================================================
   {
     field: "actions",
     type: "actions",
     headerName: "حذف",
     width: 70,
     getActions: (params) => [
       <GridActionsCellItem
         icon={<DeleteIcon  color = "error"  />}
         label="حذف"
         onClick={() => deleteLine(params.id)}
       />,
     ],
   },
];
