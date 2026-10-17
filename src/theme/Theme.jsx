import { createTheme, alpha } from "@mui/material/styles";
import { InputAdornment } from "@mui/material";


const colors = {
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  primaryLight: "#818CF8",
  primarySelected: "#EEF2FF",

  sidebar: "#20212B",
  sidebarSurface: "#292B38",

  background: "#F8FAFC",
  paper: "#FFFFFF",

  textPrimary: "#1F2937",
  textSecondary: "#64748B",
  textDisabled: "#94A3B8",

  border: "#E2E8F0",

  error: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
};


// props مشترک همه‌ی فیلدهای یکدست: کپشن ثابت کنار مقدار (مثل «شماره سند» بالای سند)
// ظاهرش کامل از theme.fieldBox و MuiFilledInput پایین همین فایل می‌آید

// eslint-disable-next-line react-refresh/only-export-components
export const fieldProps = (label, inputExtra = {}) => ({
  variant: "filled",
  hiddenLabel: true,
  size: "small",
  fullWidth: true,
  slotProps: {
    htmlInput: { "aria-label": label },
    input: {
      disableUnderline: true,
      startAdornment: <InputAdornment position="start">{label}</InputAdornment>,
      ...inputExtra,
    },
  },
});


export const Theme = createTheme({
  direction: "rtl",

  palette: {
    primary: {
      main: '#4F46E5',         // Primary انتخابی شما
      light: '#E0E7FF',        // Selected انتخابی شما
      dark: '#3730A3',         // برای حالت Hover و متن‌های روی Selected
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9FAFB',      // Background اصلی صفحه
      paper: '#FFFFFF',        // بدنه کارت‌ها و DataGrid
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
    divider: '#E5E7EB',        // کادرها و جداکننده‌ها
    action: {
      hover: '#F8FAFC',        // رنگ موس روی سطرهای جدول
      selected: '#E0E7FF',     // رنگ سطر انتخاب‌شده
    },
    // رنگ‌های اختصاصی سایدبار و سیستم مالی
    sidebar: {
      bg: "#181824",         // Charcoal تیره برای پس‌زمینه سایدبار
      surface: "#222232",    // پس‌زمینه منوهای والد
      activeBg: "#4F46E5",   // Electric Indigo برای آیتم فعال
      text: "#94A3B8",
      activeText: "#FFFFFF",
    },
    financial: {
      debit: '#10B981',        // سبز بدهکار
      credit: '#EF4444',       // قرمز بستانکار
    },
  },



    // توکن‌های ظاهری فیلدهای یکدست (AppTextField / AppSelect) — با تغییر اینجا، همه‌ی فیلدهای برنامه عوض می‌شن
  fieldBox: {
    height: 38,
    radius: 8,
    background: "#f5f6fa",
    hoverBackground: "#edeff5",
    focusBackground: "#ffffff",
    disabledBackground: "#eef0f4",
    labelColor: "#515355",
    labelFontSize: 12,
    fontSize: 13,
  },

  typography: {
    fontFamily: '"IRANSansX", "Tahoma", "Arial", sans-serif',
    fontSize: 13,
    h1: { fontFamily: '"IRANSansX", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"IRANSansX", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"IRANSansX", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"IRANSansX", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"IRANSansX", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"IRANSansX", sans-serif', fontWeight: 600 },
    subtitle1: { fontFamily: '"IRANSansX", sans-serif' },
    subtitle2: { fontFamily: '"IRANSansX", sans-serif' },
    body1: { fontFamily: '"IRANSansX", sans-serif', fontSize: "0.875rem" },
    body2: { fontFamily: '"IRANSansX", sans-serif', fontSize: "0.8125rem" },
    button: { fontFamily: '"IRANSansX", sans-serif', fontWeight: 600, textTransform: "none" },
    caption: { fontFamily: '"IRANSansX", sans-serif' },
    overline: { fontFamily: '"IRANSansX", sans-serif' },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    // تنظیمات جهانی پایه

MuiCssBaseline: {
  styleOverrides: {
    ":root": {
      "--color-primary": colors.primary,
      "--color-primary-hover": colors.primaryHover,
      "--color-primary-light": colors.primaryLight,
      "--color-primary-selected": colors.primarySelected,

/* اصلاح دقیق نام متغیرهایی که در Sidebar.module.css خوانده می‌شوند */
      "--sidebar-bg": colors.sidebar,             /* #20212B */
      "--sidebar-surface": colors.sidebarSurface, /* #2D2E3A */
      "--sidebar-surface-hover": "#383948",
      "--sidebar-text": "#9CA3AF",                /* رنگ متن آیتم‌های معمولی */
      "--sidebar-text-hover": "#FFFFFF",
      "--sidebar-active": colors.primary,         /* #4F46E5 */

      "--color-background": colors.background,
      "--color-paper": colors.paper,

      "--color-text-primary": colors.textPrimary,
      "--color-text-secondary": colors.textSecondary,
      "--color-text-disabled": colors.textDisabled,

      "--color-border": colors.border,

      "--color-error": colors.error,
      "--color-warning": colors.warning,
      "--color-success": colors.success,
    },

    body: {
      fontFamily: '"IRANSansX", sans-serif',
      backgroundColor: colors.background,
      direction: "rtl",
    },
  },
},


    // دکمه‌ها
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
          borderRadius: 6,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },

    // فیلدهای ورودی (TextField / Input)
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
          fontSize: "13px",
          minHeight: 36,
        },
        input: {
          fontFamily: '"IRANSansX", sans-serif',
          textAlign:"right",
          padding: "8px 10px",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
          fontSize: "13px",
          right: 14,
          left: "auto",
          transformOrigin: "top right",
          "&.MuiInputLabel-shrink": {
            transform: "translate(0, -9px) scale(0.75)",
            backgroundColor: "#ffffff",
            padding: "0 4px",
      },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
          fontSize: "0.875rem",
          borderRadius: 8,
          backgroundColor: "#ffffff",

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#94a3b8",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563eb",
            borderWidth: "1px",
          },
        },

          notchedOutline: {
            borderColor: "#cbd5e1",
            textAlign: "right",
          },
          input: {
            fontFamily: '"IRANSansX", sans-serif',
            padding: "8.5px 12px",
          },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif"',
          fontSize: "0.8125rem",

          "&.Mui-focused": {
            color: "#2563eb",
          },
        },
      },
    },

