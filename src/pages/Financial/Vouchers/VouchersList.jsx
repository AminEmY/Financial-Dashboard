import React, { useState } from 'react';
// import { useEffect, useState } from "react";
// import axios from "axios";
import styles from "./vouchersList.module.css"
import { useNavigate } from 'react-router-dom';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {formatNumber,toPersianDigits} from "../../../utils/formatter";//جهت تبدیل اعداد و تاریخ به فارسی




const VouchersList = () => {

  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const vouchers = [
  {
    id: 1001,
    number: "1001",
    date: "1405/03/20",
    amount: 1500000,
    description: "سند دریافت از مشتری"
  },
  {
    id: 1002,
    number: "1002",
    date: "1405/03/21",
    amount: 800000,
    description: "سند پرداخت حقوق"
  },
  {
    id: 1003,
    number: "1003",
    date: "1405/03/22",
    amount: 2500000,
    description: "سند خرید تجهیزات"
  },
                  ];


const rows = vouchers.map((v) => ({
    id: v.id,
    number: v.number,
    date: v.date,
    description: v.description,
    amount: v.amount,
    isBalanced: v.amount > 0 // فعلاً فرضی
  }));

  const filteredRows = rows.filter((r) =>
  r.number.includes(search) ||
  r.description.includes(search) ||
  r.date.includes(search) ||
  r.amount.toString().includes(search)
  );//برای اینکه سرچ شده ها اگه بود بیاره

  // 🔥 ستون‌ها
  const columns = [
    {
      field: "number",
      headerName: "شماره سند",
      flex: 1,
      valueFormatter: toPersianDigits,
    },
    {
      field: "date",
      headerName: "تاریخ",
      flex: 1,
      valueFormatter: toPersianDigits,
    },
    {
      field: "description",
      headerName: "شرح",
      flex: 2,
    },
    {
      field: "amount",
      headerName: "مبلغ",
      flex: 1,
      valueFormatter: formatNumber,
    },
  ];

  const totalAmount = rows.reduce((sum, r) => sum + (r.amount || 0), 0 );


   return (

    <div className={styles.VList}>


      <h2>لیست اسناد</h2>


      
        <div className={styles.Toolbar}>

             <button onClick={()=>{navigate("/Vouchers/VoucherNew")}}> + <span>     </span>   سند جدید   </button>       
             <input    placeholder="جستجو  ..."  value={search} onChange={(e) => setSearch(e.target.value)} />

        </div>

       <div className={styles.GridHeight} >
          <DataGridPro
              rows={filteredRows}
              columns={columns}
              sx={{
                    direction: "rtl",
                    "& .MuiDataGrid-columnHeaders": {
                    direction: "rtl",
                    // borderLeft: "1px solid #ddd",
                                                    },
                                                    
                    "& .MuiDataGrid-cell": {
                    textAlign: "right",
                    borderLeft: "1px solid #ddd",
                                         },
                    // "& .MuiDataGrid-row": {
                    // borderBottom: "1px solid #eee",
                    //                       },
                  }}                         
                 
             getRowClassName={(params) => params.row.isBalanced ? "" : "row-error" }
              pageSizeOptions={[5, 10, 25]}
              initialState={{
               pagination: {
                 paginationModel: { pageSize: 50, page: 1 }, 
               },
              }}
              onRowClick={(params) => {
              navigate(`/Vouchers/${params.row.id}`);
              }}
           />

       </div>

          <div className={styles.Total} >
           <strong>
             جمع کل: {formatNumber(totalAmount)}
           </strong>
          </div>

        
        
    </div>);
  };
  
export default VouchersList;




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



 
