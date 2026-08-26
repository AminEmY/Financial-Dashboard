// voucherNewValidations.jsx

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


// ======================================================
// بررسی Featureهای حساب
// ======================================================

function validateAccountFeatures(voucher) {
  const errors = [];

  // پیش‌نویس Feature Validation ندارد
  if (Number(voucher.state) === 0) {
    return errors;
  }

  for (const line of voucher.lines || []) {

    // ردیف بدون حساب بررسی نمی‌شود
    if (!line.accountCode) continue;

    const features = line.accountFeatures;

    if (!features) continue;

    for (const [ableField, valueField, title] of requiredFeatures) {

      if (
        features[ableField] === true &&
        (
          line[valueField] === undefined ||
          line[valueField] === null ||
          String(line[valueField]).trim() === ""
        )
      ) {
        errors.push({
          type: "accountFeature",
          row: line.row,
          lineId: line.id,
          accountCode: line.accountCode,
          field: valueField,
          title,
          message: `ردیف ${line.row}: مقدار ${title} برای حساب ${line.accountCode} الزامی است.`,
        });
      }
    }
  }

  return errors;
}


// ======================================================
// بررسی داشتن حداقل یک آرتیکل
// ======================================================

function validateHasLines(voucher) {

  // پیش‌نویس می‌تواند ناقص باشد
  if (Number(voucher.state) === 0) {
    return [];
  }

  const validLines = (voucher.lines || []).filter(
    (line) => line.accountCode
  );

  if (validLines.length === 0) {
    return [
      {
        type: "lines",
        message: "حداقل یک آرتیکل برای ثبت سند الزامی است.",
      },
    ];
  }

  return [];
}

// ======================================================
// Validation اصلی سند
// ======================================================

export function validateVoucher(voucher) {

  const errors = [];

  // 1. حداقل یک آرتیکل
  errors.push(...validateHasLines(voucher));

  // 2. Featureهای حساب
  errors.push(...validateAccountFeatures(voucher));

  return errors;
}



// ======================================================
// بررسی تراز بودن سند
// ======================================================
export const validateVoucherBalance = (voucher) => {

    // پیش نویس می‌تواند بالانس نباشد
    if (Number(voucher.state) === 0) {
        return {
            isValid: true
        };
    }

    
    const lines = voucher.lines.filter(
        (line) => line.accountCode
    );

    const totalDebtor = lines.reduce(
        (sum, line) => sum + Number(line.debtorAmount || 0),
        0
    );

    const totalCreditor = lines.reduce(
        (sum, line) => sum + Number(line.creditorAmount || 0),
        0
    );


    if (totalDebtor !== totalCreditor) {

        return {
            isValid: false,
            message: `سند تراز نیست. بدهکار: ${totalDebtor.toLocaleString()} - بستانکار: ${totalCreditor.toLocaleString()}`
        };
    }


    return {
        isValid: true
    };
};