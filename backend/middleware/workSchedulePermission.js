
const { getPool, sql } = require("../config/db");

// Get the logged-in user's account and employee profile.
const getUserInfo = async (userId) => {
    const pool = await getPool();

    const result = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT
                u.id,
                UPPER(LTRIM(RTRIM(u.role))) AS role,
                ep.department,
                ep.employee_code
            FROM dbo.users u
            LEFT JOIN dbo.employee_profiles ep
                ON ep.user_id = u.id
            WHERE u.id = @userId
        `);

    if (result.recordset.length === 0) {
        return null;
    }

    const user = result.recordset[0];

    return {
        ...user,
        role: user.role || "",
        department: (user.department || "").trim().toUpperCase()
    };
};

const isAdmin = (user) =>
    user?.role === "ADMIN";

const isManagement = (user) =>
    user?.role === "MANAGEMENT" ||
    user?.department === "MANAGEMENT";

// A staff member must have an employee profile and must not
// belong to the Management department or have the Management role.
const isRegularEmployee = (user) =>
    Boolean(user?.employee_code) &&
    user.role !== "ADMIN" &&
    user.role !== "MANAGEMENT" &&
    user.department !== "MANAGEMENT";

const canManageEmployeeSchedule = async (
    currentUserId,
    targetEmployeeId
) => {
    const currentUser = await getUserInfo(currentUserId);
    const targetUser = await getUserInfo(targetEmployeeId);

    if (!currentUser || !targetUser) {
        return false;
    }

    // Admin chỉ quản lý lịch của Management.
    if (isAdmin(currentUser)) {
        return isManagement(targetUser);
    }

    // Management chỉ quản lý lịch của Employee thông thường.
    if (isManagement(currentUser)) {
        return isRegularEmployee(targetUser);
    }

    return false;
};

// Allow the current user to view a schedule for a specific employee.
const canViewEmployeeSchedule = async (
    currentUserId,
    targetEmployeeId
) => {
    const currentUser = await getUserInfo(currentUserId);
    const targetUser = await getUserInfo(targetEmployeeId);

    if (!currentUser || !targetUser) {
        return false;
    }

    // Employees can only view their own schedules.
    if (Number(currentUser.id) === Number(targetEmployeeId)) {
        return true;
    }

    // Admin can view Management schedules only.
    if (isAdmin(currentUser)) {
        return isManagement(targetUser);
    }

    // Management can view regular employee schedules.
    if (isManagement(currentUser)) {
        return isRegularEmployee(targetUser);
    }

    return false;
};

// Check whether the current user may view a particular schedule.
const authorizeScheduleById = async (req, res, next) => {
    try {
        const scheduleId = Number(req.params.id);

        if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
            return res.status(400).json({
                message: "Invalid schedule ID."
            });
        }

        const pool = await getPool();

        const result = await pool.request()
            .input("id", sql.Int, scheduleId)
            .query(`
                SELECT *
                FROM dbo.work_schedules
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Work schedule not found."
            });
        }

        const schedule = result.recordset[0];

        const allowed = await canViewEmployeeSchedule(
            req.user.id,
            schedule.employee_id
        );

        if (!allowed) {
            return res.status(403).json({
                message: "You are not allowed to access this schedule."
            });
        }

        req.existingSchedule = schedule;
        next();
    } catch (error) {
        console.error("SCHEDULE ACCESS ERROR:", error);

        return res.status(500).json({
            message: "Failed to check schedule permissions."
        });
    }
};

