import{ React,useState,useEffect,useMemo,useCallback } from 'react';
import axios from "axios";
import styles from "./VouchersList.module.css"
import CustomDataGrid  from '../../../components/common/CustomizedDataGrid';
import useTabs from "../../../context/useTabs";//سیستم تب بجای نویگیت
import {formatNumber,toPersianDigits,toEnglishDigits} from "../../../utils/formatter";//جهت تبدیل اعداد و تاریخ به فارسی
import FilterableHeader from "../../../components/common/list/FilterableHeader";
import { useGridApiRef } from "@mui/x-data-grid-pro";
import ListGridToolbar from "../../../components/common/list/ListGridToolbar";
import useGridLayouts from "../../../components/common/list/useGridLayouts"

// import { TextField, InputAdornment } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";

//  شروع: تعریف همه‌ی ۱۹ ستون API — برای افزودن/حذف ستون فقط همین آرایه را عوض میکنیم
const STATE_LABELS = { 0: "پیش‌نویس", 1: "موقت", 2: "دائم" };

const COLUMN_CONFIG = [
  { field: "number",         headerName: "شماره سند",       flex: 1, minWidth: 100 , valueFormatter: toPersianDigits },
  { field: "date_Shamsi",    headerName: "تاریخ",            flex: 1, minWidth: 107,  valueFormatter: toPersianDigits },
  { field: "sharh",          headerName: "شرح",             flex: 3, minWidth: 200 },
  { field: "countOfLines",   headerName: "تعداد ردیف",     flex: 1, minWidth: 90 , valueFormatter: formatNumber },
  { field: "amount",         headerName: "مبلغ",            flex: 1, minWidth: 155, valueFormatter: formatNumber },
  { field: "subNumber",      headerName: "شماره فرعی",      flex: 1, minWidth: 110, valueFormatter: toPersianDigits },
  { field: "atfNumber",      headerName: "شماره عطف",      flex: 1, minWidth: 110, valueFormatter: toPersianDigits },
  { field: "dayIndex",       headerName: "اندیس روز",      flex: 1, minWidth: 100, valueFormatter: toPersianDigits },
  { field: "state",          headerName: "وضعیت",          flex: 1, minWidth: 100, valueFormatter: (v) => STATE_LABELS[v] ?? toPersianDigits(v) },
  { field: "stateCode",      headerName: "کد وضعیت",       flex: 1, minWidth: 100, valueFormatter: toPersianDigits },
  { field: "type",           headerName: "نوع",             flex: 1, minWidth: 90,  valueFormatter: toPersianDigits },
  { field: "subDomain",      headerName: "زیرسامانه",       flex: 1, minWidth: 100, valueFormatter: toPersianDigits },
  { field: "reference",      headerName: "مرجع",            flex: 1, minWidth: 90,  valueFormatter: toPersianDigits },
  { field: "numberOfAttach", headerName: "تعداد پیوست",    flex: 1, minWidth: 90, valueFormatter: toPersianDigits },
  { field: "inserterCode",   headerName: "کد ثبت‌کننده",    flex: 1, minWidth: 110, valueFormatter: toPersianDigits },
  { field: "inserterName",   headerName: "ثبت‌کننده",       flex: 1, minWidth: 130 },
  { field: "insertDate",     headerName: "تاریخ ثبت",       flex: 1, minWidth: 110, valueFormatter: toPersianDigits },
  { field: "date_Miladi",    headerName: "تاریخ میلادی",      flex: 1, minWidth: 120, valueFormatter: (v) => (v ? String(v).slice(0, 10) : "") },
  { field: "id",             headerName: "شناسه",           flex: 1, minWidth: 90,  valueFormatter: toPersianDigits },
];

// ستون‌هایی که به‌صورت پیش‌فرض دیده می‌شوند؛ بقیه پنهان‌اند (از پنل ستون‌ها قابل‌نمایش)
const DEFAULT_VISIBLE_FIELDS = ["number", "date_Shamsi", "sharh", "countOfLines", "amount"];

const DEFAULT_STATE = {
  columns: {
    orderedFields: COLUMN_CONFIG.map((c) => c.field),
    columnVisibilityModel: Object.fromEntries(
      COLUMN_CONFIG.filter((c) => !DEFAULT_VISIBLE_FIELDS.includes(c.field)).map((c) => [c.field, false])
    ),
  },
  sorting: { sortModel: [] },
};






