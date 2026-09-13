import axios from "axios";

const API_URL = "http://localhost:5000/api/cart";


// =====================================================
// GET CART
// =====================================================

export const getCart = (customerId) => {

    return axios.get(

        `${API_URL}/${customerId}`

    );

};


// =====================================================
// ADD TO CART
// =====================================================

export const addToCart = (cartData) => {

    return axios.post(

        `${API_URL}/add`,

        cartData

    );

};


// =====================================================
// UPDATE CART ITEM
// =====================================================

export const updateCartItem = (cartData) => {

    return axios.put(

        `${API_URL}/update`,

        cartData

    );

};


// =====================================================
// DELETE CART ITEM
// =====================================================

export const deleteCartItem = (cartItemId) => {

    return axios.delete(

        `${API_URL}/item/${cartItemId}`

    );

};


// =====================================================
// CLEAR CART
// =====================================================

export const clearCart = (customerId) => {

    return axios.delete(

        `${API_URL}/clear/${customerId}`

    );

};