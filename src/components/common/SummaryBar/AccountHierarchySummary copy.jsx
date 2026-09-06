import { useEffect, useState } from "react";
import axios from "axios";
import { toPersianDigits } from "../../../utils/formatter";
import styles from "./AccountHierarchySummary.module.css";

// کش سراسری زنجیره‌ی حساب بر اساس کد، تا هر کد فقط یک‌بار از سرور خونده بشه
const hierarchyCache = {};

// کامپوننت مستقل نمایش زنجیره‌ی گروه حساب / حساب کل / معین‌ها
// فقط با گرفتن accountCode کار می‌کنه، به هیچ state بیرونی وابسته نیست
const AccountHierarchySummary = ({ accountCode }) => {
    const code = accountCode ? String(accountCode).trim() : "";

    const [prevCode, setPrevCode] = useState(code);
    const [hierarchy, setHierarchy] = useState(() =>
        code ? hierarchyCache[code] ?? null : null
    );

    // 🟢 الگوی رسمی ری‌اکت برای «تنظیم state هنگام تغییر یک prop» — بدون useEffect
    if (code !== prevCode) {
        setPrevCode(code);
        setHierarchy(code ? hierarchyCache[code] ?? null : null);
    }

    // 🟢 loading دیگه یک state جدا نیست؛ از روی خودِ hierarchy مشتق می‌شه
    // تا وقتی کد داریم ولی هنوز چیزی (نه از کش، نه از سرور) نیومده، یعنی در حال دریافته
    const loading = Boolean(code) && hierarchy === null;

    // 🟢 useEffect فقط مسئول خودِ فراخوانی async هست؛
    // هیچ setState همزمانی توی بدنه‌ی خودِ effect نیست، همه داخل then/catch هستن
    useEffect(() => {
        if (!code || hierarchyCache[code]) {
            return;
        }

        let cancelled = false;

        axios
            .post("http://ecipc107:8049/api/Account/SearchTreeView", { code })
            .then((res) => {
                const pool = res.data || [];

                // پیدا کردن خودِ حساب توی استخر نتیجه، و بعد بالا رفتن از روی parentCode
                // تا فقط زنجیره‌ی واقعیِ همین یک حساب ساخته بشه، نه هم‌رده‌های دیگه‌اش
                const accountNode = pool.find(
                    (acc) => String(acc.code).trim() === code
                );

                let chain = [];
                if (accountNode) {
                    let current = accountNode;
                    let depth = 0;
                    while (current && depth < 20) {
                        chain.unshift(current);
                        if (!current.parentCode) break;
                        const parentCodeStr = String(current.parentCode).trim();
                        current =
                            pool.find(
                                (acc) => String(acc.code).trim() === parentCodeStr
                            ) || null;
                        depth += 1;
                    }
                }

                hierarchyCache[code] = chain;
                if (!cancelled) setHierarchy(chain);
            })
            .catch((error) => {
                console.error("خطا در دریافت زنجیره‌ی حساب:", error);
                // آرایه‌ی خالی (نه null) ست می‌شه تا هم loading تموم بشه هم توی کش ذخیره نشه (بشه دوباره تلاش کرد)
                if (!cancelled) setHierarchy([]);
            });

        return () => {
            cancelled = true;
        };
    }, [code]);

    return (
        <div dir="rtl" className={styles.AccountHierarchyBox}>
            {loading ? (
                <span className={styles.EmptyAccountText}>در حال دریافت...</span>
            ) : hierarchy && hierarchy.length > 0 ? (
                hierarchy.map((account, index) => {
                    let label;
                    if (index === 0) {
                        label = "گروه حساب";
                    } else if (index === 1) {
                        label = "حساب کل";
                    } else {
                        label = `حساب معین${index - 1}`;
                    }

                    return (
                        <div className={styles.AccountHierarchyRow} key={account.id ?? account.code}>
                            <span className={styles.SummaryLabel}>{label}:</span>
                            <strong className={styles.AccountInfoText}>
                                {account.name}
                                <span className={styles.AccountInfoCode}>
                                    ({toPersianDigits(account.code)})
                                </span>
                            </strong>
                        </div>
                    );
                })
            ) : (
                <span className={styles.EmptyAccountText}>ردیفی انتخاب نشده</span>
            )}
        </div>
    );
};

export default AccountHierarchySummary;