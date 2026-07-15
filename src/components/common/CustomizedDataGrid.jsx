import { DataGridPro, useGridApiRef, } from "@mui/x-data-grid-pro";

const CustomDataGrid = (props) => {
  
  // const apiRef = useGridApiRef();

  return  <DataGridPro

      // apiRef={apiRef}

      scrollbarSize={0}
      rowHeight={36}
      columnHeaderHeight={38}
      
      //showToolbar


      sx={{
            direction : 'rtl' ,
            
           "& .MuiDataGrid-columnHeader": {
            borderLeft: "1px solid #ddd",
            textAlign: 'right'},
                                          
           "& .MuiDataGrid-cell": {
              borderLeft: "1px solid #ddd",
              textAlign: 'right'}, 
                

            ...(props.sx || {}) // اگر صفحه‌ای استایل اختصاصی اضافه داشت بشه، روی این هم اعمال شود.        
            }}
    
    
    {...props}
    
             />;
}
 
export default CustomDataGrid;

