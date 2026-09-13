import axios from "axios";


// =====================================================
// API URL
// =====================================================

const API_URL =
    "http://localhost:5000/api/admin/products";


// =====================================================
// GET ALL PRODUCTS
// =====================================================

export const getAdminProducts = () => {

    return axios.get(API_URL);

};


// =====================================================
// GET PRODUCT BY ID
// =====================================================

export const getAdminProductById = (id) => {

    return axios.get(
        `${API_URL}/${id}`
    );

};


// =====================================================
// CREATE PRODUCT
// =====================================================

export const createAdminProduct = (productData) => {

    return axios.post(

        API_URL,

        productData

    );

};


// =====================================================
// UPDATE PRODUCT
// =====================================================

export const updateAdminProduct = (

    id,

    productData

) => {

    return axios.put(

        `${API_URL}/${id}`,

        productData

    );

};


// =====================================================
// DELETE PRODUCT
// =====================================================

export const deleteAdminProduct = (id) => {

    return axios.delete(

        `${API_URL}/${id}`

    );

};