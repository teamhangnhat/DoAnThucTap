import axios from "axios";

const API_URL =
    "http://localhost:5000/api/products";


// =====================================================
// GET ALL PRODUCTS
// =====================================================

export const getProducts = (params = {}) => {

    return axios.get(API_URL, {

        params

    });

};


// =====================================================
// GET PRODUCT BY ID
// =====================================================

export const getProductById = (id) => {

    return axios.get(

        `${API_URL}/${id}`

    );

};


// =====================================================
// GET BEST SELLER
// =====================================================

export const getBestSeller = () => {

    return axios.get(

        `${API_URL}/best-seller`

    );

};