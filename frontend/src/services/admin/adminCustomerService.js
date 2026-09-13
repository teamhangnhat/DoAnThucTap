import axios from "axios";


const API_URL =

    "http://localhost:5000/api/admin/customers";


// =====================================================
// GET ALL CUSTOMERS
// =====================================================

export const getCustomers = async () => {

    return await axios.get(

        API_URL

    );

};


// =====================================================
// GET CUSTOMER BY ID
// =====================================================

export const getCustomerById = async (

    id

) => {

    return await axios.get(

        `${API_URL}/${id}`

    );

};


// =====================================================
// UPDATE CUSTOMER STATUS
// =====================================================

export const updateCustomerStatus = async (

    id,

    status

) => {

    return await axios.put(

        `${API_URL}/${id}/status`,

        {

            status

        }

    );

};


// =====================================================
// DELETE CUSTOMER
// =====================================================

export const deleteCustomer = async (

    id

) => {

    return await axios.delete(

        `${API_URL}/${id}`

    );

};