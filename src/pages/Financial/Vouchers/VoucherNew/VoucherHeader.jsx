import { useEffect, useRef } from "react";
import { TextField, MenuItem } from "@mui/material";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { toEnglishDigits } from "../../../../utils/formatter";
import { fieldProps } from "../../../../theme/Theme";
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

  // فوکوس خودکار روی تاریخ هنگام باز شدن تب
  useEffect(() => {
    const timer = setTimeout(() => {
      dateInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const subNumberProps = fieldProps("شماره فرعی");

  return (
    <div className={styles.HeaderForm}>
      <div className={styles.HeaderRow}>
        {/* شماره سند توسط Backend تولید می‌شود */}
        <TextField
          {...fieldProps("شماره سند")}
          value={voucher.number || ""}
          disabled
        />

        <TextField
          {...subNumberProps}
          slotProps={{
            ...subNumberProps.slotProps,
            htmlInput: {
              ...subNumberProps.slotProps.htmlInput,
              min: 0,
            },
          }}
          type="number"
          value={voucher.subNumber ?? ""}
          onChange={(e) => handleChange("subNumber", e.target.value)}
        />

        <TextField
          select
          {...fieldProps("وضعیت سند")}
          value={voucher.state ?? 0}
          onChange={(e) =>
            handleChange("state", Number(e.target.value))
          }
        >
          <MenuItem value={0}>پیش نویس</MenuItem>
          <MenuItem value={1}>موقت</MenuItem>
          <MenuItem value={2}>دائم</MenuItem>
        </TextField>

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
            />,
          ]}
          onChange={(dateObject) => {
            if (dateObject) {
              handleChange(
                "date",
                toEnglishDigits(dateObject.format("YYYY/MM/DD"))
              );
            }
          }}
          render={(value, openCalendar, handleValueChange) => (
            <TextField
              {...fieldProps("تاریخ")}
              inputRef={dateInputRef}
              value={value}
              onClick={openCalendar}
              onChange={handleValueChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sharhInputRef.current?.focus();
                }
              }}
              placeholder="1404/01/01"
            />
          )}
        />
      </div>

      <div className={styles.HeaderRow2}>
        <TextField
          {...fieldProps("شرح", {}, { alignTextOnFocus: true })}
          value={voucher.sharh || ""}
          inputRef={sharhInputRef}
          onChange={(e) => handleChange("sharh", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              tozihatInputRef.current?.focus();
            }
          }}
        />

        <TextField
          {...fieldProps("توضیحات", {}, { alignTextOnFocus: true })}
          value={voucher.tozihat || ""}
          inputRef={tozihatInputRef}
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
  );
};

export default VoucherHeader;