MuiSelect: {
  styleOverrides: {
    select: {
      paddingLeft: "32px !important", // ایجاد فضای کافی برای متن تا زیر فلش نرود
      display: "flex",
      alignItems: "center",
    },
    icon: {
      left: "6px !important",
      right: "auto !important",
    },
  },
},

        // فیلد یکدست برنامه (variant="filled" + fieldProps) — تنها منبع ظاهر فیلدها
    MuiFilledInput: {
      styleOverrides: {
        root: ({ theme }) => {
          const f = theme.fieldBox;
          return {
            minHeight: f.height,
            padding: "0 5px",
            gap: 10,
            borderRadius: f.radius,
            backgroundColor: f.background,
            transition: "background-color 0.15s ease, box-shadow 0.15s ease",
            "&:hover": { backgroundColor: f.hoverBackground },
            "&.Mui-focused": {
              backgroundColor: f.focusBackground,
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`,
            },
            "&.Mui-disabled": { backgroundColor: f.disabledBackground, opacity: 0.6 },

            // کپشن (startAdornment)
            "& .MuiInputAdornment-positionStart": {
              margin: 0,
              height: "auto",
              maxHeight: "none",
              whiteSpace: "nowrap",
              fontSize: f.labelFontSize,
              color: f.labelColor,
              "& .MuiTypography-root": { fontSize: "inherit", color: "inherit", fontFamily: "inherit" },
            },
            "&.Mui-focused .MuiInputAdornment-positionStart": { color: theme.palette.primary.main },
            "& .MuiInputAdornment-positionEnd": { margin: 0 ,
                         "& .MuiIconButton-root": {
                             padding: "2px !important", // کاهش پدینگ آیکون‌های داخل فیلد
                                                   }, },
            // سلکت: جای فلش کنار لبه‌ی چپ، متن هرگز زیر آن نمی‌رود
            "& .MuiSelect-select": {
              padding: "0 15px 0 0 !important",
              minHeight: "auto",
              textAlign: "right",
            },
            "& .MuiSelect-icon": { left: "1px !important", right: "auto !important", fontSize: 18 },
          };
        },
        input: { padding: "0 !important", textAlign: "right", fontSize: 13 },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          "&.MuiAutocomplete-paper": {
            marginTop: 4,
            borderRadius: 8,
          },
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
          fontSize: "13px",
          justifyContent: "center",
          textAlign: "center",


          "&.Mui-selected": {
            backgroundColor: "#eff6ff",
          },

          "&.Mui-selected:hover": {
            backgroundColor: "#dbeafe",
          },
        },
      },
   },
      MuiAccordion: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#ffffff",

          "&:before": {
            display: "none",
          },

          "&:first-of-type": {
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },

          "&:last-of-type": {
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif"',
          minHeight: 42,
          padding: "0 12px",

          "&.Mui-expanded": {
            minHeight: 42,
          },
        },

        content: {
          margin: "8px 0",

          "&.Mui-expanded": {
            margin: "8px 0",
          },
        },
      },
    },

    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
          padding: "12px",
          borderTop: "1px solid #e2e8f0",
        },
      },
    },

    

    // دیالوگ‌ها و مودال‌ها (مثل EntityPickerModal)
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
          fontWeight: 700,
          fontSize: "1rem",
          textAlign: "right",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
        },
      },
    },

    // تب‌ها (Tabs / Tab)
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
          fontWeight: 600,
          fontSize: "0.8125rem",
        },
      },
    },

    // استایل‌های عمومی جداول DataGridPro
    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
          direction: "rtl",
          border: "1px solid #cbd5e1",
          borderRadius: 8,


    // ۱. استایل کلی نوار هدر
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: "#e7edf3 !important", // پس‌زمینه نوار اصلی هدر
          borderBottom: "2px solid #94a3b8 !important",
          color: "#0f172a !important",
          fontWeight: "700 !important",
          paddingY: '3px',
        },

        // ۲. تبدیل هر هدر به یک کارت شیشه‌ای با لبه‌های گرد و سایه ملایم
        '& .MuiDataGrid-columnHeader': {
          position: 'relative',
          backgroundColor: '#e7edf3', // سفید شفاف/شیک
          marginRight: '2px', // فاصله نازک بین کارت‌ها (برای RTL به marginLeft تغییر دهید در صورت لزوم)
          marginLeft: '2px',
          borderRadius: '6px', // لبه‌های گرد برای حالت سه بعدی کارت
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', // سایه ملایم زیر هر کارت هدر
          border: '1px solid #989ca0',
          transition: 'all 0.2s ease-in-out',

          // افکت هوور روی کل کارت هدر
          '&:hover': {
            backgroundColor: '#cacbe9',
            borderColor: '#94a3b8',
            boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
          },
        },

        // ۳. بازطراحی کامل columnSeparator به دستگیره جادویی و حرفه‌ای
        '& .MuiDataGrid-columnSeparator': {
          width: '18px', // پهنای عالی برای راحتی دراگ کردن با ماوس
          justifyContent: 'center',
          left: -8, // قرارگیری دقیق روی مرز جداکننده در RTL
          right: 'auto',
          zIndex: 10,

          // حذف آیکون خطی معمولی پیش‌فرض MUI
          '& .MuiDataGrid-iconSeparator': {
            display: 'none', // ❌ حذف آیکون پیش‌فرض
          },

          // ساخت دستگیره دراگ به شکل ۳ نقطه نازک مدرن (Grip Dots)
          '&::after': {
            content: '""',
            width: '4px',
            height: '14px',
            borderRadius: '2px',
            // ایجاد حالت ۳ نقطه جداکننده سنتی ابزارها با استفاده از radial-gradient
            backgroundColor: '#cbd5e1',
            boxShadow: '0 -5px 0 #cbd5e1, 0 5px 0 #cbd5e1', // ایجاد دو نقطه در بالا و پایین نقطه وسط
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          },

          // افکت فوق‌العاده جذاب هنگام هوور روی جداکننده جهت تغییر عرض ستون
          '&:hover::after': {
            backgroundColor: '#0284c7', // تغییر رنگ نقطه مرکزی به آبی درخشان
            boxShadow: '0 -6px 0 #0284c7, 0 6px 0 #0284c7, 0 0 10px rgba(2, 132, 199, 0.6)', // درخشش ۳ نقطه
            transform: 'scale(1.25)', // بزرگ‌نمایی حالت اکشن
          },
          },
              
          "& .MuiDataGrid-columnHeaderTitleContainer": {
            justifyContent: "flex-end !important",
          },

          "& .MuiDataGrid-columnHeaderTitleContainerContent": { 
            width: "100% !important", 
            display: "block !important", 
          },
          
          "& .MuiDataGrid-columnHeaderTitle": { 
            width: "100%",
            fontFamily: '"IRANSansX", sans-serif',
            fontWeight: 700,
            fontSize: "0.8125rem", 
            textAlign:"center"
          },

          "& .MuiDataGrid-iconButtonContainer": {
            display: "none !important",
          },

          "& .MuiDataGrid-sortIcon": {
            opacity: 0,
            transition: "opacity 0.15s ease",
          },

          "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-sortIcon": {
            opacity: 1,
          },

          
          "& .MuiDataGrid-cell": {
            fontFamily: '"IRANSansX", sans-serif',
            borderLeft: "1px solid #e2e8f0",
            fontSize: "0.85rem",

          },

          // زیر اسکرول نیفته متن
          "& .MuiDataGrid-cell--textRight": {
            paddingRight: "22px",
          },

                    //  رنگ یکی درمیون ردیف‌ها (زبرا)
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#f5f7f8",
          },
          
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: "#e5e5ff !important",
          },

          // "& .MuiDataGrid-row.Mui-selected:hover": {
          //   backgroundColor: "#90caf9 !important",
          // },

          //  هاور ملایم روی ردیف زیر ماوس
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f2f2fd !important",
          },

          //  کوچیک‌کردن نوار ابزار بالای گرید (سرچ/فیلتر/ستون‌ها)
          "& .MuiDataGrid-toolbar": {
            minHeight: "30px",
            // borderBottom: "2px solid #dce4f0 !important",         
           },

          //  "& .MuiInputBase-input-MuiOutlinedInput-input":{

          //   textAlign:"center"
          //  }
        },
      },
    },
  },
});