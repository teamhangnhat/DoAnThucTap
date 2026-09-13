const express = require("express");


const router = express.Router();


const {

    getAdminDashboard

} = require(

    "../../controllers/admin/adminDashboardController"

);


router.get(

    "/",

    getAdminDashboard

);


module.exports = router;