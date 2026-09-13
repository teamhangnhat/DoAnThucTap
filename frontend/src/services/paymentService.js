import axios from "axios";

const API_URL =
    "http://localhost:5000";


export const createPaymentLink = async ({
    amount,
    description
}) => {

    const response =
        await axios.post(

            `${API_URL}/api/payment/create`,

            {
                amount,
                description
            }

        );

    return response.data;

};


export const confirmPayment = async (
    orderCode
) => {

    const response =
        await axios.get(

            `${API_URL}/api/payment/confirm/${orderCode}`

        );

    return response.data;

};