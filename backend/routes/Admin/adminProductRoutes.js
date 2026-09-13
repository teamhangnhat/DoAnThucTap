const express = require("express");

const router = express.Router();


const {

    getAdminProducts,

    getAdminProductById,

    createAdminProduct,

    updateAdminProduct,

    deleteAdminProduct

} = require(

    "../../controllers/Admin/adminProductController"

);


// GET ALL

router.get(

    "/",

    getAdminProducts

);


// GET DETAIL

router.get(

    "/:id",

    getAdminProductById

);


// CREATE

router.post(

    "/",

    createAdminProduct

);


// UPDATE

router.put(

    "/:id",

    updateAdminProduct

);


// DELETE

router.delete(

    "/:id",

    deleteAdminProduct

);


module.exports = router;