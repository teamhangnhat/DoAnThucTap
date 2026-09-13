const express = require("express");

const router = express.Router();

const {
    getProfile,
    updateProfile,
     changePassword
} = require("../controllers/userController");

// Lấy profile
router.get("/profile/:id", getProfile);

// Cập nhật profile
router.put("/profile/:id", updateProfile);
router.put("/change-password/:id", changePassword);
module.exports = router;