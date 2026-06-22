import {React,useState} from 'react';
import styles from './VoucherNew.module.css';
import { Button } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';


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

    const columns = [
  {
    field: "row",
    headerName: "ردیف",
    width: 80,
  },
  {
    field: "accountCode",
    headerName: "کد حساب",
    flex: 1,
    editable: true,
  },
  {
    field: "accountName",
    headerName: "عنوان حساب",
    flex: 2,
    editable: false,
  },
  {
    field: "sharh",
    headerName: "شرح",
    flex: 2,
    editable: true,
  },
  {
    field: "debtorAmount",
    headerName: "بدهکار",
    flex: 1,
    editable: true,
  },
  {
    field: "creditorAmount",
    headerName: "بستانکار",
    flex: 1,
    editable: true,
  },
];

    const addLine = () => {
    setVoucher((prev) => ({
    ...prev,
    lines: [
      ...prev.lines,
      {
        id: Date.now(),

        row: prev.lines.length + 1 ,

        accountCode: "",
        accountName: "",

        sharh: "",

        debtorAmount: 0,
        creditorAmount: 0,
      },
    ],
  }));
};



 return (
  
  
<div>
    
    <h2 className={styles.Header}>ثبت سند جدید</h2>
    
  <div className={styles.GHeight}>
    < DataGridPro
      rows={voucher.lines}
      columns={columns}
      showToolbar
      sx={{ 
            direction : 'rtl',
           "& .MuiDataGrid-columnHeader:not(:last-child)": {
            borderLeft: "1px solid #ddd",
            textAlign: 'right'},
                                          
            "& .MuiDataGrid-cell:not(:last-child)": {
            borderLeft: "1px solid #ddd",
            textAlign : 'right'},
                                            
          }} />
  </div>

    <Button variant="contained" onClick={addLine}> افزودن ردیف </Button>
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
</div> 

 );
}
 
export default VoucherNew;