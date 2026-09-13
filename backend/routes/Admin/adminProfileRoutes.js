const express = require("express");

const router =
    express.Router();


const authMiddleware =
    require("../../middleware/authMiddleware");


const {

    getAdminProfile,
    updateAdminProfile

} = require(

    "../../controllers/Admin/adminProfileController"

);


// =====================================================
// GET CURRENT ADMIN PROFILE
// =====================================================

router.get(

    "/",

    authMiddleware,

    getAdminProfile

);


// =====================================================
// UPDATE CURRENT ADMIN PROFILE
// =====================================================

router.put(

    "/",

    authMiddleware,

    updateAdminProfile

);


module.exports = router;