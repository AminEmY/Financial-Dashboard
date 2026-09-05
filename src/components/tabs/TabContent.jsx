import Dashboard from "../../pages/Dashboard/Dashboard";
import VouchersList from "../../pages/Financial/Vouchers/VouchersList";
import VoucherNew from "../../pages/Financial/Vouchers/VoucherNew/VoucherNew";


const TabContent = ({ tab }) => {

  switch (tab.pageType) {

    case "dashboard":
      return <Dashboard />;

    case "vouchers-list":
      return <VouchersList />;

    case "voucher-new":
      return <VoucherNew tab={tab} />;

    case "voucher-detail":
      return <VoucherNew tab={tab} />;

    default:
      return <div>صفحه پیدا نشد</div>;
  }
};

export default TabContent;