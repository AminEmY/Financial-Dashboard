import { useState } from "react";
import axios from "axios";
import {
  Box, TextField, MenuItem, Button, Accordion, AccordionSummary,
  AccordionDetails, Typography, Snackbar, Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountCodeField from "../../../components/common/Pickers/AccountCodeField";
import FourStateCheckbox from "./FourStateCheckbox";
import { fieldProps } from "../../../theme/Theme";



const TICK_FIELDS = [
  { field: "tickHesabiForGood", label: "کالا" },
  { field: "tickHesabiForMarkaz1", label: "مرکز ۱" },
  { field: "tickHesabiForMarkaz2", label: "مرکز ۲" },
  { field: "tickHesabiForMarkaz3", label: "مرکز ۳" },
  { field: "tickHesabiForMarkaz4", label: "مرکز ۴" },
  { field: "tickHesabiForDateCheq", label: "تاریخ چک" },
  { field: "tickHesabiForNumCheq", label: "شماره چک" },
  { field: "tickHesabiForTedad1", label: "تعداد ۱" },
  { field: "tickHesabiForTedad2", label: "تعداد ۲" },
  { field: "tickHesabiForTedad3", label: "تعداد ۳" },
  { field: "tickHesabiForCurrencyCode", label: "کد ارز" },
  { field: "tickHesabiForCurrencyFee", label: "نرخ ارز" },
  { field: "tickHesabiForCurrencyTedad", label: "مقدار ارز" },
];

const CONTACT_FIELDS = [
  ["tel1", "تلفن ۱"], ["tel2", "تلفن ۲"], ["tel3", "تلفن ۳"],
  ["mobile1", "موبایل ۱"], ["mobile2", "موبایل ۲"], ["mobile3", "موبایل ۳"],
  ["email", "ایمیل"], ["nameMasool", "نام مسئول"], ["nameRabet", "نام رابط"],
  ["addressInternet", "آدرس اینترنتی"],
];

const ADDRESS_FIELDS = [
  ["ostan", "استان"], ["shahr", "شهر"], ["shahrestan", "شهرستان"], ["codeShahr", "کد شهر"],
  ["codePosti", "کد پستی"], ["address1", "آدرس ۱"], ["address2", "آدرس ۲"],
  ["address3", "آدرس ۳"], ["address4", "آدرس ۴"],
];

const LEGAL_FIELDS = [
  ["shomareSabt", "شماره ثبت"], ["codeEghtesadi", "کد اقتصادی"], ["nationalCode", "کد ملی"],
  ["faaliat", "نوع فعالیت"], ["birthDate", "تاریخ تولد"],
];

const emptyAccount = {
  code: "", name: "",
  accountType: 0, accountNature: 0,
  noeShakhs: 0, mahiatShakhs: 0,
  codeShahr: "", ostan: "", shahr: "", shahrestan: "",
  tel1: "", tel2: "", tel3: "", mobile1: "", mobile2: "", mobile3: "",
  address1: "", address2: "", address3: "", address4: "",
  codePosti: "", nameMasool: "", email: "", shomareSabt: "",
  codeEghtesadi: "", nationalCode: "", faaliat: "", nameRabet: "",
  addressInternet: "", birthDate: "",
  ...Object.fromEntries(TICK_FIELDS.map((t) => [t.field, 0])),
};

const Account = () => {
  const [account, setAccount] = useState(emptyAccount);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [fieldLocks, setFieldLocks] = useState({ accountType: false, accountNature: false });

  const [expandedSection, setExpandedSection] = useState(false);
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  

  const handleChange = (field, value) => {
    setAccount((prev) => ({ ...prev, [field]: value }));
  };

  const handleTickChange = (field, value) => {
    setAccount((prev) => ({ ...prev, [field]: value }));
  };

  // وقتی از مودال (سرچ یا درخت) یه حساب موجود انتخاب شد: جزئیاتش رو با GetForVoucher می‌گیریم و فرم رو پُر می‌کنیم
  // وقتی از مودال (سرچ یا درخت) یه حساب موجود انتخاب شد: جزئیاتش رو با GetByCode می‌گیریم و فرم رو پُر می‌کنیم
  const handleSelectExisting = async (node) => {
    try {
      const res = await axios.post("http://ecipc107:8049/api/Account/GetByCode", {
        code: node.code,
      });
      const acc = res.data;

      setAccount((prev) => ({
        ...prev,
        code: acc.code,
        name: acc.name,
        accountType: acc.accountType ?? 0,
        accountNature: acc.accountNature ?? 0,
        tickHesabiForGood: acc.tickHesabiForGood ?? 0,
        tickHesabiForMarkaz1: acc.tickHesabiForMarkaz1 ?? 0,
        tickHesabiForMarkaz2: acc.tickHesabiForMarkaz2 ?? 0,
        tickHesabiForMarkaz3: acc.tickHesabiForMarkaz3 ?? 0,
        tickHesabiForMarkaz4: acc.tickHesabiForMarkaz4 ?? 0,
        tickHesabiForDateCheq: acc.tickHesabiForDateCheq ?? 0,
        tickHesabiForNumCheq: acc.tickHesabiForNumCheq ?? 0,
        tickHesabiForTedad1: acc.tickHesabiForTedad1 ?? 0,
        tickHesabiForTedad2: acc.tickHesabiForTedad2 ?? 0,
        tickHesabiForTedad3: acc.tickHesabiForTedad3 ?? 0,
        tickHesabiForCurrencyCode: acc.tickHesabiForCurrencyCode ?? 0,
        tickHesabiForCurrencyFee: acc.tickHesabiForCurrencyFee ?? 0,
        tickHesabiForCurrencyTedad: acc.tickHesabiForCurrencyTedad ?? 0,
        codeShahr: acc.codeShahr ?? "",
        ostan: acc.ostan ?? "",
        shahr: acc.shahr ?? "",
        shahrestan: acc.shahrestan ?? "",
        tel1: acc.tel1 ?? "",
        tel2: acc.tel2 ?? "",
        tel3: acc.tel3 ?? "",
        mobile1: acc.mobile1 ?? "",
        mobile2: acc.mobile2 ?? "",
        mobile3: acc.mobile3 ?? "",
        address1: acc.address1 ?? "",
        address2: acc.address2 ?? "",
        address3: acc.address3 ?? "",
        address4: acc.address4 ?? "",
        codePosti: acc.codePosti ?? "",
        nameMasool: acc.nameMasool ?? "",
        email: acc.email ?? "",
        shomareSabt: acc.shomareSabt ?? "",
        codeEghtesadi: acc.codeEghtesadi ?? "",
        nationalCode: acc.nationalCode ?? "",
        faaliat: acc.faaliat ?? "",
        nameRabet: acc.nameRabet ?? "",
        addressInternet: acc.addressInternet ?? "",
        birthDate: acc.birthDate ?? "",
        noeShakhs: acc.noeShakhs ?? 0,
        mahiatShakhs: acc.mahiatShakhs ?? 0,
      }));

      // اگر سرور بگه این حساب اجازه‌ی تغییر نوع/ماهیت نداره، همون فیلدها رو قفل می‌کنیم
      setFieldLocks({
        accountType: acc.enableAccountType === false,
        accountNature: acc.enableAccountNature === false,
      });
    } catch (error) {
      console.error("خطا در دریافت جزئیات حساب:", error);
      setSnackbar({ open: true, message: "خطا در دریافت جزئیات حساب.", severity: "error" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.post("http://ecipc107:8049/api/Account/Save", account);
      if (res.data?.isSuccess) {
        setSnackbar({ open: true, message: "حساب با موفقیت ذخیره شد.", severity: "success" });
      } else {
        setSnackbar({ open: true, message: res.data?.message || "ذخیره با خطا مواجه شد.", severity: "error" });
      }
    } catch (error) {
      console.error("خطای ذخیره‌ی حساب:", error);
      setSnackbar({ open: true, message: "خطا در ارتباط با سرور.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      dir="rtl"
      sx={{ p: 3, maxWidth: 1000, mx: "auto", color: "text.primary", boxSizing: "border-box" }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>ایجاد / ویرایش حساب</Typography>

      {/* اطلاعات پایه */}
      <Box
        sx={{
          p: 2, mb: 2, display: "flex", gap: 1.5, flexWrap: "wrap",alignItems: "center",
          bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2,
        }}
      >
        <AccountCodeField
          value={account.code}
          onChange={(code) => handleChange("code", code)}
          onSelect={handleSelectExisting}
          onMismatch={() => setAccount((prev) => ({ ...emptyAccount, code: prev.code }))}
          allowAnyLevel
          sx={{ width: 220 }}
        />

        <TextField
          {...fieldProps("نام حساب :")}
          value={account.name}
          onChange={(e) => handleChange("name", e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
        />

        <TextField
          select
          {...fieldProps("نوع حساب :")}
          sx={{ width: 150 }}
          value={account.accountType}
          disabled={fieldLocks.accountType}
          onChange={(e) => handleChange("accountType", Number(e.target.value))}
        >
          <MenuItem value={0}>کل</MenuItem>
          <MenuItem value={1}>معین</MenuItem>
          <MenuItem value={2}>تفصیلی</MenuItem>
        </TextField>

        <TextField
          select
          {...fieldProps("ماهیت حساب :")}
          sx={{ width: 170 }}
          value={account.accountNature}
          disabled={fieldLocks.accountNature}
          onChange={(e) => handleChange("accountNature", Number(e.target.value))}
        >
          <MenuItem value={0}>بدهکار</MenuItem>
          <MenuItem value={1}>بستانکار</MenuItem>
        </TextField>
      </Box>

      {/* قابلیت‌های حساب (تیک‌ها) */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>قابلیت‌های حساب</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 1 }}
        >
          {TICK_FIELDS.map(({ field, label }) => (
            <FourStateCheckbox
              key={field}
              label={label}
              value={account[field]}
              onChange={(val) => handleTickChange(field, val)}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* اطلاعات تماس */}
      <Accordion expanded={expandedSection === "contact"} onChange={handleAccordionChange("contact")}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>اطلاعات تماس</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 1.5 }}
        >
          {CONTACT_FIELDS.map(([field, label]) => (
            <TextField
              key={field}
              {...fieldProps(label)}
              value={account[field]}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* آدرس */}
      <Accordion expanded={expandedSection === "address"} onChange={handleAccordionChange("address")}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>آدرس</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 1.5 }}
        >
          {ADDRESS_FIELDS.map(([field, label]) => (
            <TextField
              key={field}
              {...fieldProps(label)}
              value={account[field]}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* اطلاعات ثبتی/حقوقی */}
      <Accordion expanded={expandedSection === "legal"} onChange={handleAccordionChange("legal")}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>اطلاعات ثبتی و حقوقی</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 1.5 }}
        >
          {LEGAL_FIELDS.map(([field, label]) => (
            <TextField
              key={field}
              {...fieldProps(label)}
              value={account[field]}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          ))}

          <TextField
            select
            {...fieldProps("نوع شخص")}
            value={account.noeShakhs}
            onChange={(e) => handleChange("noeShakhs", Number(e.target.value))}
          >
            <MenuItem value={0}>حقیقی</MenuItem>
            <MenuItem value={1}>حقوقی</MenuItem>
          </TextField>

          <TextField
            select
            {...fieldProps("ماهیت شخص")}
            value={account.mahiatShakhs}
            onChange={(e) => handleChange("mahiatShakhs", Number(e.target.value))}
          >
            <MenuItem value={0}>مشتری</MenuItem>
            <MenuItem value={1}>تامین‌کننده</MenuItem>
          </TextField>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره حساب"}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Account;