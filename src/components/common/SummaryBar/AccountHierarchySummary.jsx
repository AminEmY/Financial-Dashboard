import { useEffect, useState } from "react";
import axios from "axios";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import RoomIcon from "@mui/icons-material/Room";
import { toPersianDigits } from "../../../utils/formatter";
import styles from "./AccountHierarchySummary.module.css";

// کش سراسری بر اساس ترکیب کدهای حساب/مراکز/کالا، تا هر ترکیب فقط یک‌بار از سرور خونده بشه
const reportCache = {};

const buildKey = (codes) =>
    codes.map((v) => (v ? String(v).trim() : "")).join("|");

const MARKAZ_COLORS = ["#8d6ba0", "#4a9098", "#c98a4b", "#b06a89"];
const MARKAZ_BG = ["#f5f0f8", "#eef5f6", "#faf3ea", "#f8eff3"];

// بر اساس برچسب type که خودِ API می‌ده، هر آیتم رو به یک گروه (حساب/کالا/مرکز N) نسبت می‌دیم
const getCategoryKey = (type) => {
    if (!type) return "other";
    if (type.startsWith("کل") || type.startsWith("معین")) return "account";
    if (type.startsWith("کالا")) return "good";
    return type; // "مرکز 1" ، "مرکز 2" و ... هرکدوم خودشون یک گروه جدا می‌شن
};

const getCategoryStyle = (key) => {
    if (key === "account") {
        return { label: "حساب", color: "#5b84ab", bg: "#eef3f8", Icon: AccountBalanceIcon };
    }
    if (key === "good") {
        return { label: "کالا", color: "#6a9c78", bg: "#eff6f1", Icon: Inventory2Icon };
    }
    const markazNum = parseInt(key.replace(/\D/g, ""), 10);
    const idx = Number.isFinite(markazNum) ? (markazNum - 1 + 4) % 4 : 0;
    return {
        label: toPersianDigits(key),
        color: MARKAZ_COLORS[idx],
        bg: MARKAZ_BG[idx],
        Icon: RoomIcon,
    };
};

// آیتم‌های پشت‌سرهم با یک نوع مشابه (کل->معین1->معین2 یا کالا سطح1->2->3) را در یک گروه جمع می‌کند
const groupItems = (items) => {
    const groups = [];
    let current = null;

    items.forEach((item) => {
        const key = getCategoryKey(item.type);
        if (!current || current.key !== key) {
            current = { key, items: [] };
            groups.push(current);
        }
        current.items.push(item);
    });

    return groups;
};

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

    if (key !== prevKey) {
        setPrevKey(key);
        setItems(hasAny ? reportCache[key] ?? null : null);
    }

    const loading = hasAny && items === null;

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

    const groups = items && items.length > 0 ? groupItems(items) : [];

    return (
        <div dir="rtl" className={styles.AccountHierarchyBox}>
            {loading ? (
                <span className={styles.EmptyAccountText}>در حال دریافت...</span>
            ) : groups.length > 0 ? (
                groups.map((group, gIndex) => {
                    const { label, color, bg, Icon } = getCategoryStyle(group.key);
                    return (
                        <div
                            key={`${group.key}-${gIndex}`}
                            className={styles.Card}
                            style={{ background: bg, borderTopColor: color }}
                        >
                            <div className={styles.CardHeader} style={{ color }}>
                                <Icon sx={{ fontSize: 15 }} />
                                <span>{label}</span>
                            </div>
                            <div className={styles.CardBody}>
                                {group.items.map((item, index) => (
                                    <span className={styles.BreadcrumbItem} key={`${item.code}-${index}`}>
                                        <span className={styles.ItemName}>{item.name}</span>
                                        <span className={styles.ItemCode}>({toPersianDigits(item.code)})</span>
                                        {index < group.items.length - 1 && (
                                            <span className={styles.Arrow}>‹</span>
                                        )}
                                    </span>
                                ))}
                            </div>
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