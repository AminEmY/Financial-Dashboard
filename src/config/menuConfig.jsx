const menuConfig = [
    {
        title: "داشبورد",
        path: "/dashboard",
        pageType: "dashboard",
        closable: false,
    },

    {
        title: "مالی",

        children: [

            {
                title: "اسناد",

                children: [

                    {
                        title: "ثبت سند",
                        path: "/Vouchers/VoucherNew",
                        pageType: "voucher-new",
                    },

                    {
                        title: "لیست اسناد",
                        path: "/Vouchers",
                        pageType: "vouchers-list",
                    },

                ],
            },

        ],
    },
];

export default menuConfig;