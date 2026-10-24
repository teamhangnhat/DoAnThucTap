
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
    getEmployees,
    getEmployeeById,
    getScheduleEmployees
} = require("../../controllers/Admin/employeeController");

// Get employees available for work scheduling
router.get("/schedule-employees", authMiddleware, getScheduleEmployees);

// Get all employees
router.get("/", getEmployees);

// Get employee by ID
router.get("/:id", getEmployeeById);

module.exports = router;
