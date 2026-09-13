import axios from "axios";



const API_URL =

    "http://localhost:5000/api/admin/orders";



// =====================================================
// GET ALL ORDERS
// =====================================================

export const getAdminOrders = () => {

    return axios.get(

        API_URL

    );

};



// =====================================================
// GET ORDER DETAIL
// =====================================================

export const getAdminOrderById = (

    id

) => {

    return axios.get(

        `${API_URL}/${id}`

    );

};



// =====================================================
// UPDATE ORDER STATUS
// =====================================================

export const updateOrderStatus = (

    id,

    status

) => {

    return axios.put(

        `${API_URL}/${id}/status`,

        {

            status

        }

    );

};