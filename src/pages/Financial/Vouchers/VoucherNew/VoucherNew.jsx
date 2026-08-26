import {React, useState} from 'react';
import styles from "./VoucherNew.module.css";
import VoucherHeader from "./VoucherHeader";
import VoucherLineGrid from "./VoucherLineGrid"
import useVoucher from "./useVoucher";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
import { validateVoucher , validateVoucherBalance } from "./voucherNewValidations";


const VoucherNew = () => {

  const { voucher, setVoucher } = useVoucher();

  const [saveStatus, setSaveStatus] = useState(null);



  const [snackbar, setSnackbar] = useState({
    open:false,
    message:"",
    severity:"error"
  });

  const [successSnackbar, setSuccessSnackbar] = useState({
    open:false,
    message:""
  });



  const showErrorSnackbar = (message) => {
    setSnackbar({
      open:true,
      message,
      severity:"error"
    });
  };


  const showSuccessSnackbar = (message) => {
    setSuccessSnackbar({
      open:true,
      message
    });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };



  const handleSave = async () => {
    
      const validationErrors = validateVoucher(voucher);

        if (validationErrors.length > 0) {

          console.log("❌ VALIDATION ERRORS:", validationErrors);

        showErrorSnackbar(
        validationErrors
          .map((error) => error.message)
          .join("\n"),
        "error"
        );

          return;
        }

        console.log("✅ VOUCHER VALIDATION PASSED");
      const balanceValidation = validateVoucherBalance(voucher);

      // کنترل بالانس بودن سند
        if (!balanceValidation.isValid) {

            showErrorSnackbar(
                balanceValidation.message,
                "error"
            );

            return;
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
          let response;

          if (voucher.id) {

              console.log("UPDATE VOUCHER:", payload);

              response = await axios.put(
                  "http://ecipc107:8049/api/Voucher/Update",
                  {
                      ...payload,
                      id: voucher.id
                  }
              );

          } else {

              console.log("INSERT VOUCHER:", payload);

              response = await axios.post(
                  "http://ecipc107:8049/api/Voucher/Insert",
                  payload
              );
          }

      console.log("INSERT RESPONSE:", response.data);

    if (response.data?.isSuccess) {

      const result = response.data.data;

        if(result){

            setVoucher(prev => ({ 
                ...prev,
                id: result.id,
                number: result.number,
                atfNumber: result.atfNumber
            }));

            showSuccessSnackbar(
                voucher.id
                ? "ویرایش سند با موفقیت انجام شد"
                : `سند شماره ${result.number} ثبت شد`,
                "success"
            );

            setSaveStatus({
              type: "saved",
              number: result.number
            });
         }

      } else {

        console.error(
          "❌ VOUCHER INSERT ERROR:",
          response.data?.message
        );

        showErrorSnackbar(
          response.data?.message ||
          "ثبت سند با خطا مواجه شد.",
          "error"
        );
      }

    } catch (error) {

      console.error("❌ INSERT API ERROR:", error);

const apiError = error.response?.data;

console.error("API ERROR DATA:", apiError);

        showErrorSnackbar(
        apiError?.message ||
        apiError?.title ||
        apiError ||
        error.message ||
        "خطا در ارتباط با سرور.",
        "error"
        );
    }
  };
    



return (
  
  
<div>
    
    <div className={styles.TitleRow}>
        <h3 className={styles.Header}>
            {voucher.number 
              ? `سند ${voucher.number}` 
              : "سند جدید"}
        </h3>

        {saveStatus?.type === "saved" && (

            <div className={styles.SavedBadge}>
                ✔ ثبت شده
            </div>
        )}
    </div>

    <VoucherHeader voucher={voucher} setVoucher={setVoucher}/>

  <div>
    
    <VoucherLineGrid 
      voucher={voucher}
      setVoucher={setVoucher}
      onSave={handleSave}
    />

  </div>

    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={closeSnackbar}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Alert
        onClose={closeSnackbar}
        severity={snackbar.severity}
        variant="filled"
        sx={{ direction: "rtl" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>

    <Snackbar
      open={successSnackbar.open}
      autoHideDuration={6000}
      onClose={() =>
        setSuccessSnackbar({
          open:false,
          message:""
        })
      }
      anchorOrigin={{
        vertical:"bottom",
        horizontal:"center"
      }}
    >
      <Alert
        severity="success"
        variant="filled"
        icon={false}
        sx={{
          direction:"rtl",
          width:"auto",
          minHeight:"40px",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          fontSize:"1.2rem",
          fontWeight:700,
          borderRadius:"14px",
          boxShadow:"0 8px 25px rgba(0,0,0,0.25)"
        }}
      >
          <div
            style={{
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              gap:"10px",
              direction:"rtl"
            }}
          >
            <span style={{fontSize:"24px"}}>
              ✅
            </span>

            <span>
              {successSnackbar.message}
            </span>
          </div>

      </Alert>
    </Snackbar>
</div> 

);
}

export default VoucherNew;

