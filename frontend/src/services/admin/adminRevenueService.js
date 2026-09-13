import axios from "axios";


const API_URL =

    "http://localhost:5000/api/admin/revenue";


// =====================================================
// SUMMARY
// =====================================================

export const getRevenueSummary = () => {

    return axios.get(

        `${API_URL}/summary`

    );

};


// =====================================================
// BY DAY
// =====================================================

export const getRevenueByDay = () => {

    return axios.get(

        `${API_URL}/by-day`

    );

};


// =====================================================
// BY MONTH
// =====================================================

export const getRevenueByMonth = () => {

    return axios.get(

        `${API_URL}/by-month`

    );

};