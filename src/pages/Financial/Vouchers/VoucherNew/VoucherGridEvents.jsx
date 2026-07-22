  
export  const addLine = ({voucher,setVoucher,apiRef}) => {
  
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


export const handleCellKeyDown = ({params, event , apiRef, voucher,setVoucher }) => {

        // console.log("Enter", params.field);

        if (event.key !== "Enter") return ;

        event.preventDefault();

        const order = [
        "accountCode",
         "sharh",
         "debtorAmount",
         "creditorAmount",
        ];

        const currentIndex = order.indexOf(params.field);
        //  console.log("currentIndex:", currentIndex);

         if (currentIndex === -1)  {console.log("field not found") 
            return;}

        // ستون بعدی
        if (currentIndex < order.length - 1) {
         //     console.log(
         //   "move to:",
         //   order[currentIndex + 1]
         // );

        const nextField = order[currentIndex + 1];

        setTimeout( () => { apiRef.current.setCellFocus( params.id, nextField ) }, 50 );
        
         apiRef.current.startCellEditMode({
         id: params.id,
         field: nextField,
        });



            return;
        }

            // console.log("last column");
            // آخرین ستون
        addLine({voucher,setVoucher,apiRef});
                                                }