import { formatNumber, toPersianDigits } from "../../../../utils/formatter";
import { GridActionsCellItem } from "@mui/x-data-grid-pro";
import DeleteIcon from "@mui/icons-material/Delete"; //   آیکون را ایمپورت کن
import { Autocomplete, TextField } from "@mui/material"; //  ایمپورت‌برای پیشنهاد شرح

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
      //   سفارشی‌سازی ادیتور ستون شرح
   {
     field: "sharh",
     headerName: "شرح",
     flex: 2,
     editable: true,
     renderEditCell: (params) => {
       // خواندن تاریخچه ذخیره شده از حافظه مرورگر. اگر خالی بود یک آرایه خالی برگشت داده می‌شود.
       const localData = localStorage.getItem("sharh_history");
       const historyOptions = localData ? JSON.parse(localData) : [];

       return (
         <Autocomplete
           freeSolo // اجازه تایپ متن جدید خارج از گزینه‌های لیست
           options={historyOptions}
           value={params.value || ""}
           openOnFocus // باز شدن خودکار منو به محض کلیک یا فوکوس روی سلول
           onChange={(event, newValue) => {
             // آپدیت مقدار سلول زمان انتخاب یک گزینه از منو
             params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue });
           }}
           onInputChange={(event, newInputValue) => {
             // آپدیت مقدار سلول زمان تایپ دستی توسط کاربر
             params.api.setEditCellValue({ id: params.id, field: params.field, value: newInputValue });
           }}
           renderInput={(inputParams) => (
             <TextField
               {...inputParams}
               fullWidth
               variant="standard"
               autoFocus
               sx={{ 
                 "& .MuiInputBase-root": { height: '100%', padding: '0 8px' },
                 "& input": { fontFamily: 'Vazir, Tahoma', fontSize: '14px', direction: 'rtl' }
               }}
             />
           )}
           style={{ width: '100%' }}
         />
       );
     
     }
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

   //   اضافه شدن ستون عملیات حذف ردیف
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
