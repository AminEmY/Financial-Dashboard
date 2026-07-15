import {React,useState} from 'react';
import styles from "./VoucherNew.module.css";
import {formatNumber} from "../../../../utils/formatter";//جهت تبدیل اعداد و تاریخ به فارسی
import VoucherHeader from "./VoucherHeader";
import VoucherLineGrid from "./VoucherLineGrid"



const VoucherNew = () => {


    
    const [voucher, setVoucher] = useState({
      number: "",

      state: 0,
      subNumber: 0,
      
      date: "1405/03/31" ,
      sharh: "React",
      tozihat: "",
      
      debtorAmount: 0,
      creditorAmount: 0,
      
      countOfLines: 0,
      inserterCode: 0,
      
      lines: [],
      
      subDomain: 0,
      reference: 0,
      type: 0,
    });
    





const totalDebtor = voucher.lines.reduce(
(sum, line) => sum + Number(line.debtorAmount || 0) , 0 ); //حالا که State آپدیت می‌شود، دیگر لازم نیست این دو مقدار را دستی نگه داریم

const totalCreditor = voucher.lines.reduce(
(sum, line) => sum + Number(line.creditorAmount || 0) , 0 );

const isBalanced = totalDebtor === totalCreditor; //تراز بودن سند

return (
  
  
  <div>
    
    <h2 className={styles.Header}>ثبت سند جدید</h2>

    <VoucherHeader voucher={voucher} setVoucher={setVoucher}/>


  <div>
    
    <VoucherLineGrid 
      voucher={voucher}
      setVoucher={setVoucher}
    />

  </div>



  <div className={styles.Footer}>

    <span>
        جمع بستانکار :
        {formatNumber(totalCreditor)}
    </span>

    <span>
        جمع بدهکار :
        {formatNumber(totalDebtor)}
    </span>

    <span className={isBalanced ? styles.Balanced : styles.NotBalanced} >
        {isBalanced ? "سند تراز است" : "سند تراز نیست"}
    </span>

  </div>


</div> 

);
}

export default VoucherNew;

