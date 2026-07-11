import CustomDataGrid from "../../../../components/common/CustomizedDataGrid";
import getVoucherColumns from "./VoucherColumns";

const VoucherLineGrid = () => {

    const columns = getVoucherColumns();

    return (
        <CustomDataGrid
            columns={columns}
        />
    );
}

export default VoucherLineGrid;