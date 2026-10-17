import { useState, useEffect } from "react";
import axios from "axios";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import useEntityPicker from "./useEntityPicker";
import EntityPickerModal from "./EntityPickerModal";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { fieldProps } from "../../../theme/Theme";

// فیلد ورودی کد حساب، با دقیقاً همون رفتار سلول کد حساب توی سند:
// تایپ حرف -> تب سرچ باز می‌شه، Enter روی خالی -> تب درخت با فوکوس ریشه،
// تایپ کد کامل یک والد -> مسیر درخت خودکار باز می‌شه، انتخاب برگ -> مقدار ست می‌شه
const AccountCodeField = ({ value, onChange, onSelect, onMismatch, allowAnyLevel = false, label = "کد حساب :", disabled, sx }) => {
    const [localValue, setLocalValue] = useState(value || "");
    const picker = useEntityPicker("Account");

    // اگر مقدار از بیرون عوض شد (مثلاً فرم ریست شد)، مقدار محلی هم هماهنگ بشه
    const [prevValue, setPrevValue] = useState(value);
    if (value !== prevValue) {
        setPrevValue(value);
        setLocalValue(value || "");
    }

    // در حالت allowAnyLevel، همزمان با توقف تایپ (بدون نیاز به Enter)، کد با سرور چک می‌شود
    // و اگر دقیقاً یک حساب موجود بود (چه والد چه برگ)، فرم زنده پر می‌شود؛ وگرنه onMismatch خبر می‌دهد
    useEffect(() => {
        if (!allowAnyLevel) return;

        const typed = localValue?.trim();
        if (!typed) {
            onMismatch?.();
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const res = await axios.post("http://ecipc107:8049/api/Account/SearchTreeView", { code: typed });
                const node = (res.data || []).find((item) => String(item.code).trim() === typed);
                if (cancelled) return;
                if (node) {
                    onSelect?.(node);
                } else {
                    onMismatch?.();
                }
            } catch (error) {
                console.error("خطا در بررسی زنده‌ی کد حساب:", error);
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localValue, allowAnyLevel]);

    const handleSelect = (node) => {
        setLocalValue(node.code);
        onChange?.(node.code);
        onSelect?.(node);
    };

    const commitTypedCode = async (typedValue) => {
        if (allowAnyLevel) {
            // اینجا محدودیت «فقط برگ» وجود ندارد؛ هر کد معتبر (والد یا برگ) پذیرفته می‌شود
            try {
                const res = await axios.post("http://ecipc107:8049/api/Account/SearchTreeView", { code: typedValue });
                const node = (res.data || []).find((item) => String(item.code).trim() === typedValue);
                if (node) handleSelect(node);
            } catch (error) {
                console.error("خطا در بررسی کد حساب:", error);
            }
            return;
        }

        const result = await picker.resolveTypedCode(typedValue, null);
        if (result.status === "leaf") {
            handleSelect(result.node);
        }
    };

    const onKeyDownHandler = (e) => {
        const ignoredKeys = [
            "Escape", "Tab", "Shift", "Control", "Alt", "Meta",
            "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
            "Backspace", "Delete", "CapsLock",
        ];

        if (e.key === "Enter") {
            const typedValue = localValue?.trim();

            if (!typedValue) {
                e.preventDefault();
                picker.open(null, "", true);
                return;
            }

            e.preventDefault();
            commitTypedCode(typedValue);
            return;
        }

        if (!ignoredKeys.includes(e.key)) {
            const isNumber = /^[0-9]$/.test(e.key);
            if (isNumber) return;

            e.preventDefault();
            picker.open(null, e.key);
        }
    };

    return (
        <>
            <TextField
                {...fieldProps(label, {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => picker.open(null, "", true)}
                                title="ساختار درختی"
                            >
                                <AccountTreeIcon fontSize="small" sx={{ color: "text.secondary" }} />
                            </IconButton>
                            <IconButton
                                size="small"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => picker.open(null, localValue, false)}
                                title="جستجو"
                            >
                                <SearchIcon fontSize="small" sx={{ color: "primary.main" }} />
                            </IconButton>
                        </InputAdornment>
                    ),
                })}
                disabled={disabled}
                sx={sx}
                value={localValue}
                onChange={(e) => {
                    setLocalValue(e.target.value);
                    onChange?.(e.target.value);
                }}
                onKeyDown={onKeyDownHandler}
                onBlur={() => {
                    const typedValue = localValue?.trim();
                    if (typedValue && typedValue !== value) {
                        commitTypedCode(typedValue);
                    }
                }}
            />

            <EntityPickerModal
                title="انتخاب حساب"
                picker={picker}
                onSelect={handleSelect}
                allowAnyLevel={allowAnyLevel}
            />
        </>
    );
};

export default AccountCodeField;