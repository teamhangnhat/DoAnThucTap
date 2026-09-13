const express = require("express");

const router = express.Router();

const {
    getRevenueSummary,
    getRevenueByDay,
    getRevenueByMonth
} = require("../../controllers/Admin/adminRevenueController");


router.get(
    "/summary",
    getRevenueSummary
);


router.get(
    "/by-day",
    getRevenueByDay
);


router.get(
    "/by-month",
    getRevenueByMonth
);


module.exports = router;