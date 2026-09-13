import axios from "axios";


const API_URL =

    "http://localhost:5000/api/admin/dashboard";


// =====================================================
// GET ALL DASHBOARD DATA
// =====================================================

export const getAdminDashboard = () => {

    return axios.get(

        API_URL

    );

};