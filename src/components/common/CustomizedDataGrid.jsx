import React, { useEffect, useMemo } from "react";
import { DataGridPro, useGridApiRef } from "@mui/x-data-grid-pro";
import { flushSync } from "react-dom";
import { faIR } from "@mui/x-data-grid-pro/locales";

const CustomDataGrid = ({
  sx,
  columnHeaderHeight,
  slots,
  slotProps,
  localeText,
  apiRef: externalApiRef,
  visualRtl = false,
  ...props
}) => {
  const internalApiRef = useGridApiRef();
  const apiRef = externalApiRef || internalApiRef;

    // لیست‌ها: موتور گرید LTR می‌ماند و ظاهر RTL با برعکس‌کردن ترتیب ستون‌ها ساخته می‌شود
  const gridColumns = useMemo(
    () => (visualRtl && props.columns ? [...props.columns].reverse() : props.columns),
    [visualRtl, props.columns]
  );

  // شروع از لبه‌ی راست (اولین ستون منطقی)
  useEffect(() => {
    if (!visualRtl) return;
    const t = setTimeout(() => apiRef.current?.scroll({ left: 10000000 }), 300);
    return () => clearTimeout(t);
  }, [visualRtl, apiRef]);

  // اصلاح جهت دراگ رزایز ستون‌ها در RTL بدون دستکاری DOM یا اسلات‌ها
  useEffect(() => {
    const rootEl = apiRef.current?.rootElementRef?.current;
    if (!rootEl) return;

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;
    let lastWidth = 0;
    let currentField = null;

    const handlePointerDown = (e) => {
      const separator = e.target.closest(".MuiDataGrid-columnSeparator");
      if (!separator) return;

      const header = separator.closest(".MuiDataGrid-columnHeader");
      if (!header) return;

      currentField = header.getAttribute("data-field");
      if (!currentField) return;

      const col = apiRef.current.getColumn(currentField);
      if (!col) return;

      // متوقف کردن الگوریتم LTR نیتیو MUI قبل از اجرا
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      isDragging = true;
      startX = e.clientX;
      startWidth = col.computedWidth;
      lastWidth = startWidth;

      const handlePointerMove = (moveEvent) => {
        if (!isDragging || !currentField) return;

        moveEvent.preventDefault();
        moveEvent.stopPropagation();
        moveEvent.stopImmediatePropagation();

        const deltaX = moveEvent.clientX - startX;
        // فرمول درست RTL: کشیدن به راست (deltaX > 0) عرض ستون را کم می‌کند
        const minW = col.minWidth || 50;
       //  تغییر علامت پلاس (+) به مینوس (-) برای معکوس شدن جهت ریسایز با موس
        const newWidth = Math.max(minW, startWidth - deltaX);
        const applied = newWidth - lastWidth;
        lastWidth = newWidth;

        // رندر هم‌زمان: عرض جدید همین‌جا روی DOM اعمال می‌شود، نه فریم بعد
        flushSync(() => {
          apiRef.current.setColumnWidth(currentField, newWidth);
        });

        // موتور LTR است؛ اسکرول را در همان فریم به اندازه‌ی تغییر عرض جلو می‌بریم
        if (visualRtl && applied !== 0) {
          const target = apiRef.current.getScrollPosition().left + applied;
          apiRef.current.scroll({ left: target });

          // اگر گرید هنوز عرض کل را به‌روز نکرده بود و اسکرول کلمپ شد، یک‌بار دیگر اعمالش کن
          requestAnimationFrame(() => {
            if (Math.abs(apiRef.current.getScrollPosition().left - target) > 1) {
              apiRef.current.scroll({ left: target });
            }
          });
        }

      };

      const handlePointerUp = (upEvent) => {
        if (isDragging) {
          upEvent.preventDefault();
          upEvent.stopPropagation();
          upEvent.stopImmediatePropagation();
          isDragging = false;
          currentField = null;
        }
        window.removeEventListener("pointermove", handlePointerMove, true);
        window.removeEventListener("pointerup", handlePointerUp, true);
      };

      window.addEventListener("pointermove", handlePointerMove, true);
      window.addEventListener("pointerup", handlePointerUp, true);
    };

    rootEl.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      rootEl.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [apiRef, visualRtl]);

  

//  داخل کامپوننت CustomDataGrid:

  useEffect(() => {
    if (!apiRef.current) return;

    const handleVisibilityChange = () => {
      requestAnimationFrame(() => {
        if (!apiRef.current) return;

        const gridWidth = apiRef.current.rootElementRef?.current?.clientWidth || 0;
        const visibleCols = apiRef.current.getVisibleColumns();
        if (gridWidth === 0 || visibleCols.length === 0) return;

        // ۱. انتخاب ستون اصلی برای جذب فضای خالی
        let mainCol = visibleCols.find((c) => c.field === "sharh");
        if (!mainCol) {
          mainCol = visibleCols.filter((c) => c.field !== "__check__" && c.field !== "actions").pop();
        }

        if (!mainCol) return;

        // ۲. محاسبه مجموع حداقل عرض (minWidth) بقیه ستون‌ها
        let otherWidths = 0;
        visibleCols.forEach((col) => {
          if (col.field !== mainCol.field) {
            // استفاده از minWidth یا عرض پایه ستون
            otherWidths += col.minWidth || col.width || 100;
          }
        });

        const mainMinWidth = mainCol.minWidth || 150;
        const totalRequiredWidth = otherWidths + mainMinWidth;

        // 🎯 شرط کلیدی: اگر مجموع عرض ستون‌ها از عرض جدول بیشتر باشد (حالت اسکرول‌دار شدن)،
        // اندازه ستون اصلی را همان minWidth می‌گذاریم تا به بقیه ستون‌ها فشار نیاورد و خرد نشود.
        if (totalRequiredWidth >= gridWidth - 20) {
          apiRef.current.setColumnWidth(mainCol.field, mainMinWidth);
        } else {
          // در غیر این صورت (حالت ستون‌های کم)، فضای خالی باقی‌مانده را پر می‌کنیم
          const remainingWidth = gridWidth - otherWidths - 12;
          apiRef.current.setColumnWidth(mainCol.field, remainingWidth);
        }
      });
    };

    return apiRef.current.subscribeEvent("columnVisibilityModelChange", handleVisibilityChange);
  }, [apiRef]);

  return (
    <DataGridPro
      apiRef={apiRef}
      scrollbarSize={0}
      rowHeight={36}
      columnHeaderHeight={columnHeaderHeight ?? 38}
      showToolbar
      autosizeOnMount
      localeText={{
        ...faIR.components.MuiDataGrid.defaultProps.localeText,
        ...localeText,
      }}
      slots={slots}
      slotProps={slotProps}
      sx={{
        width: "100%",
        direction: visualRtl ? "ltr" : "rtl",

        // "& .MuiDataGrid-main": {
        //   width: "100%",
        // },
        // "& .MuiDataGrid-columnHeadersInner, & .MuiDataGrid-virtualScrollerRenderZone": {
        //   width: "100% !important",
        // },

        // تنظیم موقعیت دستگیره رزایز روی مرز سمت چپ ستون‌ها در RTL
        "& .MuiDataGrid-columnSeparator": {
          cursor: "col-resize !important",
          pointerEvents: "auto !important",
          ...(visualRtl && { left: "auto !important", right: "-8px !important" }),
        },

        "& .MuiDataGrid-columnHeader": {
          position: "relative",
        },
        // 🟢 تنظیم دقیق موقعیت دستگیره رزایز در حالت visualRtl
        ...(visualRtl && {
          "& .MuiDataGrid-columnSeparator": {
            right: "unset !important",
          },
          "& .MuiDataGrid-columnHeader": {
            // جابجایی تراز داخلی هدر برای هماهنگی با دستگیره چپ
            position: "relative",
          },
        }),

        

        ...(sx || {}),
      }}
      {...props}
      columns={gridColumns}
    />
  );
};

export default CustomDataGrid;