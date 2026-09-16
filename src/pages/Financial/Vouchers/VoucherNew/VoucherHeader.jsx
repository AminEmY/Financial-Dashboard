import { useEffect, useRef } from "react";
import { InputBase, Select, MenuItem } from "@mui/material";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { toEnglishDigits } from "../../../../utils/formatter";
import styles from "./VoucherNew.module.css";
import Toolbar from "react-multi-date-picker/plugins/toolbar";

const VoucherHeader = ({ voucher, setVoucher, onDescriptionEnter }) => {

    const handleChange = (field, value) => {
        setVoucher({
            ...voucher,
            [field]: value,
        });
    };

    const dateInputRef = useRef(null);
    const sharhInputRef = useRef(null);
    const tozihatInputRef = useRef(null);

    // فوکوس خودکار روی تاریخ، همون لحظه‌ی باز شدن تب - بدون نیاز به کلیک موس
    useEffect(() => {
        const timer = setTimeout(() => {
            dateInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

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
        plugins={[
          <Toolbar
            key="toolbar"
            position="bottom"
            names={{
              today: "امروز",
              deselect: "پاک کردن",
              close: "بستن",
            }}
          />
          ]}
        onChange={(dateObject) => {
          if (dateObject) {
            handleChange("date", toEnglishDigits(dateObject.format("YYYY/MM/DD")));
          }
        }}
        render={(value, openCalendar, handleValueChange) => (
          <div className={styles.FieldBox} onClick={openCalendar}>
            <span className={styles.FieldLabel}>تاریخ</span>
            <InputBase
              className={styles.FieldInput}
              inputRef={dateInputRef}
              value={value}
              onChange={handleValueChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sharhInputRef.current?.focus();
                }
              }}
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
          inputRef={sharhInputRef}
          value={voucher.sharh || ""}
          onChange={(e) => handleChange("sharh", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              tozihatInputRef.current?.focus();
            }
          }}
        />
      </div>

      <div className={styles.FieldBox}>
        <span className={styles.FieldLabel}>توضیحات</span>
        <InputBase
          className={styles.FieldInput}
          inputRef={tozihatInputRef}
          value={voucher.tozihat || ""}
          onChange={(e) => handleChange("tozihat", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onDescriptionEnter?.();
            }
          }}
        />
      </div>
    </div>
  </div>
  );
};

export default VoucherHeader;