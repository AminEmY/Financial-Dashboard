import {React} from 'react';
import styles from "./VoucherNew.module.css";
import VoucherHeader from "./VoucherHeader";
import VoucherLineGrid from "./VoucherLineGrid"
import useVoucher from "./useVoucher";
import { Button } from '@mui/material';
import axios from "axios";



const VoucherNew = () => {

  const { voucher, setVoucher } = useVoucher();

  const handleSave = async () => {
    
    
    if (Number(voucher.state) !== 0) {

      for (const line of voucher.lines) {

          // ردیف خالی فعلاً در این Validation بررسی نمی‌شود
          if (!line.accountCode) continue;

          const features = line.accountFeatures;
          if (!features) continue;

          const requiredFeatures = [
              ["goodAble", "good", "کالا"],
              ["markaz1Able", "markaz1", "مرکز هزینه ۱"],
              ["markaz2Able", "markaz2", "مرکز هزینه ۲"],
              ["markaz3Able", "markaz3", "مرکز هزینه ۳"],
              ["markaz4Able", "markaz4", "مرکز هزینه ۴"],
              ["dateCheqAble", "dateCheq", "تاریخ چک"],
              ["numCheqAble", "numCheq", "شماره چک"],
              ["tedad1Able", "tedad1", "تعداد ۱"],
              ["tedad2Able", "tedad2", "تعداد ۲"],
              ["tedad3Able", "tedad3", "تعداد ۳"],
              ["currencyCodeAble", "currencyCode", "کد ارز"],
              ["currencyFeeAble", "currencyFee", "نرخ ارز"],
              ["currencyTedadAble", "currencyTedad", "مقدار ارز"],
          ];

          for (const [ableField, valueField, title] of requiredFeatures) {

              if (
                  features[ableField] === true &&
                  (line[valueField] === undefined ||
                    line[valueField] === null ||
                    String(line[valueField]).trim() === "")
              ) {
                  console.log("VALIDATION ERROR:", {
                      row: line.row,
                      accountCode: line.accountCode,
                      field: valueField,
                      title
                  });

                  //  setSnackbar({
                  //      open: true,
                  //      message: `ردیف ${line.row}: مقدار ${title} برای حساب ${line.accountCode} الزامی است.`,
                  //      severity: "error"
                  //  });

                  return;
              }
          }
      }
     } 

      

    // ========================================
    // BUILD API PAYLOAD
    // ========================================

      const validLines = voucher.lines.filter(
      (line) => line.accountCode
      );

      const payload = {
      state: Number(voucher.state),
      subNumber: Number(voucher.subNumber || 0),
      date: voucher.date,
      sharh: voucher.sharh,
      tozihat: voucher.tozihat,

      debtorAmount: validLines.reduce(
        (sum, line) => sum + Number(line.debtorAmount || 0),
        0
      ),

      creditorAmount: validLines.reduce(
        (sum, line) => sum + Number(line.creditorAmount || 0),
        0
      ),

      countOfLines: validLines.length,

      inserterCode: voucher.inserterCode,

      lines: validLines.map((line, index) => ({
        row: index,
        accountCode: line.accountCode,

        markaz1Code: line.markaz1 || "",
        markaz2Code: line.markaz2 || "",
        markaz3Code: line.markaz3 || "",
        markaz4Code: line.markaz4 || "",

        goodCode: line.good || "",

        currencyCode: Number(line.currencyCode || 0),
        currencyTedad: Number(line.currencyTedad || 0),
        currencyFee: Number(line.currencyFee || 0),

        tedad1: Number(line.tedad1 || 0),
        tedad2: Number(line.tedad2 || 0),
        tedad3: Number(line.tedad3 || 0),

        sharh: line.sharh || "",

        dateCheq: line.dateCheq || "",
        numCheq: line.numCheq || "",

        debtorAmount: Number(line.debtorAmount || 0),
        creditorAmount: Number(line.creditorAmount || 0),
      })),

      subDomain: voucher.subDomain,
      reference: voucher.reference,
      type: voucher.type,
    };

    console.log("INSERT PAYLOAD:", payload);

    // ========================================
    // SEND TO API
    // ========================================

    try {
      const response = await axios.post(
        "http://ecipc107:8049/api/Voucher/Insert",
        payload
      );

      console.log("INSERT RESPONSE:", response.data);

      if (response.data?.isSuccess) {

        console.log("✅ VOUCHER INSERTED:", response.data.data);

        // اطلاعاتی که Backend ساخته
        const insertedVoucher = response.data.data;

        // شماره سند و ID برگشتی را داخل state نگه می‌داریم
        setVoucher((prev) => ({
          ...prev,
          number: insertedVoucher?.number ?? prev.number,
          id: insertedVoucher?.id ?? prev.id,
        }));

        // پیام موفقیت
        // فعلاً برای تست:
        alert(
          `سند با موفقیت ثبت شد.\nشماره سند: ${insertedVoucher?.number ?? "-"}`
        );

      } else {

        console.error(
          "❌ VOUCHER INSERT ERROR:",
          response.data?.message
        );

        alert(
          response.data?.message ||
          "ثبت سند با خطا مواجه شد."
        );
      }

    } catch (error) {

      console.error("❌ INSERT API ERROR:", error);

const apiError = error.response?.data;

console.error("API ERROR DATA:", apiError);

          alert(
            apiError?.message ||
            apiError?.title ||
            apiError?.errors ||
            apiError ||
            error.message ||
            "خطا در ارتباط با سرور."
          );
    }
  };
    



return (
  
  
  <div>
    
    <h3 className={styles.Header}>سند جدید</h3>

    <VoucherHeader voucher={voucher} setVoucher={setVoucher}/>

  <div>
    
    <VoucherLineGrid 
      voucher={voucher}
      setVoucher={setVoucher}
      onSave={handleSave}
    />

  </div>


</div> 

);
}

export default VoucherNew;

