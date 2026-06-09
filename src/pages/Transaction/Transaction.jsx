import React from 'react';
import { useEffect, useState } from "react";
import axios from "axios";



const Transaction = () => {

    const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    axios.get(
      "https://reqres.in/api/collections/vouchers/records",
      {
        headers: {
          "x-api-key" : "pub_fd0b8ef344526ddd99ad91b7fe14f70b"
        }
      }
    )
    .then((res) => {
       

    console.log(res);
    setVouchers(res.data.data); // معمولا دیتا اینجاست
    })
    .catch((error) => {
      console.log(error);
    });
  }, []);

  return (
    <div>
      <h2>Issued Vouchers</h2>

      {vouchers.map((voucher) => (
        <div key={voucher.id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
          <p><strong>Number:</strong> {voucher.number}</p>
          <p><strong>Date:</strong> {voucher.date}</p>
          <p><strong>Amount:</strong> {voucher.amount}</p>
        </div>
      ))}
    </div>
  );
};

 
export default Transaction;