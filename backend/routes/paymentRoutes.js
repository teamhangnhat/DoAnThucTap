const express = require("express");

const router =
    express.Router();

const {

    createPaymentLink,

    confirmPayment

} = require(
    "../controllers/paymentController"
);


router.post(
    "/create",
    createPaymentLink
);


router.get(
    "/confirm/:orderCode",
    confirmPayment
);


module.exports = router;