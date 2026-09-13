const express = require("express");

const router =
    express.Router();


const {

    createOrder,

    getMyOrders,

    getOrderDetails

} = require(

    "../controllers/orderController"

);


const authMiddleware = require(

    "../middleware/authMiddleware"

);


// =====================================================
// CREATE ORDER
// =====================================================

router.post(

    "/",

    authMiddleware,

    createOrder

);


// =====================================================
// GET MY ORDERS
// =====================================================

router.get(

    "/my-orders",

    authMiddleware,

    getMyOrders

);


// =====================================================
// GET ORDER DETAILS
// =====================================================

router.get(

    "/:id",

    authMiddleware,

    getOrderDetails

);


module.exports = router;