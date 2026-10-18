import { useState, useRef, useCallback, useEffect } from "react";

const KEY_PREFIX = "gridLayouts:";
const DEFAULT_KEY_PREFIX = "defaultLayout:"; // اضافه شد برای ذخیره اسم مدل پیش‌فرض

const readStore = (gridKey) => {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + gridKey);
    const parsed = raw ? JSON.parse(raw) : {};
    return { current: parsed.current ?? null, layouts: parsed.layouts ?? [] };
  } catch {
    return { current: null, layouts: [] };
  }
};

// محاسبه‌ی دستی عرض ستونِ اصلی (sharh یا آخرین ستون نمایان) تا فضای خالی باقی‌نماند؛
// چون exportState/restoreState عرض‌های دستی قدیمی (columnDimensions) را هم ذخیره می‌کنند
// و با تغییر تعداد ستون‌های نمایان، این عرض‌ها دیگر با عرض واقعی گرید جمع نمی‌شوند.
const recalculateMainColumnWidth = (apiRef) => {
  requestAnimationFrame(() => {
    if (!apiRef.current) return;

    const gridWidth = apiRef.current.rootElementRef?.current?.clientWidth || 0;
    const visibleCols = apiRef.current.getVisibleColumns();
    if (gridWidth === 0 || visibleCols.length === 0) return;

    const mainCol =
      visibleCols.find((c) => c.field === "sharh") || visibleCols[visibleCols.length - 1];

    let otherWidths = 0;
    visibleCols.forEach((col) => {
      if (col.field !== mainCol?.field) {
        otherWidths += col.computedWidth || col.width || 100;
      }
    });

    if (mainCol) {
      const remainingWidth = Math.max(mainCol.minWidth || 150, gridWidth - otherWidths - 10);
      apiRef.current.setColumnWidth(mainCol.field, remainingWidth);
    }
  });
};

// gridKey: یک اسم یکتا برای هر لیست (مثلاً "vouchersList")
// defaultState: وضعیت پیش‌فرض گرید (ستون‌های نمایان و ...)
export default function useGridLayouts(gridKey, apiRef, defaultState) {
  const [layouts, setLayouts] = useState(() => readStore(gridKey).layouts);

  // ➕ اضافه شد: خواندن نام مدل پیش‌فرضِ ذخیره‌شده از localStorage
  const [defaultLayoutName, setDefaultLayoutName] = useState(() => {
    try {
      return localStorage.getItem(DEFAULT_KEY_PREFIX + gridKey) || "";
    } catch {
      return "";
    }
  });

//  ویرایش شد: تعیین وضعیت اولیه (initialState) بر اساس مدل پیش‌فرضِ کاربر یا ذخیره شده‌ی قبلی
  const [initialState] = useState(() => {
    try {
      const savedDefaultName = localStorage.getItem(DEFAULT_KEY_PREFIX + gridKey);
      if (savedDefaultName) {
        const store = readStore(gridKey);
        const foundLayout = store.layouts.find((l) => l.name === savedDefaultName);
        if (foundLayout) {
          const cleanState = JSON.parse(JSON.stringify(foundLayout.state));
          if (cleanState?.columns) cleanState.columns.columnDimensions = {};
          return cleanState;
        }
      }
      return readStore(gridKey).current ?? defaultState;
    } catch {
      return readStore(gridKey).current ?? defaultState;
    }
  });

  // 🟢 اضافه شدن این useEffect برای اعمال قطعیِ پیش‌فرض به محض لود گرید
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!apiRef.current) return;
      try {
        const savedDefaultName = localStorage.getItem(DEFAULT_KEY_PREFIX + gridKey);
        if (savedDefaultName) {
          const layout = readStore(gridKey).layouts.find((l) => l.name === savedDefaultName);
          if (layout) {
            const cleanState = JSON.parse(JSON.stringify(layout.state));
            if (cleanState?.columns) cleanState.columns.columnDimensions = {};
            apiRef.current.restoreState(cleanState);
            recalculateMainColumnWidth(apiRef);
            return;
          }
        }
        // اگر پیش‌فرضی نبود ولی current ذخیره شده بود
        const store = readStore(gridKey);
        if (store.current) {
          const cleanState = JSON.parse(JSON.stringify(store.current));
          if (cleanState?.columns) cleanState.columns.columnDimensions = {};
          apiRef.current.restoreState(cleanState);
          recalculateMainColumnWidth(apiRef);
        }
      } catch (error) {
        console.error("خطا در اعمال وضعیت اولیه گرید:", error);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [apiRef, gridKey]);


  const saveTimer = useRef(null);

  const write = useCallback((patch) => {
    const next = { ...readStore(gridKey), ...patch };
    try {
      localStorage.setItem(KEY_PREFIX + gridKey, JSON.stringify(next));
    } catch {
      // حافظه پر است یا مرورگر در حالت خصوصی است
    }
    return next;
  }, [gridKey]);

  // ذخیره‌ی خودکار وضعیت فعلی، با تاخیر کوتاه تا با هر تغییر ریز چندبار ننویسد
  const persistCurrent = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (apiRef.current) write({ current: apiRef.current.exportState() });
    }, 300);
  }, [apiRef, write]);

  const saveLayout = useCallback((name) => {
    const clean = name.trim();
    if (!clean || !apiRef.current) return;
    const others = readStore(gridKey).layouts.filter((l) => l.name !== clean);
    const next = write({
      layouts: [...others, { name: clean, state: apiRef.current.exportState() }],
    });
    setLayouts(next.layouts);
  }, [apiRef, gridKey, write]);

