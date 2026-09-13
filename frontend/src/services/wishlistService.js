import axios from "axios";


const API_URL =

    "http://localhost:5000/api/wishlist";


// =====================================================
// GET WISHLIST
// =====================================================

export const getWishlist = (

    customerId

) => {

    return axios.get(

        `${API_URL}/${customerId}`

    );

};


// =====================================================
// ADD TO WISHLIST
// =====================================================

export const addToWishlist = (

    wishlistData

) => {

    return axios.post(

        `${API_URL}/add`,

        wishlistData

    );

};


// =====================================================
// REMOVE FROM WISHLIST
// =====================================================

export const removeFromWishlist = (

    customerId,

    productId

) => {

    return axios.delete(

        `${API_URL}/${customerId}/${productId}`

    );

};