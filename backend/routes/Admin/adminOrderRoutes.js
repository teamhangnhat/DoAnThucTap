const express = require("express");


const router = express.Router();


const {

    getAdminOrders,

    getAdminOrderById,

    updateOrderStatus

} = require(

    "../../controllers/admin/adminOrderController"

);



// =====================================================
// GET ALL ORDERS
// =====================================================

router.get(

    "/",

    getAdminOrders

);



// =====================================================
// GET ORDER DETAIL
// =====================================================

router.get(

    "/:id",

    getAdminOrderById

);



// =====================================================
// UPDATE ORDER STATUS
// =====================================================

router.put(

    "/:id/status",

    updateOrderStatus

);



module.exports = router;