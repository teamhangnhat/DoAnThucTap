
const { getPool, sql } = require("../../config/db");
const {
    getUserInfo,
    isAdmin,
    isManagement,
    isRegularEmployee
} = require("../../middleware/workSchedulePermission");

// Submit a leave request.
const createLeaveRequest = async (req, res) => {
    try {
        const user = req.leaveRequestUser;

        const { start_date, end_date, reason } = req.body;

        if (!start_date || !end_date || !reason?.trim()) {
            return res.status(400).json({
                message: "Start date, end date, and reason are required."
            });
        }

       const isValidDate = (value) => {
    if (typeof value !== "string") return false;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) return false;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};

if (
    !isValidDate(start_date) ||
    !isValidDate(end_date) ||
    end_date < start_date
) {
    return res.status(400).json({
        message: "Invalid leave request dates."
    });
}

        const pool = await getPool();

        await pool.request()
            .input("userId", sql.Int, user.id)
            .input("startDate", sql.Date, start_date)
            .input("endDate", sql.Date, end_date)
            .input("reason", sql.NVarChar(sql.MAX), reason.trim())
            .query(`
                INSERT INTO dbo.LeaveRequests (
                    user_id,
                    start_date,
                    end_date,
                    reason
                )
                VALUES (
                    @userId,
                    @startDate,
                    @endDate,
                    @reason
                )
            `);

        return res.status(201).json({
            message: "Leave request submitted successfully."
        });
    } catch (error) {
        console.error("CREATE LEAVE REQUEST ERROR:", error);

        return res.status(500).json({
            message: "Failed to submit leave request."
        });
    }
};

// Get leave requests submitted by the logged-in user.
const getMyLeaveRequests = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input("userId", sql.Int, req.user.id)
            .query(`
                SELECT
                    lr.id,
                    lr.user_id,
                    u.full_name,
                    lr.start_date,
                    lr.end_date,
                    lr.reason,
                    lr.status,
                    lr.reviewed_by,
                    reviewer.full_name AS reviewer_name,
                    lr.review_note,
                    lr.created_at,
                    lr.reviewed_at
                FROM dbo.LeaveRequests lr
                INNER JOIN dbo.users u
                    ON u.id = lr.user_id
                LEFT JOIN dbo.users reviewer
                    ON reviewer.id = lr.reviewed_by
                WHERE lr.user_id = @userId
                ORDER BY lr.created_at DESC
            `);

        return res.status(200).json({
            leaveRequests: result.recordset
        });
    } catch (error) {
        console.error("GET MY LEAVE REQUESTS ERROR:", error);

        return res.status(500).json({
            message: "Failed to retrieve leave requests."
        });
    }
};

// Get requests that the logged-in user is allowed to review.
const getPendingLeaveRequests = async (req, res) => {
    try {
        const currentUser = await getUserInfo(req.user.id);

        if (!currentUser) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        const pool = await getPool();

        const request = pool.request();

        let targetRoleCondition = "";

        if (isAdmin(currentUser)) {
            // Admin reviews Management requests only.
            targetRoleCondition = `
                AND (
                    UPPER(LTRIM(RTRIM(ISNULL(requester.role, '')))) = 'MANAGEMENT'
                    OR UPPER(LTRIM(RTRIM(ISNULL(requesterProfile.department, '')))) = 'MANAGEMENT'
                )
            `;
        } else if (isManagement(currentUser)) {
            // Management reviews regular Employee requests only.
            targetRoleCondition = `
                AND UPPER(LTRIM(RTRIM(ISNULL(requester.role, '')))) = 'EMPLOYEE'
                AND requesterProfile.employee_code IS NOT NULL
                AND LTRIM(RTRIM(requesterProfile.employee_code)) <> ''
                AND UPPER(LTRIM(RTRIM(ISNULL(requesterProfile.department, '')))) <> 'MANAGEMENT'
            `;
        } else {
            return res.status(403).json({
                message: "You are not allowed to view pending leave requests."
            });
        }

        const result = await request.query(`
            SELECT
                lr.id,
                lr.user_id,
                requester.full_name,
                requesterProfile.employee_code,
                requesterProfile.department,
                lr.start_date,
                lr.end_date,
                lr.reason,
                lr.status,
                lr.created_at
            FROM dbo.LeaveRequests lr
            INNER JOIN dbo.users requester
                ON requester.id = lr.user_id
            LEFT JOIN dbo.employee_profiles requesterProfile
                ON requesterProfile.user_id = requester.id
            WHERE lr.status = 'PENDING'
                AND lr.user_id <> ${Number(currentUser.id)}
                ${targetRoleCondition}
            ORDER BY lr.created_at ASC
        `);

        return res.status(200).json({
            leaveRequests: result.recordset
        });
    } catch (error) {
        console.error("GET PENDING LEAVE REQUESTS ERROR:", error);

        return res.status(500).json({
            message: "Failed to retrieve pending leave requests."
        });
    }
};

