import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  Box, TextField, MenuItem, Button, Accordion, AccordionSummary, AccordionDetails,
  Typography, Snackbar, Alert, Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import ContactPhoneIcon from "@mui/icons-material/ContactPhoneOutlined";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import AccountCodeField from "../../../components/common/Pickers/AccountCodeField";
import FourStateCheckbox from "./FourStateCheckbox";
import { fieldProps } from "../../../theme/Theme";
import useTabs from "../../../context/useTabs";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "http://ecipc107:8049/api" });

const TICK_GROUPS = [
  { title: "کالا و مراکز", items: [
    ["tickHesabiForGood", "کالا"], ["tickHesabiForMarkaz1", "مرکز ۱"], ["tickHesabiForMarkaz2", "مرکز ۲"],
    ["tickHesabiForMarkaz3", "مرکز ۳"], ["tickHesabiForMarkaz4", "مرکز ۴"],
  ]},
  { title: "چک", items: [["tickHesabiForDateCheq", "تاریخ چک"], ["tickHesabiForNumCheq", "شماره چک"]] },
  { title: "تعداد", items: [["tickHesabiForTedad1", "تعداد ۱"], ["tickHesabiForTedad2", "تعداد ۲"], ["tickHesabiForTedad3", "تعداد ۳"]] },
  { title: "ارز", items: [["tickHesabiForCurrencyCode", "کد ارز"], ["tickHesabiForCurrencyFee", "نرخ ارز"], ["tickHesabiForCurrencyTedad", "مقدار ارز"]] },
];
const TICK_FIELDS = TICK_GROUPS.flatMap((g) => g.items.map(([f]) => f));

const SECTIONS = [
  { id: "contact", title: "اطلاعات تماس", subtitle: "موبایل، تلفن، ایمیل و افراد رابط", icon: ContactPhoneIcon, fields: [
    { name: "mobile1", label: "موبایل ۱", ltr: true }, { name: "mobile2", label: "موبایل ۲", ltr: true },
    { name: "mobile3", label: "موبایل ۳", ltr: true }, { name: "tel1", label: "تلفن ۱", ltr: true },
    { name: "tel2", label: "تلفن ۲", ltr: true }, { name: "tel3", label: "تلفن ۳", ltr: true },
    { name: "email", label: "ایمیل", ltr: true }, { name: "addressInternet", label: "وب‌سایت", ltr: true },
    { name: "nameMasool", label: "نام مسئول" }, { name: "nameRabet", label: "نام رابط" },
  ]},
  { id: "address", title: "آدرس", subtitle: "استان، شهر، کد پستی و نشانی", icon: PlaceIcon, fields: [
    { name: "ostan", label: "استان" }, { name: "shahrestan", label: "شهرستان" },
    { name: "shahr", label: "شهر" }, { name: "codeShahr", label: "کد شهر", ltr: true },
    { name: "codePosti", label: "کد پستی", ltr: true },
    { name: "address1", label: "آدرس اصلی", multiline: true, full: true },
    { name: "address2", label: "آدرس دوم", multiline: true, full: true },
  ]},
];

const VALIDATORS = {
  code: (v) => (!v ? "کد حساب الزامی است" : ""),
  name: (v) => (!v?.trim() ? "نام حساب الزامی است" : ""),
  email: (v) => (v && !/^\S+@\S+\.\S+$/.test(v) ? "ایمیل نامعتبر است" : ""),
  mobile1: (v) => (v && !/^09\d{9}$/.test(v) ? "موبایل باید ۱۱ رقم و با ۰۹ شروع شود" : ""),
  codePosti: (v) => (v && !/^\d{10}$/.test(v) ? "کد پستی باید ۱۰ رقم باشد" : ""),
  nationalCode: (v) => (v && !/^\d{10,11}$/.test(v) ? "کد/شناسه ملی نامعتبر است" : ""),
};

const emptyAccount = {
  code: "", name: "", accountType: 0, accountNature: 0, noeShakhs: 0, mahiatShakhs: 0,
  codeShahr: "", ostan: "", shahr: "", shahrestan: "",
  tel1: "", tel2: "", tel3: "", mobile1: "", mobile2: "", mobile3: "",
  address1: "", address2: "", address3: "", address4: "",
  codePosti: "", nameMasool: "", email: "", shomareSabt: "", codeEghtesadi: "",
  nationalCode: "", faaliat: "", nameRabet: "", addressInternet: "", birthDate: "",
  ...Object.fromEntries(TICK_FIELDS.map((f) => [f, 0])),
};

const normalize = (acc) =>
  Object.fromEntries(Object.keys(emptyAccount).map((k) => [k, acc?.[k] ?? emptyAccount[k]]));

const compactGridSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
};

const legalGridSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
  },
};