const VouchersList = () => {


  
  const [vouchers, setVouchers] = useState([]);
  
  const [columnFilters, setColumnFilters] = useState({});

  const handleColumnFilterChange = useCallback((field, value) => {
    setColumnFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const { openTab } = useTabs();

  const apiRef = useGridApiRef(); // 

  const { initialState, layouts, defaultLayoutName, persistCurrent, saveLayout, applyLayout, deleteLayout, resetToDefault, setDefaultLayout } =
    useGridLayouts("vouchersList", apiRef, DEFAULT_STATE); 

const fetchVouchers = useCallback(() => {
  axios
    .post("http://ecipc107:8049/api/Voucher/Search")
    .then((res) => {
      setVouchers(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
}, []);

useEffect(() => {
  fetchVouchers();
}, [fetchVouchers]);





  const filteredRows = vouchers.filter((r) => // 🆕 به‌جای rows، مستقیم vouchers
    Object.entries(columnFilters).every(
      ([field, val]) => !val || String(r[field] ?? "").includes(toEnglishDigits(val)) // 🆕 ارقام فارسی تایپ‌شده هم جواب بدهند
    )
  );


  //  ساخت ستون‌ها از روی COLUMN_CONFIG؛ renderCell دستی شماره سند حذف شد چون پدینگ سراسری تم این کار را می‌کند
  const columns = useMemo(() => COLUMN_CONFIG.map((col) => ({
    headerAlign: "right",
    align: "right",
    ...col,
    renderHeader: () => (
      <FilterableHeader
        headerName={col.headerName}
        field={col.field}
        value={columnFilters[col.field]}
        onChange={handleColumnFilterChange}
      />
    ),
  })), [columnFilters, handleColumnFilterChange]);


  const layoutProps = {
    layouts,
    defaultLayoutName,
    onApply: applyLayout,
    onSave: saveLayout,
    onDelete: deleteLayout,
    onReset: resetToDefault,
    setDefaultLayout,
  };


  const totalAmount = vouchers.reduce((sum, r) => sum + (r.amount || 0), 0); //  rows → vouchers

  const footerSlots = useMemo(() => ({ 
    footer: () => (
      <strong className={styles.Total}>
        جمع کل: {formatNumber(totalAmount)}
      </strong>
    ),
  }), [totalAmount]); // 


   return (

    <div className={styles.VList}>

        {/* <div className={styles.Toolbar}>

             <TextField
                size="small"
                placeholder="جستجو ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
             />

        </div> */}


        <div className={styles.GridHeight}  >
          <CustomDataGrid
              rows={filteredRows}
              columnHeaderHeight={64}
              columns={columns}
              slots={{ toolbar: () => <ListGridToolbar layoutProps={layoutProps} apiRef={apiRef} exportFileName="لیست-اسناد" onRefresh={fetchVouchers} /> ,
                      footer: footerSlots.footer, }}
            //پراپ های مربوط به ستون سند
              apiRef={apiRef} 
              state={initialState} 
              onColumnVisibilityModelChange={persistCurrent} 
              onColumnOrderChange={persistCurrent} 
              onColumnWidthChange={persistCurrent}  
              onSortModelChange={persistCurrent} 
            // برای اینکه توی لیست بعد کلیک دور سلول کادر نکشه کل ردیف سلکت شه
              sx={{
                    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                          outline: "none !important",
                        },
                      }}
                                    
                
            
              onRowDoubleClick={(params) => { openTab({
                                                  title: `سند ${params.row.number}`,
                                                  path: `/Vouchers/${params.row.id}`,
                                                  pageType: "voucher-detail",
                                                  data: {
                                                  id: params.row.id,
                                                  },
                                                });
                                              }}

              
           />

        </div>
                
    </div>);
  };
  
export default VouchersList;


//----------------------------------------------------------------------------قبل استفاده از سند واقعی و ای پی آی
  // const vouchers = [
  // {
  //   id: 1001,
  //   number: "1001",
  //   date: "1405/03/20",
  //   amount: 1500000,
  //   description: "سند دریافت از مشتری"
  // },
  // {
  //   id: 1002,
  //   number: "1002",
  //   date: "1405/03/21",
  //   amount: 800000,
  //   description: "سند پرداخت حقوق"
  // },
  // {
  //   id: 1003,
  //   number: "1003",
  //   date: "1405/03/22",
  //   amount: 2500000,
  //   description: "سند خرید تجهیزات"
  // },
  //                 ];
// ----------------------------------------------------------------------------- قبل از استفاده از گرید
    //   <div className={styles.VList}>
  //     <h2>Issued Vouchers</h2>

  //     {vouchers.map((voucher) => (
  //       <div key={voucher.id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
  //         <p><strong>Number:</strong> {voucher.number}</p>
  //         <p><strong>Date:</strong> {voucher.date}</p>
  //         <p><strong>Amount:</strong> {voucher.amount}</p>
  //       </div>
  //     ))}
  //   </div>
  //  --------------------------------------------------------------------------------- قبل تر
  
  //   const [vouchers, setVouchers] = useState([]);

  // useEffect(() => {
  //   axios.get(
  //     "https://reqres.in/api/collections/vouchers/records",
  //     {
  //       headers: {
  //         "x-api-key" : "pub_fd0b8ef344526ddd99ad91b7fe14f70b"
  //       }
  //     }
  //   )
  //   .then((res) => {
       

  //   console.log(res);
  //   setVouchers(res.data.data); // معمولا دیتا اینجاست
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
  // }, []);


  // return (
  
        {/* {vouchers.map((vch)=>(<div key={vch.id}
      onClick={() => navigate(`/Voucher/${vch.id}`)}
      style={{
        display: "flex",
        direction: "rtl",
        gap: "60px",
        padding: "12px",
        borderBottom: "1px solid #ddd",
        cursor: "pointer",
        }}
        >
        <span>{vch.number}</span>
        <span>{vch.date}</span>
        <span>{vch.description}</span>
        <span>{vch.amount.toLocaleString()}</span>
        </div>
        
        ))} */}


              //  )



 
