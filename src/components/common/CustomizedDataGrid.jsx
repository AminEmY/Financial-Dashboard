import { DataGridPro } from "@mui/x-data-grid-pro";

const CustomDataGrid = ({ sx, ...props }) => {
  
  return  <DataGridPro


      scrollbarSize={0}
      rowHeight={36}
      columnHeaderHeight={38}
      showToolbar


      sx={{
            direction : 'rtl' ,
            
           "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#f5f6fa !important",
            borderBottom: "2px solid #828e99 !important",
            borderLeft: "1px solid #cfd5da",
            color: "#070707 !important",
            fontSize: "0.85rem",
            fontWeight: "700 !important",
            transition: "background-color 0.15s ease",
          },
          
          "& .MuiDataGrid-columnHeader:hover": {
             backgroundColor: "#e9edf3 !important",},
                    /* متن هدر */
           "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "700",
            fontSize: "13px",
            whiteSpace: "nowrap",
          },

           "& .MuiDataGrid-columnHeaderTitleContainer": {
             justifyContent: "flex-end !important"},
             
           "& .MuiDataGrid-cell": {
              borderLeft: "1px solid #cfd5da",
              textAlign: 'right'}, 

                

            ...(sx || {}) // ادغام دقیق استایل‌های اختصاصی پاس داده شده از صفحات دیگر       
            }}
    
    
    {...props}
    
             />;
}
 
export default CustomDataGrid;

