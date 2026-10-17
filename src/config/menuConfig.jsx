const menuConfig = [
    {
        title: "میز کار",
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

            {
                title: "ساختار حساب",
                path: "/Account",
                pageType: "account",

            }

        ],
    },
];

export default menuConfig;