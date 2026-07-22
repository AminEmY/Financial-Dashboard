import TextField from "@mui/material/TextField";

 function VoucherAmountEditCell(props) {
  const {
    id,
    field,
    value,
    apiRef,
  } = props;

  console.log(props);

  const handleChange = (e) => {
    const newValue = Number(e.target.value) || 0;
    console.log("Amount Edit Cell");
    apiRef.setEditCellValue({
      id,
      field,
      value: newValue,
    });
  console.log(field, newValue);
    if (field === "debtorAmount") {
      apiRef.setEditCellValue({
        id,
        field: "creditorAmount",
        value: 0,
      });
    }

    if (field === "creditorAmount") {
      apiRef.setEditCellValue({
        id,
        field: "debtorAmount",
        value: 0,
      });
    }
  };

  return (
    <TextField
      value={value ?? ""}
      type="number"
      variant="standard"
      fullWidth
      onChange={handleChange}
    />
  );
}

export default VoucherAmountEditCell