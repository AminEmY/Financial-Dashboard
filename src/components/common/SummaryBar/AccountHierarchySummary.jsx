import { useEffect, useState } from "react";
import axios from "axios";
import { toPersianDigits } from "../../../utils/formatter";
import styles from "./AccountHierarchySummary.module.css";

// کش سراسری بر اساس ترکیب کدهای حساب/مراکز/کالا، تا هر ترکیب فقط یک‌بار از سرور خونده بشه
const reportCache = {};

const buildKey = (codes) =>
    codes.map((v) => (v ? String(v).trim() : "")).join("|");

// کامپوننت مستقل نمایش زنجیره‌ی حساب + مراکز + کالای ردیف فوکوس‌شده
// از API اختصاصی گزارش (ReportWindow) استفاده می‌کنه که خودش label مناسب
// (کل / معین / مرکز / کالا و ...) رو برمی‌گردونه، پس دیگه محاسبه دستی لازم نیست
const AccountHierarchySummary = ({
    accountCode,
    markaz1Code,
    markaz2Code,
    markaz3Code,
    markaz4Code,
    goodCode,
}) => {
    const codes = [accountCode, markaz1Code, markaz2Code, markaz3Code, markaz4Code, goodCode];
    const hasAny = codes.some((v) => v && String(v).trim() !== "");
    const key = buildKey(codes);

    const [prevKey, setPrevKey] = useState(key);
    const [items, setItems] = useState(() => (hasAny ? reportCache[key] ?? null : null));

    // 🟢 تنظیم state هنگام تغییر ردیف فوکوس‌شده، مستقیم توی بدنه‌ی رندر (نه useEffect)
    if (key !== prevKey) {
        setPrevKey(key);
        setItems(hasAny ? reportCache[key] ?? null : null);
    }

    const loading = hasAny && items === null;

    // 🟢 useEffect فقط مسئول خودِ فراخوانی async هست؛ setState فقط داخل then/catch
    useEffect(() => {
        if (!hasAny || reportCache[key]) {
            return;
        }

        let cancelled = false;

        axios
            .post("http://ecipc107:8049/api/Voucher/ReportWindow", {
                accountCode: accountCode || "",
                markaz1Code: markaz1Code || "",
                markaz2Code: markaz2Code || "",
                markaz3Code: markaz3Code || "",
                markaz4Code: markaz4Code || "",
                goodCode: goodCode || "",
            })
            .then((res) => {
                const result = res.data || [];
                reportCache[key] = result;
                if (!cancelled) setItems(result);
            })
            .catch((error) => {
                console.error("خطا در دریافت اطلاعات پنجره‌ی گزارش:", error);
                if (!cancelled) setItems([]);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return (
        <div dir="rtl" className={styles.AccountHierarchyBox}>
            {loading ? (
                <span className={styles.EmptyAccountText}>در حال دریافت...</span>
            ) : items && items.length > 0 ? (
                items.map((item, index) => (
                    <div className={styles.AccountHierarchyRow} key={`${item.code}-${index}`}>
                        <span className={styles.SummaryLabel}>{item.type}:</span>
                        <strong className={styles.AccountInfoText}>
                            {item.name}
                            <span className={styles.AccountInfoCode}>
                                ({toPersianDigits(item.code)})
                            </span>
                        </strong>
                    </div>
                ))
            ) : (
                <span className={styles.EmptyAccountText}>ردیفی انتخاب نشده</span>
            )}
        </div>
    );
};

export default AccountHierarchySummary;