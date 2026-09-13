// تنظیمات هر فیلد: عنوان مودال + بخش اول آدرس API
export const entityPickerConfigs = {
    good:    { 
        title: "انتخاب کالا",
        apiBase: "Good",
        searchExtraBody: {
            onlyBomDar: false,
            onlyLastLevel: true,
            depotCode: "",
            columns: "code,name",
        },
    },
    markaz1: { title: "انتخاب مرکز ۱", apiBase: "Markaz1" },
    markaz2: { title: "انتخاب مرکز ۲", apiBase: "Markaz2" },
    markaz3: { title: "انتخاب مرکز ۳", apiBase: "Markaz3" },
    markaz4: { title: "انتخاب مرکز ۴", apiBase: "Markaz4" },
};