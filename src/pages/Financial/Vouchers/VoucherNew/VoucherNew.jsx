import {React, useState, useEffect} from 'react';
import styles from "./VoucherNew.module.css";
import VoucherHeader from "./VoucherHeader";
import VoucherLineGrid from "./VoucherLineGrid"
import useVoucher from "./useVoucher";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
import { validateVoucher , validateVoucherBalance } from "./voucherNewValidations";
import useTabs from "../../../../context/useTabs";


const VoucherNew = ({ tab }) => {

  const { voucher, setVoucher, loading, loadError, loadVoucherById } = useVoucher();

  const { updateTab } = useTabs();

  const [saveStatus, setSaveStatus] = useState(null);


  // اگر تب با آیدی یک سند باز شده باشد (کلیک روی سند در لیست)، اطلاعاتش از سرور خوانده می‌شود
  useEffect(() => {
    const voucherId = tab?.data?.id;
    if (voucherId) {
      loadVoucherById(voucherId);
    }
  }, [tab?.data?.id, loadVoucherById]);


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

        const linesPayload = validLines.map((line, index) => ({
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

          // سطرهای تازه‌ساز (هنوز ثبت‌نشده روی سرور) باید id صفر بگیرن تا بک‌اند به‌جای آپدیت، درج‌شون کنه
          id: line.isNew ? 0 : Number(line.id) || 0,
        }));

        const basePayload = {
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

        lines: linesPayload,

        subDomain: voucher.subDomain,
        reference: voucher.reference,
        type: voucher.type,
      };

      console.log("SAVE PAYLOAD:", basePayload);

      // ========================================
      // SEND TO API
      // ========================================

      try {
            let response;

            if (voucher.id) {

                const updatePayload = {
                    ...basePayload,
                    id: voucher.id,
                    lineIdsForDelete: voucher.deletedLineIds || [],
                };

                console.log("UPDATE VOUCHER:", updatePayload);

                response = await axios.post(
                    "http://ecipc107:8049/api/Voucher/Update",
                    updatePayload
                );

            } else {

                console.log("INSERT VOUCHER:", basePayload);

                response = await axios.post(
                    "http://ecipc107:8049/api/Voucher/Insert",
                    basePayload
                );
            }

        console.log("SAVE RESPONSE:", response.data);

      if (response.data?.isSuccess) {

        const result = response.data.data;

          if(result){

              // رفرش کامل سند از سرور: هم id واقعی سطرهای تازه‌ساز رو می‌گیریم
              // هم isNew و deletedLineIds به‌درستی ریست می‌شن، بدون نیاز به مدیریت دستی این حالت‌ها
              await loadVoucherById(result.id);

              if (!voucher.id) {
                  updateTab(tab.id, {
                    title: "ویرایش سند",
                    pageType: "voucher-detail",
                    data: {
                      id: result.id,
                    },
                  });
                }

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
            "❌ VOUCHER SAVE ERROR:",
            response.data?.message
          );

          showErrorSnackbar(
            response.data?.message ||
            "ثبت سند با خطا مواجه شد.",
            "error"
          );
        }

      } catch (error) {

        console.error("❌ SAVE API ERROR:", error);

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
    

    // ترکیب خطای بارگذاری سند با snackbar خطا، بدون نیاز به useEffect و setState اضافه
  const isErrorSnackbarOpen = snackbar.open || Boolean(loadError);
  const errorSnackbarMessage = snackbar.open ? snackbar.message : loadError;


return (
  
  
<div className={styles.voucherPage}>   


    {loading && (
      <div style={{ padding: "8px 4px", color: "#1976d2" }}>
        در حال دریافت اطلاعات سند...
      </div>
    )}

    <VoucherHeader voucher={voucher} setVoucher={setVoucher}/>

  <div>
    
    <VoucherLineGrid 
      voucher={voucher}
      setVoucher={setVoucher}
      onSave={handleSave}
    />

  </div>

    <Snackbar
      open={isErrorSnackbarOpen}
      autoHideDuration={4000}
      onClose={closeSnackbar}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Alert
        onClose={closeSnackbar}
        severity="error"
        variant="filled"
        sx={{ direction: "rtl" }}
      >
        {errorSnackbarMessage}
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

