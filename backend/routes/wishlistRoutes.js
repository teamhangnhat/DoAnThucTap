const express = require("express");

const router = express.Router();

const {

    getWishlist,

    addToWishlist,

    removeFromWishlist

} = require("../controllers/wishlistController");


// =====================================================
// GET USER WISHLIST
// =====================================================

router.get(

    "/:customer_id",

    getWishlist

);


// =====================================================
// ADD PRODUCT
// =====================================================

router.post(

    "/add",

    addToWishlist

);


// =====================================================
// REMOVE PRODUCT
// =====================================================

router.delete(

    "/:customer_id/:product_id",

    removeFromWishlist

);


module.exports = router;