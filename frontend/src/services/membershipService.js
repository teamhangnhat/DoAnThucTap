import axios from "axios";


const API_URL =

    "http://localhost:5000/api/membership";



// =====================================================
// GET MY MEMBERSHIP
// =====================================================

export const getMyMembership = () => {

    const token =

        localStorage.getItem(

            "token"

        );


    return axios.get(

        `${API_URL}/me`,

        {

            headers: {

                Authorization:

                    `Bearer ${token}`

            }

        }

    );

};



// =====================================================
// REFRESH MEMBERSHIP
// =====================================================

export const refreshMyMembership = () => {

    const token =

        localStorage.getItem(

            "token"

        );


    return axios.post(

        `${API_URL}/refresh`,

        {},

        {

            headers: {

                Authorization:

                    `Bearer ${token}`

            }

        }

    );

};



// =====================================================
// GET MY VOUCHERS
// =====================================================

export const getMyVouchers = () => {

    const token =

        localStorage.getItem(

            "token"

        );


    return axios.get(

        `${API_URL}/my-vouchers`,

        {

            headers: {

                Authorization:

                    `Bearer ${token}`

            }

        }

    );

};



// =====================================================
// VALIDATE VOUCHER
// =====================================================

export const validateVoucher = (

    code,

    orderAmount

) => {

    const token =

        localStorage.getItem(

            "token"

        );


    return axios.post(

        `${API_URL}/validate-voucher`,

        {

            code:

                code,

            order_amount:

                orderAmount

        },

        {

            headers: {

                Authorization:

                    `Bearer ${token}`

            }

        }

    );

};