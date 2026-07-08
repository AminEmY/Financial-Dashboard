import {React,useState} from 'react';
import styles from './VoucherNew.module.css';
import { Button } from '@mui/material';
import {formatNumber} from "../../../utils/formatter";//جهت تبدیل اعداد و تاریخ به فارسی
import CustomDataGrid from "../../../components/common/CustomizedDataGrid";
import getVoucherColumns from "./VoucherColumns";
import { useGridApiRef } from "@mui/x-data-grid-pro";
import VoucherHeader from "./VoucherHeader";



const VoucherNew = () => {

    // const [header , setHeader]= useState({ number:"" , date:"", description : "" });

    // // const [number, setNumber] = useState("1004");
    // // const [date, setDate] = useState("1405/03/24");
    // // const [description, setDescription] = useState("");
    // const [items, setItems] = useState([
    //   {
    //    id: 1,
    //    account: "",
    //    debit: 100,
    //    credit: 200,
    //   },
    //                                   ]);

    
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
    
    const apiRef = useGridApiRef();
    
    const columns = getVoucherColumns();

const handleCellKeyDown = (params, event) => {

  console.log("Key:", event.key, "Field:", params.field);

  if (event.key !== "Enter") return ;

  event.preventDefault();

  const order = [
    "accountCode",
    "sharh",
    "debtorAmount",
    "creditorAmount",
  ];

  const currentIndex = order.indexOf(params.field);

  if (currentIndex === -1) return;

  // ستون بعدی
  if (currentIndex < order.length - 1) {
    apiRef.current.startCellEditMode({
      id: params.id,
      field: order[currentIndex + 1],
    });

    return;
  }

  // آخرین ستون
  addLine();
};    

const addLine = () => {
  
  const newId = Date.now();
    const newRow = {
    id: newId,
    row: voucher.lines.length + 1,
    accountCode: "",
    accountName: "",
    sharh: "",
    debtorAmount: 0,
    creditorAmount: 0,
  };


  setVoucher((prev) => ({
    ...prev,
    lines: [ ...prev.lines, newRow ],
  }));

  requestAnimationFrame(() => {
    apiRef.current.startCellEditMode({
      id: newId,
      field: "accountCode",
    });
  });
  
};



const processRowUpdate = (newRow) => {

  setVoucher((prev) => ({
    ...prev,
    
    lines: prev.lines.map((line) =>
      line.id === newRow.id  ? newRow : line ),
  }));
  
  return newRow;
}; //که اگر کاربر ردیفی رو ویرایش کرد، بره بر اساس آیدی همون ردیف رو جایگزین کنه و فقط یو آی رو تغییر نده استیت هم تغییر بده واقعا

const totalDebtor = voucher.lines.reduce(
(sum, line) => sum + Number(line.debtorAmount || 0) , 0 ); //حالا که State آپدیت می‌شود، دیگر لازم نیست این دو مقدار را دستی نگه داریم

const totalCreditor = voucher.lines.reduce(
(sum, line) => sum + Number(line.creditorAmount || 0) , 0 );

const isBalanced = totalDebtor === totalCreditor; //تراز بودن سند

return (
  
  
  <div>
    
    <h2 className={styles.Header}>ثبت سند جدید</h2>

    <VoucherHeader voucher={voucher} setVoucher={setVoucher}/>
    
  <div className={styles.GHeight}>
    
    < CustomDataGrid
      apiRef={apiRef}
      
      rows={voucher.lines}
      columns={columns}

      onCellKeyDown={handleCellKeyDown}
      processRowUpdate={processRowUpdate}
      
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

    <Button className={styles.Button} variant="contained" onClick={addLine}> افزودن ردیف </Button>
</div> 

);
}

export default VoucherNew;


{/* <div>
<label>شماره سند</label>
<input placeholder='شماره سند'
  value={header.number}
  onChange={(e) =>
    setHeader({... header , number : e.target.value})
  }
  //چرا این را نمی‌نویسیم؟ ❌ setHeader({ number: e.target.value }); چون: date ❌ description ❌ پاک می‌شوند.         این: ...header یعنی: { number: "", date: "", description: "", } را کپی کن.
/>
</div> */}
{/* <br /> */}
{/* <div><TextField
  label="شماره سند"
  value={header.number}
  onChange={(e) =>
    setHeader({... header , number : e.target.value})
  }
  /></div> */}
{/* <br /> */}
{/* <div>
<label>تاریخ</label>
<input placeholder='تاریخ'
  value={header.date}
  onChange={(e) =>
    setHeader({... header , date: e.target.value})
  }
/>
</div>
<br />
<br />
<div>
<label>شرح</label>
<input placeholder='شرح سند'
  value={header.description}
  onChange={(e) =>
    setHeader({...header, description : e.target.value})
  }
/>
</div>

{items.map((item) => (
<div key={item.id}>
<span>{item.account || "—"}</span>
<span>{item.debit}</span>
<span>{item.credit}</span>
</div>
              ))}

*/}