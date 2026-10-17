import { Checkbox, FormControlLabel, SvgIcon  } from "@mui/material";


// مربعِ حالت «اجباری»، با همون viewBox آیکون‌های پیش‌فرض MUI تا کادر بیرونی‌اش دقیقاً هم‌اندازه‌ی حالت تیک‌خورده باشد
const SquareFilledIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </SvgIcon>
);

// 0: خالی | 1: تیک عادی | 2: تیک‌خورده و قفل (غیرقابل ویرایش، فقط از سرور) | 3: اجباری (مربع پرشده)
// کاربر فقط بین 0 و 1 و 3 می‌تواند بچرخد؛ حالت 2 فقط از سرور می‌آید و قابل‌کلیک نیست
const CYCLE = [0, 1, 3];

const FourStateCheckbox = ({ value, onChange, label }) => {
    const isLocked = value === 2;

    const handleChange = () => {
        if (isLocked) return;
        const idx = CYCLE.indexOf(value);
        const next = CYCLE[(idx + 1) % CYCLE.length];
        onChange(next);
    };

    return (
        <FormControlLabel
            sx={{ width: 150, userSelect: "none" }}
            control={
                <Checkbox
                    checked={value === 1 || value === 2}
                    indeterminate={value === 3}
                    indeterminateIcon={<SquareFilledIcon />}
                    disabled={isLocked}
                    onChange={handleChange}
                />
            }
            label={label}
        />
    );
};

export default FourStateCheckbox;