const authorizeScheduleList = async (req, res, next) => {
    try {
        const currentUser = await getUserInfo(req.user.id);

        if (!currentUser) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        const pool = await getPool();
        let result;

        // Admin chỉ xem lịch của Management.
        if (isAdmin(currentUser)) {
            result = await pool.request().query(`
                SELECT DISTINCT u.id
                FROM dbo.users u
                INNER JOIN dbo.employee_profiles ep
                    ON ep.user_id = u.id
                WHERE UPPER(LTRIM(RTRIM(u.role))) = 'MANAGEMENT'
                   OR UPPER(LTRIM(RTRIM(ISNULL(ep.department, '')))) = 'MANAGEMENT'
            `);
        }
        // Management chỉ xem lịch của Employee thông thường.
        else if (isManagement(currentUser)) {
            result = await pool.request().query(`
                SELECT DISTINCT u.id
                FROM dbo.users u
                INNER JOIN dbo.employee_profiles ep
                    ON ep.user_id = u.id
                WHERE UPPER(LTRIM(RTRIM(ISNULL(u.role, '')))) <> 'ADMIN'
                  AND UPPER(LTRIM(RTRIM(ISNULL(u.role, '')))) <> 'MANAGEMENT'
                  AND UPPER(LTRIM(RTRIM(ISNULL(ep.department, '')))) <> 'MANAGEMENT'
                  AND ep.employee_code IS NOT NULL
                  AND LTRIM(RTRIM(ep.employee_code)) <> ''
            `);
        }
        // Employee chỉ xem lịch của chính mình.
        else {
            req.scheduleEmployeeIds = [Number(currentUser.id)];
            return next();
        }

        req.scheduleEmployeeIds = result.recordset.map(
            (row) => Number(row.id)
        );

        return next();
    } catch (error) {
        console.error("SCHEDULE LIST PERMISSION ERROR:", error);

        return res.status(500).json({
            message: "Failed to check schedule permissions."
        });
    }
};

const authorizeScheduleCreation = async (req, res, next) => {
    try {
        const employeeId = Number(req.body.employee_id);

        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(400).json({
                message: "A valid employee_id is required."
            });
        }

        const allowed = await canManageEmployeeSchedule(
            req.user.id,
            employeeId
        );

        if (!allowed) {
            return res.status(403).json({
                message:
                    "You are not allowed to create a schedule for this employee."
            });
        }

        return next();
    } catch (error) {
        console.error("SCHEDULE CREATE PERMISSION ERROR:", error);

        return res.status(500).json({
            message: "Failed to check schedule creation permissions."
        });
    }
};


// Only Management can update a schedule, including moving it to
// another regular employee.
const authorizeScheduleUpdate = async (req, res, next) => {
    try {
        const scheduleId = Number(req.params.id);
        const newEmployeeId = Number(req.body.employee_id);

        if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
            return res.status(400).json({
                message: "Invalid schedule ID."
            });
        }

        if (!Number.isInteger(newEmployeeId) || newEmployeeId <= 0) {
            return res.status(400).json({
                message: "A valid employee_id is required."
            });
        }

        const pool = await getPool();

        const result = await pool.request()
            .input("id", sql.Int, scheduleId)
            .query(`
                SELECT *
                FROM dbo.work_schedules
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Work schedule not found."
            });
        }

        const existingSchedule = result.recordset[0];

        const canManageOld = await canManageEmployeeSchedule(
            req.user.id,
            existingSchedule.employee_id
        );

        const canManageNew = await canManageEmployeeSchedule(
            req.user.id,
            newEmployeeId
        );

        if (!canManageOld || !canManageNew) {
            return res.status(403).json({
                message: "You are not allowed to update this schedule."
            });
        }

        req.existingSchedule = existingSchedule;
        next();
    } catch (error) {
        console.error("SCHEDULE UPDATE PERMISSION ERROR:", error);

        return res.status(500).json({
            message: "Failed to check schedule update permissions."
        });
    }
};

// Separate write permission: Management can cancel or delete
// schedules belonging to regular employees.
const authorizeScheduleManagement = async (req, res, next) => {
    try {
        const scheduleId = Number(req.params.id);

        if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
            return res.status(400).json({
                message: "Invalid schedule ID."
            });
        }

        const pool = await getPool();

        const result = await pool.request()
            .input("id", sql.Int, scheduleId)
            .query(`
                SELECT *
                FROM dbo.work_schedules
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Work schedule not found."
            });
        }

        const schedule = result.recordset[0];

        const allowed = await canManageEmployeeSchedule(
            req.user.id,
            schedule.employee_id
        );

        if (!allowed) {
            return res.status(403).json({
                message: "Only Management can change employee schedules."
            });
        }

        req.existingSchedule = schedule;
        next();
    } catch (error) {
        console.error("SCHEDULE MANAGEMENT PERMISSION ERROR:", error);

        return res.status(500).json({
            message: "Failed to check schedule permissions."
        });
    }
};

module.exports = {
    getUserInfo,
    isAdmin,
    isManagement,
    isRegularEmployee,
    canManageEmployeeSchedule,
    canViewEmployeeSchedule,
    authorizeScheduleList,
    authorizeScheduleById,
    authorizeScheduleCreation,
    authorizeScheduleUpdate,
    authorizeScheduleManagement
};
