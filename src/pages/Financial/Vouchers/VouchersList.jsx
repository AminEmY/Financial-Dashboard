import{ React,useState,useEffect } from 'react';
import axios from "axios";
import styles from "./vouchersList.module.css"
import { useNavigate } from 'react-router-dom';
import CustomDataGrid  from '../../../components/common/CustomizedDataGrid'
import {formatNumber,toPersianDigits} from "../../../utils/formatter";//جهت تبدیل اعداد و تاریخ به فارسی




const VouchersList = () => {

  const [search, setSearch] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const navigate = useNavigate();

 useEffect(() => {
  axios
    .post("http://localhost:8049/api/Voucher/Search")
    .then((res) => {
      // console.log(res.data);
      setVouchers(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
}, []);



const rows = vouchers.map((v) => ({
    id: v.id,
    number: v.number,
    date: v.date_Shamsi,
    description: v.sharh ?? "",
    countOfLines: v.countOfLines,
    amount: v.amount ?? 0,
    isBalanced: v.amount > 0 // فعلاً فرضی
  }));

  const filteredRows = rows.filter((r) =>
  String(r.number).includes(search) ||
  (r.description ?? "").includes(search) ||
  String(r.date).includes(search) ||
  String(r.countOfLines).includes(search) ||
  String(r.amount).includes(search)
  );//برای اینکه سرچ شده ها اگه بود بیاره

  // 🔥 ستون‌ها
  const columns = [
    {
    field: "number",
    headerName: "شماره سند",
    flex: 1,
    align: "right",
    renderCell: (params) => (
    <div
      style={{
        width: "100%",
        textAlign: "right",
        direction: "ltr",
        paddingRight: 8,
      }}
    >
      {toPersianDigits(params.value)}
    </div>
      ),
    },//کامل اعداد نمیفتاد
    {
      field: "date",
      headerName: "تاریخ",
      flex: 1,
      align: "right",
      valueFormatter: toPersianDigits,
    },
    {
      field: "description",
      headerName: "شرح",
      flex: 2,
      align: "right",
    },
    {
    field: "countOfLines",
    headerName: "تعداد ردیف سند",
    flex: 1,
    align: "right",
    // type: "number"
    valueFormatter: formatNumber,
    },
    {
      field: "amount",
      headerName: "مبلغ",
      minWidth: 170,
      align:"right",
      valueFormatter: formatNumber,
    },
  ];

  const totalAmount = rows.reduce((sum, r) => sum + (r.amount || 0), 0 );

  function CustomFooter() {
    return (
    <strong className={styles.Total} >
      جمع کل: {formatNumber(totalAmount)}
    </strong>
  );
}


   return (

    <div className={styles.VList}>


      <h2>لیست اسناد</h2>


      
        <div className={styles.Toolbar}>

             <button onClick={()=>{navigate("/Vouchers/VoucherNew")}}> + <span>     </span>   سند جدید   </button>       
             <input    placeholder="جستجو  ..."  value={search} onChange={(e) => setSearch(e.target.value)} />

        </div>

       <div className={styles.GridHeight}  >
          <CustomDataGrid
              rows={filteredRows}
              columns={columns}
              slots={{footer: CustomFooter,}}
                
            
            onRowClick={(params) => {
            navigate(`/Vouchers/${params.row.id}`);
            }}
            // getRowClassName={(params) =>params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"}  
              
              // pagination
              // paginationMode="server"
              // sortingMode="server"
              // filterMode="server"

              // pageSizeOptions={[5, 10, 25]}

              // initialState={{
              //  pagination: {
              //    paginationModel: { pageSize: 50, page: 1 }, 
              //  },
              //   pinnedColumns: {
              //   left: ["number"],
              //                   },
              // }}
              
           />

       </div>

          {/* <div className={styles.Total} >
           <strong>
             جمع کل: {formatNumber(totalAmount)}
           </strong>
          </div> */}

        
        
    </div>);
  };
  
export default VouchersList;


//----------------------------------------------------------------------------قبل استفاده از سند واقعی و ای پی آی
  // const vouchers = [
  // {
  //   id: 1001,
  //   number: "1001",
  //   date: "1405/03/20",
  //   amount: 1500000,
  //   description: "سند دریافت از مشتری"
  // },
  // {
  //   id: 1002,
  //   number: "1002",
  //   date: "1405/03/21",
  //   amount: 800000,
  //   description: "سند پرداخت حقوق"
  // },
  // {
  //   id: 1003,
  //   number: "1003",
  //   date: "1405/03/22",
  //   amount: 2500000,
  //   description: "سند خرید تجهیزات"
  // },
  //                 ];
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



 
