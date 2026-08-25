import { useState } from "react";         
import { formatNumber, toPersianDigits } from "../../../../utils/formatter";
import { GridActionsCellItem } from "@mui/x-data-grid-pro";
import DeleteIcon from "@mui/icons-material/Delete"; //   آیکون را ایمپورت کن
import SearchIcon from "@mui/icons-material/Search"; //  آیکون ذره‌بین برای پنجره کمکی
import { Autocomplete, TextField, IconButton, InputAdornment  } from "@mui/material"; //   ایمپورت‌برای پیشنهاد شرح و انتخاب حساب




// تابع کارخانه‌ای (Factory) برای ستون‌ها تا بتوانیم تابع حذف را به آن پاس دهیم و اضافه کردن تابع openAccountModal به ورودی‌های ستون
export const getColumns = (deleteLine, openAccountModal, setSearchTerm, setActiveTabOverride , voucherLines) => {
  
  // 🟢 تعیین اینکه کدام Featureها حداقل برای یکی از ردیف‌ها فعال هستند
  const featureColumns = [
    { key: "good",           able: "goodAble",           field: "good",           headerName: "کالا" },
    { key: "markaz1",        able: "markaz1Able",        field: "markaz1",        headerName: "مرکز ۱" },
    { key: "markaz2",        able: "markaz2Able",        field: "markaz2",        headerName: "مرکز ۲" },
    { key: "markaz3",        able: "markaz3Able",        field: "markaz3",        headerName: "مرکز ۳" },
    { key: "markaz4",        able: "markaz4Able",        field: "markaz4",        headerName: "مرکز ۴" },
    { key: "dateCheq",       able: "dateCheqAble",       field: "dateCheq",       headerName: "تاریخ چک" },
    { key: "numCheq",        able: "numCheqAble",        field: "numCheq",        headerName: "شماره چک" },
    { key: "tedad1",         able: "tedad1Able",         field: "tedad1",         headerName: "تعداد ۱" },
    { key: "tedad2",         able: "tedad2Able",         field: "tedad2",         headerName: "تعداد ۲" },
    { key: "tedad3",         able: "tedad3Able",         field: "tedad3",         headerName: "تعداد ۳" },
    { key: "currencyCode",   able: "currencyCodeAble",   field: "currencyCode",   headerName: "کد ارز" },
    { key: "currencyFee",    able: "currencyFeeAble",    field: "currencyFee",    headerName: "نرخ ارز" },
    { key: "currencyTedad",  able: "currencyTedadAble",  field: "currencyTedad",  headerName: "مقدار ارز" },
  ];

  const activeFeatureColumns = featureColumns.filter(({ able }) =>
    voucherLines?.some(
      (line) => line.accountFeatures?.[able] === true
    )
  );

  const AccountCodeEditCell = ({ params }) => {
    const [localValue, setLocalValue] = useState(params.value || "");

    const onKeyDownHandler = (e) => {
      const isEnter = e.key === 'Enter';
      
      const ignoredKeys = [
        "Escape", "Tab", "Shift", "Control", "Alt", "Meta",
        "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", 
        "Backspace", "Delete", "CapsLock", "Enter"
      ];

      // ۱. مدیریت کلید Enter
      if (isEnter) {
        const typedValue = localValue?.trim();
        const isEmpty = !typedValue || typedValue === "";

        // سناریو الف: فقط اگر فیلد کاملاً خالی بود -> باز کردن مودال درخت (تب ۱)
        if (isEmpty) {
          e.stopPropagation();
          e.preventDefault();
          params.api.stopCellEditMode({ id: params.id, field: params.field });

              setTimeout(() => {
                  setActiveTabOverride(1);

                  // چون کاربر سلول خالی را Enter زده،
                  // اولین و بالاترین حساب درخت باید فوکوس شود.
                  openAccountModal("", params.id, true);
              }, 60);
          return;
        }
        
        // سناریو ب: فیلد پر است -> اجازه بده رویداد به طور طبیعی عبور کند تا در هوک (processRowUpdate) بررسی شود
        return;
      }

      // ۲. مدیریت تفکیک عدد و حروف (سرچ سریع)
      if (e.key !== 'Enter' && !ignoredKeys.includes(e.key)) {
        const isNumber = /^[0-9]$/.test(e.key);
        if (isNumber) return; // اگر عدد بود بگذارید داخل خود سلول تایپ شود

        e.stopPropagation();
        e.preventDefault();
        
        const typedChar = e.key;
        params.api.stopCellEditMode({ id: params.id, field: params.field });

        setTimeout(() => {
          setActiveTabOverride(0); // قفل روی تب سرچ متنی
          setSearchTerm(typedChar); 
          openAccountModal(typedChar, params.id);
        }, 60);
      }
    };

    return (
      <TextField
        fullWidth
        variant="standard"
        autoFocus
        value={localValue}
        onChange={(e) => {
          const val = e.target.value;
          setLocalValue(val);
          params.api.setEditCellValue({
            id: params.id,
            field: params.field,
            value: val,
          });
        }}
        onKeyDown={onKeyDownHandler}
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
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  openAccountModal(localValue, params.id);
                }}
              >
                <SearchIcon fontSize="small" sx={{ color: "#1976d2" }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  };


  // آرایه اصلی بازگشتی ستون‌ها
  return [

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
      valueFormatter: (value) => {
        if (!value) return "";
        return toPersianDigits(value);
      },
      // ⭐️ رندر تمیز و بدون خطای قوانین هوک و مستقل از متغیرهای تکراری
      renderEditCell: (params) => <AccountCodeEditCell params={params} />
    },

      //   سفارشی‌سازی ادیتور ستون شرح
   {
     field: "sharh",
     headerName: "شرح",
     flex: 2.5,
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
         // 🟢 Feature columns
   ...activeFeatureColumns.map(({ field , able, headerName }) => ({
     field,
     headerName,
     flex: 1,
     type: "number",
     editable: (params) =>
     params.row?.accountFeatures?.[able] === true,
     
     // 🟢 برای تشخیص در onCellKeyDown
     accountFeatureAble: able,
   })),

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
  ]
};
