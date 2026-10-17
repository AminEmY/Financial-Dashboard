import {
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
} from "@mui/x-data-grid-pro";
import { TextField, InputAdornment, IconButton, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import GridLayoutMenu from "./GridLayoutMenu";
import * as XLSX from "xlsx";
import RefreshIcon from "@mui/icons-material/Refresh"; // برای رفرش صفحه اضافه شد

// نوار ابزار مشترک همه‌ی صفحات لیستی: سرچ سریع، فیلتر، ستون‌ها، خروجی CSV، و اختیاری «مدل‌های نمایش»
const ListGridToolbar = ({ layoutProps, apiRef, exportFileName = "خروجی", onRefresh }) => {
  

     
    const handleExcelExport = () => {
    if (!apiRef?.current) return;

    // فقط ردیف‌های فعلاً فیلتر/مرتب‌شده، و فقط ستون‌های نمایان (نه پنهان‌ها)
    const rows = apiRef.current.getSortedRows();
    const visibleColumns = apiRef.current
      .getVisibleColumns()
      .filter((col) => col.field !== "__check__" && col.field !== "actions");

    const data = rows.map((row) => {
      const record = {};
      visibleColumns.forEach((col) => {
        const rawValue = row[col.field];
        record[col.headerName] = col.valueFormatter
          ? col.valueFormatter(rawValue, row)
          : rawValue;
      });
      return record;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
  };

  return (
    <Toolbar sx={{ direction: "ltr", width: "100%" }}>
      

      

      <Tooltip title="فیلتر">
        <FilterPanelTrigger render={<ToolbarButton />}>
          <FilterListIcon fontSize="small" />
        </FilterPanelTrigger>
      </Tooltip>

      <Tooltip title="ستون‌ها">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>


      <Tooltip title="خروجی اکسل">
        <ToolbarButton onClick={handleExcelExport}>
          <FileDownloadIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>

      {layoutProps && <GridLayoutMenu {...layoutProps} />}
      
      <QuickFilter>
        <QuickFilterControl
          render={(params) => (
            <TextField 
            
            sx={{ "& .MuiOutlinedInput-input": {
                      textAlign: "right",
                      padding: "1.5px 5px", }, }}
            {...params}
            size="small"
            placeholder=" ... جستجو"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <QuickFilterClear>
                      <IconButton size="small">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </QuickFilterClear>
                  </InputAdornment>
                ),
              }}
              />
            )}
            />
      </QuickFilter>
      
          {onRefresh && (
      <Tooltip title="تازه سازی / همگام‌سازی">
        <ToolbarButton onClick={onRefresh}>
          <RefreshIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
          )}
      
    </Toolbar>
  );
};

export default ListGridToolbar;