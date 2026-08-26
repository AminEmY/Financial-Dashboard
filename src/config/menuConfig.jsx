
const menuConfig = [

    {
        title: "داشبورد",
        path: "/dashboard"
    },


    {
        title: "مالی",
        children: [

            {
                title: "اسناد",
                children: [

                    {
                        title: "ثبت سند",
                        path: "/Vouchers/VoucherNew"
                    },

                    {
                        title: "لیست اسناد",
                        path: "/Vouchers"
                    }

                ]
            }

        ]
    },


    {
        title: "احراز هویت",
        path: "/authentication"
    }

];
export default menuConfig