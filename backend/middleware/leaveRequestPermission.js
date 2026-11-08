
const {
    getUserInfo,
    isAdmin,
    isManagement,
    isRegularEmployee
} = require("./workSchedulePermission");

// Check whether the logged-in user can submit a leave request.
const authorizeLeaveRequestCreation = async (req, res, next) => {
    try {
        const user = await getUserInfo(req.user.id);

        if (!user) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        if (!isRegularEmployee(user) && !isManagement(user)) {
            return res.status(403).json({
                message: "You are not allowed to submit leave requests."
            });
        }

        req.leaveRequestUser = user;
        return next();
    } catch (error) {
        console.error("LEAVE REQUEST CREATE PERMISSION ERROR:", error);

        return res.status(500).json({
            message: "Failed to check leave request permissions."
        });
    }
};

// Check whether the logged-in user can review a leave request.
const authorizeLeaveRequestReview = async (req, res, next) => {
    try {
        const currentUser = await getUserInfo(req.user.id);

        if (!currentUser) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        if (!isAdmin(currentUser) && !isManagement(currentUser)) {
            return res.status(403).json({
                message: "You are not allowed to review leave requests."
            });
        }

        req.leaveRequestUser = currentUser;
        return next();
    } catch (error) {
        console.error("LEAVE REQUEST REVIEW PERMISSION ERROR:", error);

        return res.status(500).json({
            message: "Failed to check leave request permissions."
        });
    }
};

module.exports = {
    authorizeLeaveRequestCreation,
    authorizeLeaveRequestReview
};
