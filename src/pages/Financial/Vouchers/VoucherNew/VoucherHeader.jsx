import { TextField , MenuItem } from "@mui/material";
import styles from "./VoucherNew.module.css";


const VoucherHeader = ({ voucher, setVoucher }) => {

    const handleChange = (field, value) => {
    setVoucher({
                    ...voucher,
                    [field]: value,
                                     });
                                          };
  return (
    <div className={styles.HeaderForm}>

      {/* شماره سند توسط Backend تولید می‌شود */}
      <TextField
        label="شماره سند"
        value={voucher.number || ""}
        size="small"
        disabled
      />

      <TextField
        label="شماره فرعی"
        type="number"
        value={voucher.subNumber ?? ""}
        onChange={(e) => handleChange("subNumber", e.target.value)}
        size="small"
        inputProps={{ min: 0 }}
      />

      <TextField
        select
        label="وضعیت سند"
        value={voucher.state ?? 0}
        onChange={(e) => handleChange("state", Number(e.target.value))}
        size="small"
      >
        <MenuItem value={0}>پیش‌نویس</MenuItem>
        <MenuItem value={1}>موقت</MenuItem>
        <MenuItem value={2}>دائم</MenuItem>
      </TextField>

      <TextField
        label="تاریخ"
        value={voucher.date || ""}
        onChange={(e) => handleChange("date", e.target.value)}
        size="small"
      />
  
      <TextField className={styles.ShrhToz}
        label="شرح"
        value={voucher.sharh || ""}
        onChange={(e) => handleChange("sharh", e.target.value)}
        size="small"
      />

      <TextField className={styles.ShrhToz}
        label="توضیحات"
        value={voucher.tozihat || ""}
        onChange={(e) => handleChange("tozihat", e.target.value)}
        size="small"
      />

    </div>
  );
};

export default VoucherHeader;