// import { TextField } from "@mui/material";
// import { useGridApiContext } from "@mui/x-data-grid-pro";

// export default function VoucherAmountEditCell(props) {
//     const { id, field, value } = props;

//     const apiRef = useGridApiContext();

//     const handleChange = async (event) => {

//         const newValue = Number(event.target.value) || 0;

//         await apiRef.current.setEditCellValue({
//             id,
//             field,
//             value: newValue,
//         });

//         const oppositeField =
//             field === "debtorAmount"
//                 ? "creditorAmount"
//                 : "debtorAmount";

//         await apiRef.current.setEditCellValue({
//             id,
//             field: oppositeField,
//             value: 0,
//         });
//     };

//     return (
//         <TextField
//             fullWidth
//             variant="standard"
//             value={value ?? ""}
//             onChange={handleChange}
//         />
//     );
// }