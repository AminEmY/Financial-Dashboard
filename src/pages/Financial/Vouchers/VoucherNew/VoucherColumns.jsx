import { formatNumber, toPersianDigits } from "../../../../utils/formatter";
import { GridActionsCellItem } from "@mui/x-data-grid-pro";
import DeleteIcon from "@mui/icons-material/Delete"; //   آیکون را ایمپورت کن
import SearchIcon from "@mui/icons-material/Search"; //  آیکون ذره‌بین برای پنجره کمکی
import { Autocomplete, TextField, IconButton, InputAdornment  } from "@mui/material"; //   ایمپورت‌برای پیشنهاد شرح و انتخاب حساب


// تابع کارخانه‌ای (Factory) برای ستون‌ها تا بتوانیم تابع حذف را به آن پاس دهیم و اضافه کردن تابع openAccountModal به ورودی‌های ستون
export const getColumns = (deleteLine, openAccountModal) => [
    {
     field: "row",
     headerName: "ردیف",
     width: 80,
     // ⭐️ حل باگ نهایی کرش گرید: استفاده امن از sequence خود سطر به جای متدهای خراب apiRef
     valueGetter: (value, row) => {
       return row && row.sequence ? row.sequence : "";
     },
     valueFormatter: (value) => {
       if (value === undefined || value === null || value === "") return "";
       return toPersianDigits(value);
     },
   },
  {
  field: "accountCode",
  headerName: "کد حساب",
  flex: 1,
  editable: true,
  // ⭐️ [اصلاح امنیتی] اگر مقدار سطر جدید خالی بود، فرمتر فارسی‌ساز را اجرا نکن تا گرید کرش نکند
  valueFormatter: (value) => {
    if (!value) return "";
    return toPersianDigits(value);
  },

  renderEditCell: (params) => (
    <TextField
      fullWidth
      variant="standard"
      autoFocus
      defaultValue={params.value || ""}

      onChange={(e) => {
        params.api.setEditCellValue({
          id: params.id,
          field: params.field,
          value: e.target.value,
        });
      }}

      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          // مقدار واقعی‌ای که کاربر داخل TextField نوشته را می‌گیریم
          const typedValue = e.currentTarget.value.trim();

          // اگر چیزی ننوشته → مودال انتخاب حساب
          if (!typedValue) {
            e.stopPropagation();
            e.preventDefault();

            // ⭐️ [اصلاح ترتیب آرگومان‌ها] هماهنگ با ورودی‌های هوک: اول کاراکتر (خالی)، دوم آیدی سطر
            openAccountModal("", params.id);
            return;
          }
        }
      }}

      sx={{
        "& input": {
          fontFamily: "Vazir, Tahoma",
          fontSize: "14px",
          padding: "0 8px",
        },
      }}

      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onMouseDown={(e) => {
                // جلوگیری از اینکه کلیک روی آیکون باعث از دست رفتن حالت Edit سلول شود
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();

                const inputValue = e.currentTarget
                  ?.closest(".MuiDataGrid-cell")
                  ?.querySelector("input")
                  ?.value || "";

                // ⭐️ [اصلاح ترتیب آرگومان‌ها] هماهنگ با ورودی‌های هوک: اول مقدار فیلد، دوم آیدی سطر
                openAccountModal(inputValue, params.id);
              }}
            >
              <SearchIcon
                fontSize="small"
                sx={{ color: "#1976d2" }}
              />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  ),
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