// Review a leave request.
const reviewLeaveRequest = async (req, res) => {
    try {
        const requestId = Number(req.params.id);
        const { status, review_note } = req.body;

        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                message: "Invalid leave request ID."
            });
        }

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                message: "Status must be APPROVED or REJECTED."
            });
        }

        const pool = await getPool();

        const result = await pool.request()
            .input("requestId", sql.Int, requestId)
            .query(`
                SELECT
                    lr.id,
                    lr.user_id,
                    lr.status,
                    requester.role,
                    requesterProfile.employee_code,
                    requesterProfile.department
                FROM dbo.LeaveRequests lr
                INNER JOIN dbo.users requester
                    ON requester.id = lr.user_id
                LEFT JOIN dbo.employee_profiles requesterProfile
                    ON requesterProfile.user_id = requester.id
                WHERE lr.id = @requestId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Leave request not found."
            });
        }

        const leaveRequest = result.recordset[0];
        const currentUser = await getUserInfo(req.user.id);

        if (!currentUser) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        const requester = {
            role: (leaveRequest.role || "").trim().toUpperCase(),
            employee_code: leaveRequest.employee_code,
            department: (leaveRequest.department || "").trim().toUpperCase()
        };

        let allowed = false;

        if (isAdmin(currentUser)) {
            allowed =
                requester.role === "MANAGEMENT" ||
                requester.department === "MANAGEMENT";
        } else if (isManagement(currentUser)) {
            allowed =
                isRegularEmployee(requester) &&
                requester.role === "EMPLOYEE";
        }

        if (!allowed || Number(leaveRequest.user_id) === Number(req.user.id)) {
            return res.status(403).json({
                message: "You are not allowed to review this leave request."
            });
        }

        if (leaveRequest.status !== "PENDING") {
            return res.status(400).json({
                message: "This leave request has already been reviewed."
            });
        }

        const updateResult = await pool.request()
            .input("requestId", sql.Int, requestId)
            .input("reviewerId", sql.Int, req.user.id)
            .input("status", sql.VarChar(20), status)
            .input("reviewNote", sql.NVarChar(sql.MAX), review_note?.trim() || null)
            .query(`
                UPDATE dbo.LeaveRequests
                SET
                    status = @status,
                    reviewed_by = @reviewerId,
                    review_note = @reviewNote,
                    reviewed_at = GETDATE()
                WHERE id = @requestId
                    AND status = 'PENDING'
            `);

        if (updateResult.rowsAffected[0] === 0) {
            return res.status(409).json({
                message: "This leave request has already been reviewed."
            });
        }

        return res.status(200).json({
            message: `Leave request ${status.toLowerCase()} successfully.`
        });
    } catch (error) {
        console.error("REVIEW LEAVE REQUEST ERROR:", error);

        return res.status(500).json({
            message: "Failed to review leave request."
        });
    }
};

// Get one leave request.
const getLeaveRequestById = async (req, res) => {
    try {
        const requestId = Number(req.params.id);

        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                message: "Invalid leave request ID."
            });
        }

        const pool = await getPool();

        const result = await pool.request()
            .input("requestId", sql.Int, requestId)
            .input("userId", sql.Int, req.user.id)
            .query(`
                SELECT
                    lr.id,
                    lr.user_id,
                    u.full_name,
                    ep.employee_code,
                    ep.department,
                    lr.start_date,
                    lr.end_date,
                    lr.reason,
                    lr.status,
                    lr.reviewed_by,
                    reviewer.full_name AS reviewer_name,
                    lr.review_note,
                    lr.created_at,
                    lr.reviewed_at
                FROM dbo.LeaveRequests lr
                INNER JOIN dbo.users u
                    ON u.id = lr.user_id
                LEFT JOIN dbo.employee_profiles ep
                    ON ep.user_id = u.id
                LEFT JOIN dbo.users reviewer
                    ON reviewer.id = lr.reviewed_by
                WHERE lr.id = @requestId
                    AND lr.user_id = @userId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Leave request not found."
            });
        }

        return res.status(200).json({
            leaveRequest: result.recordset[0]
        });
    } catch (error) {
        console.error("GET LEAVE REQUEST ERROR:", error);

        return res.status(500).json({
            message: "Failed to retrieve leave request."
        });
    }
};

module.exports = {
    createLeaveRequest,
    getMyLeaveRequests,
    getPendingLeaveRequests,
    getLeaveRequestById,
    reviewLeaveRequest
};
