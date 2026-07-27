import { useState } from "react";

export default function useVoucher() {

    const [voucher, setVoucher] = useState({

        number: "",

        state: 0,
        subNumber: 0,

        date: "1405/03/31",

        sharh: "React",

        tozihat: "",

        debtorAmount: 0,
        creditorAmount: 0,

        countOfLines: 0,

        inserterCode: 0,

        lines: [],

        subDomain: 0,

        reference: 0,

        type: 0,

    });

    return {
        voucher,
        setVoucher,
    };
}