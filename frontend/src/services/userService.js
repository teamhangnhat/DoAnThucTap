import axios from "axios";


// =====================================================
// API URL
// =====================================================

const API_URL =

    "http://localhost:5000/api/users";



// =====================================================
// GET PROFILE
// =====================================================

export const getProfile = (

    userId

) => {

    return axios.get(

        `${API_URL}/profile/${userId}`

    );

};



// =====================================================
// UPDATE PROFILE
// =====================================================

export const updateProfile = (

    userId,

    profileData

) => {

    return axios.put(

        `${API_URL}/profile/${userId}`,

        profileData

    );

};



// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePassword = (

    userId,

    passwordData

) => {

    return axios.put(

        `${API_URL}/change-password/${userId}`,

        passwordData

    );

};