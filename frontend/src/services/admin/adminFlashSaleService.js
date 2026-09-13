import axios from "axios";


const API_URL =

    "http://localhost:5000/api/admin/flash-sales";


// GET ALL

export const getFlashSales = () => {

    return axios.get(

        API_URL

    );

};


// GET ACTIVE

export const getActiveFlashSale = () => {

    return axios.get(

        `${API_URL}/active`

    );

};


// GET BY ID

export const getFlashSaleById = (

    id

) => {

    return axios.get(

        `${API_URL}/${id}`

    );

};


// CREATE

export const createFlashSale = (

    data

) => {

    return axios.post(

        API_URL,

        data

    );

};


// UPDATE

export const updateFlashSale = (

    id,

    data

) => {

    return axios.put(

        `${API_URL}/${id}`,

        data

    );

};


// TOGGLE

export const toggleFlashSale = (

    id

) => {

    return axios.patch(

        `${API_URL}/${id}/toggle`

    );

};


// DELETE

export const deleteFlashSale = (

    id

) => {

    return axios.delete(

        `${API_URL}/${id}`

    );

};