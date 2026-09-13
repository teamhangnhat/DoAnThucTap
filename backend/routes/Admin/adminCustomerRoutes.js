const express = require("express");

const router = express.Router();


const {

    getCustomers,

    getCustomerById,

    updateCustomerStatus,

    deleteCustomer

} = require(

    "../../controllers/admin/adminCustomerController"

);



// =====================================================
// GET ALL CUSTOMERS
// =====================================================

router.get(

    "/",

    getCustomers

);



// =====================================================
// GET CUSTOMER BY ID
// =====================================================

router.get(

    "/:id",

    getCustomerById

);



// =====================================================
// UPDATE CUSTOMER STATUS
// =====================================================

router.put(

    "/:id/status",

    updateCustomerStatus

);



// =====================================================
// DELETE CUSTOMER
// =====================================================

router.delete(

    "/:id",

    deleteCustomer

);



module.exports = router;