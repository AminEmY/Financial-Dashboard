import { createTheme } from "@mui/material/styles";

export const Theme = createTheme({
  direction: "rtl",

  palette: {
    mode: "light",
    primary: {
      main: "#2563eb", // آبی استاندارد پروژه
      light: "#60a5fa",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0f172a", // رنگ تیره ناوبری و سایبار
      light: "#1e293b",
      dark: "#020617",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
      disabled: "#94a3b8",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
    success: {
      main: "#10b981",
    },
    divider: "#e2e8f0",
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
        body: {
          fontFamily: '"IRANSansX", sans-serif',
          backgroundColor: "#f8fafc",
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
          fontSize: "0.875rem",
        },
        input: {
          fontFamily: '"IRANSansX", sans-serif',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"IRANSansX", sans-serif',
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
          backgroundColor: "#ffffff",
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#f1f5f9 !important",
            borderBottom: "2px solid #94a3b8 !important",
            borderLeft: "1px solid #e2e8f0",
            color: "#0f172a !important",
            fontWeight: "700 !important",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontFamily: '"IRANSansX", sans-serif',
            fontWeight: 700,
            fontSize: "0.8125rem",
          },
          "& .MuiDataGrid-cell": {
            fontFamily: '"IRANSansX", sans-serif',
            borderLeft: "1px solid #e2e8f0",
            fontSize: "0.85rem",
          },
        },
      },
    },
  },
});