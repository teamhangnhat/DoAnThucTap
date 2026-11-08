
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
    authorizeLeaveRequestCreation,
    authorizeLeaveRequestReview
} = require("../../middleware/leaveRequestPermission");

const {
    createLeaveRequest,
    getMyLeaveRequests,
    getPendingLeaveRequests,
    getLeaveRequestById,
    reviewLeaveRequest
} = require("../../controllers/Admin/leaveRequestController");

// Submit a leave request.
router.post(
    "/",
    authMiddleware,
    authorizeLeaveRequestCreation,
    createLeaveRequest
);

// Get the logged-in user's leave requests.
router.get(
    "/my",
    authMiddleware,
    getMyLeaveRequests
);

// Get pending requests assigned to the logged-in reviewer.
router.get(
    "/pending",
    authMiddleware,
    authorizeLeaveRequestReview,
    getPendingLeaveRequests
);

// Review a leave request.
router.patch(
    "/:id/review",
    authMiddleware,
    authorizeLeaveRequestReview,
    reviewLeaveRequest
);

// Get one leave request submitted by the logged-in user.
router.get(
    "/:id",
    authMiddleware,
    getLeaveRequestById
);

module.exports = router;
