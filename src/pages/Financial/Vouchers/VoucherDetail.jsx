import React from 'react';
import { useParams } from "react-router-dom";
import styles from "./VoucherDetail.module.css"



const VoucherDetail = () => {

  const { id } = useParams();
  
  return (
    <div>
      <h2>جزئیات سند</h2>
      <p>شماره سند: {id}</p>
    </div>
  );
};

export default VoucherDetail;