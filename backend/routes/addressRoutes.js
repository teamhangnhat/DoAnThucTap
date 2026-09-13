const express = require("express");

const router = express.Router();

const {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require("../controllers/addressController");

// Lấy danh sách địa chỉ
router.get("/:customer_id", getAddresses);

// Thêm địa chỉ
router.post("/", createAddress);

// Cập nhật địa chỉ
router.put("/:id", updateAddress);

// Xóa địa chỉ
router.delete("/:id", deleteAddress);

// Đặt mặc định
router.put("/default/:id", setDefaultAddress);

module.exports = router;