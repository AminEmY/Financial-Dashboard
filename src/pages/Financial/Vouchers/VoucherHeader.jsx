import { TextField } from "@mui/material";
import styles from "./VoucherNew.module.css";

const VoucherHeader = ({ voucher, setVoucher }) => {
  return (
    <div className={styles.HeaderForm}>

      <TextField
        label="شماره سند"
        value={voucher.number}
        onChange={(e) =>
          setVoucher({
            ...voucher,
            number: e.target.value,
          })
        }
      />

      <TextField
        label="تاریخ"
        value={voucher.date}
        onChange={(e) =>
          setVoucher({
            ...voucher,
            date: e.target.value,
          })
        }
      />

      <TextField
        label="شرح"
        value={voucher.sharh}
        onChange={(e) =>
          setVoucher({
            ...voucher,
            sharh: e.target.value,
          })
        }
      />

      <TextField
        label="توضیحات"
        value={voucher.tozihat}
        onChange={(e) =>
          setVoucher({
            ...voucher,
            tozihat: e.target.value,
          })
        }
      />

    </div>
  );
};

export default VoucherHeader;