import { InputBase, Select, MenuItem } from "@mui/material";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
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

    <div className={styles.HeaderRow}>

      {/* شماره سند توسط Backend تولید می‌شود */}
      <div className={styles.FieldBox}>
        <span className={styles.FieldLabel}>شماره سند</span>
        <InputBase
          className={styles.FieldInput}
          value={voucher.number || ""}
          disabled
        />
      </div>

      <div className={styles.FieldBox}>
        <span className={styles.FieldLabel}>شماره فرعی</span>
        <InputBase
          className={styles.FieldInput}
          type="number"
          value={voucher.subNumber ?? ""}
          onChange={(e) => handleChange("subNumber", e.target.value)}
          inputProps={{ min: 0 }}
        />
      </div>

      <div className={styles.FieldBox}>
        <span className={styles.FieldLabel}>وضعیت سند</span>
        <Select
          className={styles.FieldInput}
          variant="standard"
          disableUnderline
          value={voucher.state ?? 0}
          onChange={(e) => handleChange("state", Number(e.target.value))}
        >
          <MenuItem value={0}>پیش‌نویس</MenuItem>
          <MenuItem value={1}>موقت</MenuItem>
          <MenuItem value={2}>دائم</MenuItem>
        </Select>
      </div>

      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={voucher.date || ""}
        format="YYYY/MM/DD"
        calendarPosition="bottom-right"
        onChange={(dateObject) => {
          if (dateObject) {
            handleChange("date", dateObject.format("YYYY/MM/DD"));
          }
        }}
        render={(value, openCalendar, handleValueChange) => (
          <div className={styles.FieldBox} onClick={openCalendar}>
            <span className={styles.FieldLabel}>تاریخ</span>
            <InputBase
              className={styles.FieldInput}
              value={value}
              onChange={handleValueChange}
              placeholder="1404/01/01"
            />
          </div>
        )}
      />
    </div>

    <div className={styles.HeaderRow2}>
      <div className={styles.FieldBox}>
        <span className={styles.FieldLabel}>شرح</span>
        <InputBase
          className={styles.FieldInput}
          value={voucher.sharh || ""}
          onChange={(e) => handleChange("sharh", e.target.value)}
        />
      </div>

      <div className={styles.FieldBox}>
        <span className={styles.FieldLabel}>توضیحات</span>
        <InputBase
          className={styles.FieldInput}
          value={voucher.tozihat || ""}
          onChange={(e) => handleChange("tozihat", e.target.value)}
        />
      </div>
    </div>
  </div>
  );
};

export default VoucherHeader;