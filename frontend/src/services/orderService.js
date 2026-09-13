import axios from "axios";


const API_URL =
    "http://localhost:5000/api/orders";


// =====================================================
// AUTH CONFIG
// =====================================================

const getAuthConfig = () => {

    const token =
        localStorage.getItem(
            "token"
        );


    return {

        headers: {

            Authorization:
                `Bearer ${token}`

        }

    };

};



// =====================================================
// GET MY ORDERS
// =====================================================

export const getMyOrders =
    async () => {

        const response =
            await axios.get(

                `${API_URL}/my-orders`,

                getAuthConfig()

            );


        return response.data;

    };



// =====================================================
// GET ORDER DETAILS
// =====================================================

export const getOrderDetails =
    async (
        orderId
    ) => {

        const response =
            await axios.get(

                `${API_URL}/${orderId}`,

                getAuthConfig()

            );


        return response.data;

    };