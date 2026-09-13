export const formatNumber = (value) =>
  Number(value || 0).toLocaleString("fa-IR");// جهت تبدیل اعداد به فارسی

export const toPersianDigits = (value) => {
  if (value === null || value === undefined) return "";
  return value
    .toString()
    .replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
};// جهت نمایش تاریخ به فارسی