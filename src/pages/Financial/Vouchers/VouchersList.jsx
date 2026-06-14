import React, { useState } from 'react';
// import { useEffect, useState } from "react";
// import axios from "axios";
import styles from "./vouchersList.module.css"
import { useNavigate } from 'react-router-dom';
import { DataGrid } from "@mui/x-data-grid";




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
    },
    {
      field: "date",
      headerName: "تاریخ",
      flex: 1,
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
      valueFormatter: (params) =>
        params.value?.toLocaleString(),
    },
  ];

  const totalAmount = rows.reduce((sum, r) => sum + (r.amount || 0), 0 );

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

   return (

    <div className={styles.VList}>
      <h2>لیست اسناد</h2>

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
      
      <input 
        placeholder="جستجو..."  value={search} onChange={(e) => setSearch(e.target.value)} style={{ direction: "rtl", textAlign: "right", padding: "6px 10px", width: "200px", fontSize: "14px", marginTop: 10  }} />
     <div style={{ height: 700, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          sx={{
          direction: "rtl",
          "& .MuiDataGrid-columnHeaders": {
          direction: "rtl",
                         },
          "& .MuiDataGrid-cell": {
           textAlign: "right",
           },
              }}
          getRowClassName={(params) => params.row.isBalanced ? "" : "row-error" }
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 50, page: 1 },
            },
          }}
          onRowClick={(params) => {
            navigate(`/Voucher/${params.row.id}`);
          }}
        />
      </div>

         <div style={{ marginTop: 10, marginRight :150 , textAlign: "right" }}>
           <strong>
             جمع کل: {totalAmount.toLocaleString()}
           </strong>
          </div>

        
        
    </div>);
  };
  
export default VouchersList;
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
   


 
