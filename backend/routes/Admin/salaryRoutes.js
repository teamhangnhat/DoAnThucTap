const express = require("express");
const router = express.Router();

const {
    getEmployeeSalaries,
    createEmployeeSalary
} = require("../../controllers/Admin/salaryController");

// Lấy lịch sử lương của nhân viên
router.get("/:employeeId", getEmployeeSalaries);

// Thêm kỳ lương, thưởng hoặc khấu trừ cho nhân viên
router.post("/:employeeId", createEmployeeSalary);

module.exports = router;