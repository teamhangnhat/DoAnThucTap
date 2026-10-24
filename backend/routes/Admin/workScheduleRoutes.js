
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
    authorizeScheduleList,
    authorizeScheduleById,
    authorizeScheduleCreation,
    authorizeScheduleUpdate,
    authorizeScheduleManagement
} = require("../../middleware/workSchedulePermission");

const {
    getWorkSchedules,
    getWorkScheduleById,
    createWorkSchedule,
    updateWorkSchedule,
    cancelWorkSchedule,
    deleteWorkSchedule
} = require("../../controllers/Admin/workScheduleController");

// List schedules allowed for the logged-in user.
router.get(
    "/",
    authMiddleware,
    authorizeScheduleList,
    getWorkSchedules
);

// View one schedule.
router.get(
    "/:id",
    authMiddleware,
    authorizeScheduleById,
    getWorkScheduleById
);

// Management creates schedules for Employees.
router.post(
    "/",
    authMiddleware,
    authorizeScheduleCreation,
    createWorkSchedule
);

// Management updates Employee schedules.
router.put(
    "/:id",
    authMiddleware,
    authorizeScheduleUpdate,
    updateWorkSchedule
);

// Management cancels Employee schedules.
router.patch(
    "/:id/cancel",
    authMiddleware,
    authorizeScheduleManagement,
    cancelWorkSchedule
);

// Management deletes Employee schedules.
router.delete(
    "/:id",
    authMiddleware,
    authorizeScheduleManagement,
    deleteWorkSchedule
);

module.exports = router;
