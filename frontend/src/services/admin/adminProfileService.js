import axios from "axios";


const API_URL =
    "http://localhost:5000/api/admin/profile";


// =====================================================
// GET CURRENT ADMIN PROFILE
// =====================================================

export const getAdminProfile = () => {

    const token =
        localStorage.getItem("token");


    return axios.get(

        API_URL,

        {

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        }

    );

};


// =====================================================
// UPDATE CURRENT ADMIN PROFILE
// =====================================================

export const updateAdminProfile = (

    data

) => {

    const token =
        localStorage.getItem("token");


    return axios.put(

        API_URL,

        data,

        {

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        }

    );

};