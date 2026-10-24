
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
    getEmployeeTasks,
    createEmployeeTask,
    updateEmployeeTaskStatus,
    cancelEmployeeTask
} = require("../../controllers/Admin/employeeTaskController");

router.use(authMiddleware);

router.get("/", getEmployeeTasks);
router.post("/", createEmployeeTask);
router.patch("/:id/status", updateEmployeeTaskStatus);
router.patch("/:id/cancel", cancelEmployeeTask);

module.exports = router;