const accordionSx = {
  mb: 1.5,
  "&.Mui-expanded": { mb: 1.5 },
  "&.Mui-expanded:first-of-type": { mt: 0 },
};

const detailsSx = { p: 2 };
const compactDetailsSx = { p: 1.5 };
// فیلدهای ردیف اصلی: بلندتر؛ کد و نام بولد (هم‌وزن عنوان‌های بخش‌ها)
const mainFieldSx = {
  "& .MuiFilledInput-root": { minHeight: 48 },
  "& .MuiFilledInput-input": { fontSize: 14, fontWeight: 700 },
};
const mainSelectSx = { "& .MuiFilledInput-root": { minHeight: 48 } };

const SectionSummary = ({ title }) => (
  <AccordionSummary
    expandIcon={<ExpandMoreIcon />}
    sx={{ px: 2, "& .MuiAccordionSummary-content": { my: 0.75, alignItems: "center", minWidth: 0 } }}
  >
    <TuneIcon sx={{ fontSize: 20, ml: "12px", flexShrink: 0, color: "primary.main" }} />
    <Typography component="span" sx={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{title}</Typography>
  </AccordionSummary>
);

const CompactSectionSummary = ({ title, icon: IconComp, hasError }) => {
  const IconToRender = IconComp || PlaceIcon;
  return (
    <AccordionSummary
      expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
      sx={{
        px: 2,
        minHeight: 40,
        bgcolor: (t) => alpha(t.palette.action.hover, 0.4),
        "&.Mui-expanded": { minHeight: 40 },
        "& .MuiAccordionSummary-content": { my: 0.5, alignItems: "center", minWidth: 0 },
      }}
    >
      <IconToRender sx={{ fontSize: 18, ml: "10px", flexShrink: 0, color: hasError ? "error.main" : "primary.main" }} />
      <Typography component="span" sx={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{title}</Typography>
    </AccordionSummary>
  );
};

const LockedHint = ({ locked, children }) =>
  locked ? (
    <Tooltip arrow title="به دلیل وجود سند یا زیرحساب، این فیلد قابل تغییر نیست">
      <Box component="span" sx={{ display: "block" }}>{children}</Box>
    </Tooltip>
  ) : (
    children
  );

const Account = ({ tab, onClose, onTabClose, closeTab: propCloseTab }) => {
  const [account, setAccount] = useState(emptyAccount);
  const [original, setOriginal] = useState(emptyAccount);
  const [ticksExpanded, setTicksExpanded] = useState(true);
  const [expandedSection, setExpandedSection] = useState(false);
  const [fieldLocks, setFieldLocks] = useState({ accountType: false, accountNature: false });
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const { updateTab, closeTab: contextCloseTab, openTab } = useTabs();

  const isDirty = useMemo(() => JSON.stringify(account) !== JSON.stringify(original), [account, original]);
  
  const errors = useMemo(
    () => Object.fromEntries(Object.entries(VALIDATORS).map(([k, fn]) => [k, fn(account[k])]).filter(([, e]) => e)),
    [account]
  );

  const notify = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleChange = (field, value) => setAccount((prev) => ({ ...prev, [field]: value }));

  const handleSave = useCallback(async () => {
    if (Object.keys(errors).length) {
      setTouched(Object.fromEntries(Object.keys(errors).map((k) => [k, true])));
      const sectionWithError = SECTIONS.find((s) => s.fields.some((f) => errors[f.name]));
      if (sectionWithError) setExpandedSection(sectionWithError.id);
      if (errors.nationalCode) setExpandedSection("legal");
      notify("لطفاً خطاهای فرم را برطرف کنید.", "warning");
      return false;
    }
    
    setSaving(true);
    try {
      const { data } = await api.post("/Account/Save", account);
      if (data?.isSuccess) {
        setOriginal(account);
        notify("حساب با موفقیت ذخیره شد.");
        return true;
      } else {
        notify(data?.message || "ذخیره با خطا مواجه شد.", "error");
        return false;
      }
    } catch {
      notify("خطا در ارتباط با سرور.", "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [account, errors]);

  // ریف برای نگهداری آخرین نسخه متد ذخیره جهت جلوگیری از لوپ و رندرهای اضافی
  const handleSaveRef = useRef();
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  const tabId = tab?.id;
  const stableOnSave = useCallback((...args) => handleSaveRef.current?.(...args), []);

  useEffect(() => {
    if (tabId) updateTab(tabId, { isDirty, onSave: stableOnSave });
  }, [tabId, isDirty, updateTab, stableOnSave]);
  


const handleNew = () => {
    if (isDirty) {
      // اگر تغییرات ذخیره نشده دارد، اجازه می‌دهیم سیستم تب‌ها مودال هشدار را بیاورد
      // با این تفاوت که بعد از بسته شدن این تب، می‌خواهیم یک تب حساب جدید هم باز شود
      // اما برای سادگی و اینکه دقیقاً همان مودال شما باز شود:
      contextCloseTab(tabId);
      
      // بلافاصله یک تب جدید هم باز می‌کنیم تا کاربر معطل نشود
      openTab({
        title: "ساختار حساب",
        path: "/Account", // یا مسیر فرم حساب شما
        pageType: "account",
        closable: true,
      });
    } else {
      // اگر تغییری نداشت، همین فرم را خالی و ریست می‌کنیم
      setAccount(emptyAccount);
      setOriginal(emptyAccount);
      setTouched({});
      setFieldLocks({ accountType: false, accountNature: false });
    }
  };

  const handleCancelTab = () => {
    if (tabId) {
      contextCloseTab(tabId);
    } else {
      if (typeof onClose === "function") onClose();
      else if (typeof onTabClose === "function") onTabClose();
      else if (typeof propCloseTab === "function") propCloseTab();
      else {
        try { window.close(); } catch { window.history.back(); }
      }
    }
  };

  const handleSelectExisting = async (node) => {
    try {
      const { data } = await api.post("/Account/GetByCode", { code: node.code });
      const next = normalize(data);
      setAccount(next); setOriginal(next); setTouched({});
      setFieldLocks({
        accountType: data.enableAccountType === false,
        accountNature: data.enableAccountNature === false,
      });
    } catch {
      notify("خطا در دریافت جزئیات حساب.", "error");
    }
  };

// مدیریت کلید میانبر Ctrl+S
useEffect(() => {
  const onKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      handleSaveRef.current?.();
    }
  };

  window.addEventListener("keydown", onKey);

  return () => {
    window.removeEventListener("keydown", onKey);
  };
}, []);

  const renderField = ({ name, label, ltr, multiline, full, sx }) => {
    const base = fieldProps(label);
    return (
      <TextField
        key={name}
        {...base}
        slotProps={{
          ...base.slotProps,
          htmlInput: { ...base.slotProps.htmlInput, ...(ltr && { dir: "ltr", style: { textAlign: "left" } }) },
        }}
        value={account[name]}
        onChange={(e) => handleChange(name, e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, [name]: true }))}
        error={touched[name] && !!errors[name]}
        helperText={touched[name] && errors[name]}
        multiline={multiline}
        minRows={multiline ? 1.5 : undefined}
        sx={full ? { gridColumn: "1 / -1" } : sx}
      />
    );
  };

  const isLegalPerson = account.noeShakhs === 1;
  const legalFields = isLegalPerson
    ? [{ name: "shomareSabt", label: "شماره ثبت", ltr: true }, { name: "codeEghtesadi", label: "کد اقتصادی", ltr: true },
       { name: "nationalCode", label: "شناسه ملی", ltr: true }, { name: "faaliat", label: "نوع فعالیت" }]
    : [{ name: "nationalCode", label: "کد ملی", ltr: true }, { name: "birthDate", label: "تاریخ تولد", ltr: true },
       { name: "codeEghtesadi", label: "کد اقتصادی", ltr: true }, { name: "faaliat", label: "شغل / فعالیت" }];

  return (
    <Box dir="rtl" sx={{ px: { xs: 2, md: 3 }, py: 2, maxWidth: 1080, mx: "auto" }}>

      {/* Main info */}
      <Box
        component="section"
        aria-label="اطلاعات اصلی"
        sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 2.5, p: 2, mb: 1.5 }}
      >
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "240px 1fr 170px 170px" } }}>
          <AccountCodeField
            value={account.code}
            onChange={(code) => handleChange("code", code)}
            onSelect={handleSelectExisting}
            onMismatch={() => { setAccount((p) => ({ ...emptyAccount, code: p.code })); }}
            allowAnyLevel
            sx={mainFieldSx}
          />
          {renderField({ name: "name", label: "نام حساب", sx: mainFieldSx })}
          <LockedHint locked={fieldLocks.accountType}>
            <TextField select {...fieldProps("نوع حساب")} value={account.accountType}
              disabled={fieldLocks.accountType} sx={mainSelectSx}
              onChange={(e) => handleChange("accountType", Number(e.target.value))}>
              <MenuItem value={0}>کل</MenuItem><MenuItem value={1}>معین</MenuItem><MenuItem value={2}>تفصیلی</MenuItem>
            </TextField>
          </LockedHint>
          <LockedHint locked={fieldLocks.accountNature}>
            <TextField select {...fieldProps("ماهیت حساب")} value={account.accountNature}
              disabled={fieldLocks.accountNature} sx={mainSelectSx}
              onChange={(e) => handleChange("accountNature", Number(e.target.value))}>
              <MenuItem value={0}>بدهکار</MenuItem><MenuItem value={1}>بستانکار</MenuItem>
            </TextField>
          </LockedHint>
        </Box>
      </Box>

      {/* Ticks */}
      <Accordion expanded={ticksExpanded} onChange={(_, exp) => setTicksExpanded(exp)} disableGutters sx={accordionSx}>
        <SectionSummary title="قابلیت‌های حساب" />
        <AccordionDetails sx={detailsSx}>
          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
            {TICK_GROUPS.map((g) => {
              const active = g.items.filter(([f]) => account[f]).length;
              return (
                <Box key={g.title} sx={{
                  p: 1.5, borderRadius: 2, border: 1,
                  borderColor: active ? "primary.main" : "divider",
                  bgcolor: active ? (t) => alpha(t.palette.primary.main, 0.04) : "background.default",
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>{g.title}</Typography>
                  </Box>

                  {g.title === "کالا و مراکز" ? (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0.5 }}>
                      <Box sx={{ gridColumn: "span 2" }}>
                        <FourStateCheckbox label="کالا" value={account["tickHesabiForGood"]}
                          onChange={(val) => handleChange("tickHesabiForGood", val)} />
                      </Box>
                      <Box><FourStateCheckbox label="مرکز ۱" value={account["tickHesabiForMarkaz1"]} onChange={(val) => handleChange("tickHesabiForMarkaz1", val)} /></Box>
                      <Box><FourStateCheckbox label="مرکز ۲" value={account["tickHesabiForMarkaz2"]} onChange={(val) => handleChange("tickHesabiForMarkaz2", val)} /></Box>
                      <Box><FourStateCheckbox label="مرکز ۳" value={account["tickHesabiForMarkaz3"]} onChange={(val) => handleChange("tickHesabiForMarkaz3", val)} /></Box>
                      <Box><FourStateCheckbox label="مرکز ۴" value={account["tickHesabiForMarkaz4"]} onChange={(val) => handleChange("tickHesabiForMarkaz4", val)} /></Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {g.items.map(([field, label]) => (
                        <Box key={field} sx={{ width: g.items.length > 2 ? "48%" : "100%", minWidth: "110px" }}>
                          <FourStateCheckbox label={label} value={account[field]}
                            onChange={(val) => handleChange(field, val)} />
                        </Box>
                      ))}
                    </Box>
                  )}

                </Box>
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Contact / Address */}
      {SECTIONS.map((s) => (
        <Accordion
          key={s.id}
          expanded={expandedSection === s.id}
          onChange={(_, isExpanded) => setExpandedSection(isExpanded ? s.id : false)}
          disableGutters
          sx={accordionSx}
        >
          <CompactSectionSummary title={s.title} icon={s.icon}
            hasError={s.fields.some((f) => touched[f.name] && errors[f.name])} />
          <AccordionDetails sx={{ ...compactDetailsSx, ...compactGridSx }}>{s.fields.map(renderField)}</AccordionDetails>
        </Accordion>
      ))}

      {/* Legal */}
      <Accordion
        expanded={expandedSection === "legal"}
        onChange={(_, isExpanded) => setExpandedSection(isExpanded ? "legal" : false)}
        disableGutters
        sx={accordionSx}
      >
        <CompactSectionSummary title="اطلاعات ثبتی و حقوقی" icon={BadgeIcon}
          hasError={touched.nationalCode && !!errors.nationalCode} />
        <AccordionDetails sx={{ ...compactDetailsSx, ...legalGridSx }}>
          <TextField select {...fieldProps("نوع شخص")} value={account.noeShakhs}
                     sx={{ width: 180, maxWidth: "100%",}} 
            onChange={(e) => handleChange("noeShakhs", Number(e.target.value))}>
            <MenuItem value={0}>حقیقی</MenuItem><MenuItem value={1}>حقوقی</MenuItem>
          </TextField>
          <TextField select {...fieldProps("ماهیت شخص")} value={account.mahiatShakhs} 
                     sx={{ width: 180, maxWidth: "100%",}} 
            onChange={(e) => handleChange("mahiatShakhs", Number(e.target.value))}>
            <MenuItem value={0}>مشتری</MenuItem><MenuItem value={1}>تامین‌کننده</MenuItem>
          </TextField>
          {legalFields.map(renderField)}
        </AccordionDetails>
      </Accordion>

      {/* Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ minWidth: 120 }}>
          {saving ? "در حال ذخیره..." : "ذخیره حساب"}
        </Button>
        <Button variant="outlined" onClick={handleNew}>حساب جدید</Button>
        <Button variant="outlined" color="inherit" onClick={handleCancelTab} disabled={saving}>
          انصراف
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert variant="filled" severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Account;