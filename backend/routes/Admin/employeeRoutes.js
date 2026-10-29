
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const adminMiddleware = require("../../middleware/adminMiddleware");

const {
    getEmployees,
    getEmployeeById,
    getScheduleEmployees,
    createEmployee
} = require("../../controllers/Admin/employeeController");

// Employees available for work scheduling
router.get("/schedule-employees", authMiddleware, getScheduleEmployees);

// Create employee - Admin only
router.post("/", authMiddleware, adminMiddleware, createEmployee);

// Get all employees
router.get("/", authMiddleware, getEmployees);

// Get employee by ID
router.get("/:id", authMiddleware, getEmployeeById);

module.exports = router;
