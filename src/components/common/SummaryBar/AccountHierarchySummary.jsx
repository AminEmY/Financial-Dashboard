import { useEffect, useState } from "react";
import axios from "axios";
import { toPersianDigits } from "../../../utils/formatter";
import styles from "./AccountHierarchySummary.module.css";

// کش سراسری زنجیره‌ی حساب بر اساس کد، تا هر کد فقط یک‌بار از سرور خونده بشه
const hierarchyCache = {};

// کامپوننت مستقل نمایش زنجیره‌ی گروه حساب / حساب کل / معین‌ها
// فقط با گرفتن accountCode کار می‌کنه، به هیچ state بیرونی وابسته نیست
const AccountHierarchySummary = ({ accountCode }) => {
    const [hierarchy, setHierarchy] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const code = accountCode ? String(accountCode).trim() : "";

        if (!code) {
            setHierarchy(null);
            return;
        }

        if (hierarchyCache[code]) {
            setHierarchy(hierarchyCache[code]);
            return;
        }

        let cancelled = false;
        setLoading(true);

        axios
            .post("http://ecipc107:8049/api/Account/SearchTreeView", { code })
            .then((res) => {
                const chain = res.data || [];
                hierarchyCache[code] = chain;
                if (!cancelled) setHierarchy(chain);
            })
            .catch((error) => {
                console.error("خطا در دریافت زنجیره‌ی حساب:", error);
                if (!cancelled) setHierarchy(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accountCode]);

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