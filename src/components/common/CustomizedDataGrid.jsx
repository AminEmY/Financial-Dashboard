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
            borderLeft: "1px solid #ddd",
            textAlign: 'right'},
                                          
           "& .MuiDataGrid-cell": {
              borderLeft: "1px solid #ddd",
              textAlign: 'right'}, 
                

            ...(sx || {}) // ادغام دقیق استایل‌های اختصاصی پاس داده شده از صفحات دیگر       
            }}
    
    
    {...props}
    
             />;
}
 
export default CustomDataGrid;

