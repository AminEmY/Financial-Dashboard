import {React,useState} from 'react';
import styles from './VoucherNew.module.css'


const VoucherNew = () => {

    const [number, setNumber] = useState("1004");
    const [date, setDate] = useState("1405/03/24");
    const [description, setDescription] = useState("");
    


 return (
  
  
<div >
    
    <h2 className={styles.Header}>ثبت سند جدید</h2>
        <div>
      <label>شماره سند</label>
      <input
        value={number}
        onChange={(e) =>
          setNumber(e.target.value)
        }
      />
    </div>

    <div>
      <label>تاریخ</label>
      <input
        value={date}
        onChange={(e) =>
          setDate(e.target.value)
        }
      />
    </div>

    <div>
      <label>شرح</label>
      <input
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />
    </div>
  
  
  
  
</div> 

 );
}
 
export default VoucherNew;