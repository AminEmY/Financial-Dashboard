const FilterableHeader = ({ headerName, field, value, onChange }) => (
  <div
      style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      gap: 4,
      paddingTop: 6,
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <span>{headerName}</span>
    <input
      value={value || ""}
      onChange={(e) => onChange(field, e.target.value)}
      onKeyDown={(e) => e.stopPropagation()}
      placeholder=""
      style={{
        width: "88%",
        fontSize: 12,
        padding: "3px 6px",
        borderRadius: 4,
        border: "1px solid #cbd5e1",
        fontFamily: "inherit",
        textAlign: "center",
      }}
    />
  </div>
);

export default FilterableHeader;