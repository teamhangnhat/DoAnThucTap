const express = require("express");

const router = express.Router();


const {

    getMyMembership,

    refreshMyMembership,

    getMyVouchers,

    validateVoucher

} = require(

    "../controllers/membershipController"

);


const authMiddleware = require(

    "../middleware/authMiddleware"

);



// =====================================================
// GET MY MEMBERSHIP
// =====================================================

router.get(

    "/me",

    authMiddleware,

    getMyMembership

);



// =====================================================
// REFRESH MEMBERSHIP
// =====================================================

router.post(

    "/refresh",

    authMiddleware,

    refreshMyMembership

);



// =====================================================
// GET MY VOUCHERS
// =====================================================

router.get(

    "/my-vouchers",

    authMiddleware,

    getMyVouchers

);



// =====================================================
// VALIDATE VOUCHER
// =====================================================

router.post(

    "/validate-voucher",

    authMiddleware,

    validateVoucher

);


module.exports = router;