import { useState, useCallback } from "react";
import axios from "axios";

const emptyVoucher = {
    number: "",
    state: 0,
    subNumber: 0,
    date: "1405/03/31",
    sharh: "",
    tozihat: "",
    debtorAmount: 0,
    creditorAmount: 0,
    countOfLines: 0,
    inserterCode: 0,
    lines: [],
    subDomain: 0,
    reference: 0,
    type: 0,
};

// نگاشت هر ردیف سند از فرمت API (GetById) به فرمتی که گرید استفاده می‌کند
const mapLineFromApi = (line) => ({
    id: line.id,
    row: line.row,
    sequence: line.row,
    accountId: line.account?.id ?? null,
    accountCode: line.accountCode || "",
    accountName: line.account?.name || "",
    sharh: line.sharh || "",
    debtorAmount: line.debtorAmount || 0,
    creditorAmount: line.creditorAmount || 0,
    // آبجکت account برگشتی از GetById همان فیلدهای Able (markaz1Able و ...) را دارد
    // که VoucherColumns برای فعال/غیرفعال کردن ستون‌ها استفاده می‌کند
    accountFeatures: line.account || null,
    good: line.goodCode || "",
    markaz1: line.markaz1Code || "",
    markaz2: line.markaz2Code || "",
    markaz3: line.markaz3Code || "",
    markaz4: line.markaz4Code || "",
    dateCheq: line.dateCheq || "",
    numCheq: line.numCheq || "",
    tedad1: line.tedad1 || 0,
    tedad2: line.tedad2 || 0,
    tedad3: line.tedad3 || 0,
    currencyCode: line.currencyCode || 0,
    currencyFee: line.currencyFee || 0,
    currencyTedad: line.currencyTedad || 0,
});

// نگاشت کل سند از فرمت API به فرمت state داخلی
const mapVoucherFromApi = (data) => ({
    id: data.id,
    number: data.number,
    state: data.state ?? 0,
    subNumber: data.subNumber ?? 0,
    date: data.date || "",
    sharh: data.sharh || "",
    tozihat: data.tozihat || "",
    debtorAmount: data.debtorAmount || 0,
    creditorAmount: data.creditorAmount || 0,
    countOfLines: data.lines?.length || 0,
    inserterCode: data.inserterCode || 0,
    lines: (data.lines || []).map(mapLineFromApi),
    subDomain: data.subDomain ?? 0,
    reference: data.reference ?? 0,
    type: data.type ?? 0,
    atfNumber: data.atfNumber,
});

export default function useVoucher() {

    const [voucher, setVoucher] = useState(emptyVoucher);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // خواندن سند از سرور برای حالت ویرایش/مشاهده
    const loadVoucherById = useCallback(async (id) => {
        setLoading(true);
        setLoadError(null);

        try {
            const res = await axios.post(
                "http://ecipc107:8049/api/Voucher/GetById",
                { id }
            );

            setVoucher(mapVoucherFromApi(res.data));

        } catch (error) {
            console.error("❌ VOUCHER GETBYID ERROR:", error);

            setLoadError(
                error.response?.data?.message ||
                error.message ||
                "خطا در دریافت اطلاعات سند."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        voucher,
        setVoucher,
        loading,
        loadError,
        loadVoucherById,
    };
}