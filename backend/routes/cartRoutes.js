const express = require("express");

const router = express.Router();


const {

    addToCart,

    getCart,

    updateCartItem,

    deleteCartItem,

    clearCart

} = require("../controllers/cartController");



// ADD

router.post(

    "/add",

    addToCart

);



// GET

router.get(

    "/:customer_id",

    getCart

);



// UPDATE

router.put(

    "/update",

    updateCartItem

);



// DELETE ONE

router.delete(

    "/item/:id",

    deleteCartItem

);



// CLEAR

router.delete(

    "/clear/:customer_id",

    clearCart

);


module.exports = router;