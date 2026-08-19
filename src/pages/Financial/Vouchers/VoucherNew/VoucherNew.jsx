import {React} from 'react';
import styles from "./VoucherNew.module.css";
import VoucherHeader from "./VoucherHeader";
import VoucherLineGrid from "./VoucherLineGrid"
import useVoucher from "./useVoucher";



const VoucherNew = () => {

  const { voucher, setVoucher } = useVoucher();
    



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




</div> 

);
}

export default VoucherNew;

