const express = require("express");

const router = express.Router();

const {

    getFlashSales,

    getActiveFlashSale,

    getFlashSaleById,

    createFlashSale,

    updateFlashSale,

    toggleFlashSale,

    deleteFlashSale

} = require(

    "../../controllers/Admin/adminFlashSaleController"

);


// =====================================================
// GET ALL FLASH SALES
// GET /api/admin/flash-sales
// =====================================================

router.get(

    "/",

    getFlashSales

);


// =====================================================
// GET ACTIVE FLASH SALE
// GET /api/admin/flash-sales/active
// =====================================================

router.get(

    "/active",

    getActiveFlashSale

);


// =====================================================
// GET FLASH SALE BY ID
// GET /api/admin/flash-sales/:id
// =====================================================

router.get(

    "/:id",

    getFlashSaleById

);


// =====================================================
// CREATE FLASH SALE
// POST /api/admin/flash-sales
// =====================================================

router.post(

    "/",

    createFlashSale

);


// =====================================================
// UPDATE FLASH SALE
// PUT /api/admin/flash-sales/:id
// =====================================================

router.put(

    "/:id",

    updateFlashSale

);


// =====================================================
// TOGGLE ACTIVE STATUS
// PATCH /api/admin/flash-sales/:id/toggle
// =====================================================

router.patch(

    "/:id/toggle",

    toggleFlashSale

);


// =====================================================
// DELETE FLASH SALE
// DELETE /api/admin/flash-sales/:id
// =====================================================

router.delete(

    "/:id",

    deleteFlashSale

);


module.exports = router;