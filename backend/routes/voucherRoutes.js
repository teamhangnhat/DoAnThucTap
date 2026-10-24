const express = require("express");
const router = express.Router();

const {
    getAvailableVouchers
} = require("../controllers/voucherController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
    "/available",
    authMiddleware,
    getAvailableVouchers
);

module.exports = router;