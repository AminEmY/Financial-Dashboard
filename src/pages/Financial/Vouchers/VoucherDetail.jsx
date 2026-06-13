import React from 'react';
import { useParams } from "react-router-dom";
import styles from "./VoucherDetail.module.css"



const VoucherDetail = () => {

  const { id } = useParams();
  const voucher = {
    id,
    date: "1405/03/20",
    description: "دریافت از مشتری",
  };

  const items = [
    {
      id: 1,
      account: "صندوق",
      debit: 1500000,
      credit: 0,
    },
    {
      id: 2,
      account: "حساب مشتریان",
      debit: 0,
      credit: 1500000,
    },
  ];
  const totalDebit = items.reduce(
  (sum, item) => sum + item.debit,
  0
);

const totalCredit = items.reduce(
  (sum, item) => sum + item.credit,
  0
);

const isBalanced =
  totalDebit === totalCredit;
  
  return (
     <div>
      {/* <h2>جزئیات سند</h2>
      <p>شماره سند: {id}</p> */}
       
      {/* Header */}
      <h2>سند {voucher.id}</h2>

      <p>تاریخ: {voucher.date}</p>

      <p>شرح: {voucher.description}</p>

      <hr />

      {/* Table Header */}
      <div
        style={{
          display: "flex",
          gap: "50px",
          fontWeight: "bold",
        }}
      >
        <span>حساب</span>
        <span>بدهکار</span>
        <span>بستانکار</span>
      </div>

      {/* Detail Lines */}
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: "50px",
            marginTop: "10px",
          }}
        >
          <span>{item.account}</span>

          <span>
            {item.debit
              ? item.debit.toLocaleString()
              : "-"}
          </span>

          <span>
            {item.credit
              ? item.credit.toLocaleString()
              : "-"}
          </span>
        </div>
      ))}
      <hr />

<p>
  جمع بدهکار:
  {totalDebit.toLocaleString()}
</p>

<p>
  جمع بستانکار:
  {totalCredit.toLocaleString()}
</p>

<p>
  {isBalanced
    ? "✔ سند تراز است"
    : "❌ سند نامتوازن است"}
</p>
    </div>
    
    
  );
  
};

export default VoucherDetail;