const applyLayout = useCallback((name) => {
    const layout = readStore(gridKey).layouts.find((l) => l.name === name);
    if (layout && apiRef.current) {
      const cleanState = JSON.parse(JSON.stringify(layout.state));

      // ➕ پاک کردن تمام عرض‌های ثابت ذخیره‌شده تا ستون‌ها به حالت flex برگردند
      if (cleanState?.columns) {
        cleanState.columns.columnDimensions = {};
      }

      apiRef.current.restoreState(cleanState);
      write({ current: cleanState });

      // ➕ محاسبه هوشمند عرض ستون‌ها برای پر کردن ۱۰۰٪ فضای خالی گرید
      recalculateMainColumnWidth(apiRef);
    }
  }, [apiRef, gridKey, write]);

  const deleteLayout = useCallback((name) => {
    const next = write({
      layouts: readStore(gridKey).layouts.filter((l) => l.name !== name),
    });
    setLayouts(next.layouts);
    // اگر مدلی که حذف شد پیش‌فرض بود، پیش‌فرض را هم پاک کن
    if (defaultLayoutName === name) {
      setDefaultLayoutName("");
      localStorage.removeItem(DEFAULT_KEY_PREFIX + gridKey);
    }
    
  }, [gridKey, write, defaultLayoutName]);


const resetToDefault = useCallback(() => {
    if (apiRef.current) {

      // اگر کاربر مدل پیش‌فرضی انتخاب کرده بود، جدول را ببر روی همون، وگرنه defaultState
      const savedDefaultName = localStorage.getItem(DEFAULT_KEY_PREFIX + gridKey);
      if (savedDefaultName) {
        const layout = readStore(gridKey).layouts.find((l) => l.name === savedDefaultName);
        if (layout) {
          const cleanState = JSON.parse(JSON.stringify(layout.state));
          if (cleanState?.columns) cleanState.columns.columnDimensions = {};
          apiRef.current.restoreState(cleanState);
          write({ current: cleanState });
          recalculateMainColumnWidth(apiRef);
          return;
        }
      }

      const cleanDefaultState = JSON.parse(JSON.stringify(defaultState));

      // ➕ پاک کردن عرض‌های ثبت‌شده قبلی
      if (cleanDefaultState?.columns) {
        cleanDefaultState.columns.columnDimensions = {};
      }

      apiRef.current.restoreState(cleanDefaultState);
      write({ current: null });

      // ➕ محاسبه مجدد عرض جدول در حالت پیش‌فرض
      recalculateMainColumnWidth(apiRef);
    }
  }, [apiRef, defaultState, write, gridKey]);


  // ➕ تابع جدید: تنظیم یک مدل به عنوان پیش‌فرض دائمی
  const setDefaultLayout = useCallback((name) => {
    setDefaultLayoutName(name);
    try {
      localStorage.setItem(DEFAULT_KEY_PREFIX + gridKey, name);
    } catch (error) {
      // برای جلوگیری از خطای خالی بودن catch
      console.error("خطا در ذخیره پیش‌فرض:", error);
    }
  }, [gridKey]);

  return { initialState, layouts, defaultLayoutName, persistCurrent, saveLayout, applyLayout, deleteLayout, resetToDefault, setDefaultLayout };
}