import Dashboard from "../../pages/Dashboard/Dashboard";
import VouchersList from "../../pages/Financial/Vouchers/VouchersList";
import VoucherNew from "../../pages/Financial/Vouchers/VoucherNew/VoucherNew";
import VoucherDetail from "../../pages/Financial/Vouchers/VoucherDetail";

const TabContent = ({ tab }) => {

  switch (tab.pageType) {

    case "dashboard":
      return <Dashboard />;

    case "vouchers-list":
      return <VouchersList />;

    case "voucher-new":
      return <VoucherNew />;

    case "voucher-detail":
      return (
        <VoucherDetail
          id={tab.data?.id}
        />
      );

    default:
      return <div>صفحه پیدا نشد</div>;
  }
};

export default TabContent;