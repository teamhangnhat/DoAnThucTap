
const { getPool, sql } = require("../../config/db");

const validateSchedule = (body) => {
    const {
        employee_id,
        schedule_date,
        start_time,
        end_time,
        status
    } = body;

    if (!Number.isInteger(Number(employee_id)) || Number(employee_id) <= 0) {
        return "A valid employee_id is required.";
    }

    if (
        typeof schedule_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(schedule_date)
    ) {
        return "schedule_date must use YYYY-MM-DD format.";
    }

    const parsedDate = new Date(`${schedule_date}T00:00:00Z`);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== schedule_date
    ) {
        return "Invalid schedule date.";
    }

    const validTime = (value) =>
        typeof value === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);

    if (!validTime(start_time) || !validTime(end_time)) {
        return "Times must use HH:mm or HH:mm:ss format.";
    }

    const toSeconds = (value) => {
        const parts = value.split(":").map(Number);
        return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
    };

    if (toSeconds(end_time) <= toSeconds(start_time)) {
        return "end_time must be later than start_time.";
    }

    if (
        status !== undefined &&
        !["SCHEDULED", "COMPLETED", "CANCELLED"].includes(status)
    ) {
        return "Invalid schedule status.";
    }

    if (body.shift_name != null && String(body.shift_name).length > 50) {
        return "shift_name must not exceed 50 characters.";
    }

    if (body.note != null && String(body.note).length > 500) {
        return "note must not exceed 500 characters.";
    }

    return null;
};

const hasScheduleConflict = async (
    pool,
    employeeId,
    scheduleDate,
    startTime,
    endTime,
    excludeScheduleId = null
) => {
    const request = pool.request()
        .input("employeeId", sql.Int, employeeId)
        .input("scheduleDate", sql.Date, scheduleDate)
        .input("startTime", sql.VarChar(8), startTime)
        .input("endTime", sql.VarChar(8), endTime);

    let query = `
        SELECT TOP 1 id
        FROM dbo.work_schedules
        WHERE employee_id = @employeeId
          AND schedule_date = @scheduleDate
          AND status <> 'CANCELLED'
          AND @startTime < CONVERT(VARCHAR(8), end_time, 108)
          AND @endTime > CONVERT(VARCHAR(8), start_time, 108)
    `;

    if (excludeScheduleId !== null) {
        request.input("excludeId", sql.Int, excludeScheduleId);
        query += " AND id <> @excludeId";
    }

    const result = await request.query(query);
    return result.recordset.length > 0;
};

// GET /api/work-schedules
const getWorkSchedules = async (req, res) => {
    try {
        const pool = await getPool();
        const request = pool.request();

        let query = `
            SELECT
                ws.id,
                ws.employee_id,
                u.full_name AS employee_name,
                ep.employee_code,
                ep.department,
                ws.schedule_date,
                ws.start_time,
                ws.end_time,
                ws.shift_name,
                ws.note,
                ws.created_by,
                creator.full_name AS created_by_name,
                ws.status,
                ws.created_at,
                ws.updated_at
            FROM dbo.work_schedules ws
            INNER JOIN dbo.users u ON u.id = ws.employee_id
            LEFT JOIN dbo.employee_profiles ep ON ep.user_id = u.id
            LEFT JOIN dbo.users creator ON creator.id = ws.created_by
            WHERE 1 = 1
        `;

        const allowedIds = req.scheduleEmployeeIds;

        if (!Array.isArray(allowedIds) || allowedIds.length === 0) {
            return res.json({ schedules: [] });
        }

        const idParameters = allowedIds.map((id, index) => {
            const parameterName = `allowedEmployee${index}`;
            request.input(parameterName, sql.Int, id);
            return `@${parameterName}`;
        });

        query += ` AND ws.employee_id IN (${idParameters.join(", ")})`;

        if (req.query.startDate) {
            request.input("startDate", sql.Date, req.query.startDate);
            query += " AND ws.schedule_date >= @startDate";
        }

        if (req.query.endDate) {
            request.input("endDate", sql.Date, req.query.endDate);
            query += " AND ws.schedule_date <= @endDate";
        }

        if (req.query.employeeId) {
            const employeeId = Number(req.query.employeeId);

            if (!Number.isInteger(employeeId) || employeeId <= 0) {
                return res.status(400).json({
                    message: "Invalid employeeId."
                });
            }

            request.input("employeeId", sql.Int, employeeId);
            query += " AND ws.employee_id = @employeeId";
        }

        query += " ORDER BY ws.schedule_date ASC, ws.start_time ASC";

        const result = await request.query(query);

        return res.json({ schedules: result.recordset });
    } catch (error) {
        console.error("GET WORK SCHEDULES ERROR:", error);
        return res.status(500).json({
            message: "Failed to retrieve work schedules."
        });
    }
};

// GET /api/work-schedules/:id
const getWorkScheduleById = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input("id", sql.Int, Number(req.params.id))
            .query(`
                SELECT
                    ws.*,
                    u.full_name AS employee_name,
                    ep.employee_code,
                    ep.department,
                    creator.full_name AS created_by_name
                FROM dbo.work_schedules ws
                INNER JOIN dbo.users u ON u.id = ws.employee_id
                LEFT JOIN dbo.employee_profiles ep ON ep.user_id = u.id
                LEFT JOIN dbo.users creator ON creator.id = ws.created_by
                WHERE ws.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Work schedule not found."
            });
        }

        return res.json(result.recordset[0]);
    } catch (error) {
        console.error("GET WORK SCHEDULE BY ID ERROR:", error);
        return res.status(500).json({
            message: "Failed to retrieve work schedule."
        });
    }
};

// POST /api/work-schedules
const createWorkSchedule = async (req, res) => {
    try {
        const validationError = validateSchedule(req.body);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const pool = await getPool();
        const employeeId = Number(req.body.employee_id);

        const conflict = await hasScheduleConflict(
            pool,
            employeeId,
            req.body.schedule_date,
            req.body.start_time,
            req.body.end_time
        );

        if (conflict) {
            return res.status(409).json({
                message: "This employee already has an overlapping shift."
            });
        }

        const result = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .input("scheduleDate", sql.Date, req.body.schedule_date)
            .input("startTime", sql.VarChar(8), req.body.start_time)
            .input("endTime", sql.VarChar(8), req.body.end_time)
            .input("shiftName", sql.NVarChar(50), req.body.shift_name || null)
            .input("note", sql.NVarChar(500), req.body.note || null)
            .input("createdBy", sql.Int, Number(req.user.id))
            .query(`
                INSERT INTO dbo.work_schedules (
                    employee_id, schedule_date, start_time, end_time,
                    shift_name, note, created_by
                )
                OUTPUT INSERTED.*
                VALUES (
                    @employeeId, @scheduleDate, @startTime, @endTime,
                    @shiftName, @note, @createdBy
                )
            `);

        return res.status(201).json({
            message: "Work schedule created successfully.",
            schedule: result.recordset[0]
        });
    } catch (error) {
        console.error("CREATE WORK SCHEDULE ERROR:", error);
        return res.status(500).json({
            message: "Failed to create work schedule."
        });
    }
};

// PUT /api/work-schedules/:id
const updateWorkSchedule = async (req, res) => {
    try {
        const scheduleId = Number(req.params.id);
        const validationError = validateSchedule(req.body);

        if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
            return res.status(400).json({
                message: "Invalid schedule ID."
            });
        }

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const pool = await getPool();
        const employeeId = Number(req.body.employee_id);

        const conflict = await hasScheduleConflict(
            pool,
            employeeId,
            req.body.schedule_date,
            req.body.start_time,
            req.body.end_time,
            scheduleId
        );

        if (conflict) {
            return res.status(409).json({
                message: "This employee already has an overlapping shift."
            });
        }

        const result = await pool.request()
            .input("id", sql.Int, scheduleId)
            .input("employeeId", sql.Int, employeeId)
            .input("scheduleDate", sql.Date, req.body.schedule_date)
            .input("startTime", sql.VarChar(8), req.body.start_time)
            .input("endTime", sql.VarChar(8), req.body.end_time)
            .input("shiftName", sql.NVarChar(50), req.body.shift_name || null)
            .input("note", sql.NVarChar(500), req.body.note || null)
            .input("status", sql.VarChar(20), req.body.status || "SCHEDULED")
            .query(`
                UPDATE dbo.work_schedules
                SET employee_id = @employeeId,
                    schedule_date = @scheduleDate,
                    start_time = @startTime,
                    end_time = @endTime,
                    shift_name = @shiftName,
                    note = @note,
                    status = @status,
                    updated_at = SYSDATETIME()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Work schedule not found."
            });
        }

        return res.json({
            message: "Work schedule updated successfully.",
            schedule: result.recordset[0]
        });
    } catch (error) {
        console.error("UPDATE WORK SCHEDULE ERROR:", error);
        return res.status(500).json({
            message: "Failed to update work schedule."
        });
    }
};

// PATCH /api/work-schedules/:id/cancel
const cancelWorkSchedule = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input("id", sql.Int, Number(req.params.id))
            .query(`
                UPDATE dbo.work_schedules
                SET status = 'CANCELLED',
                    updated_at = SYSDATETIME()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Work schedule not found."
            });
        }

        return res.json({
            message: "Work schedule cancelled successfully.",
            schedule: result.recordset[0]
        });
    } catch (error) {
        console.error("CANCEL WORK SCHEDULE ERROR:", error);
        return res.status(500).json({
            message: "Failed to cancel work schedule."
        });
    }
};

// DELETE /api/work-schedules/:id
const deleteWorkSchedule = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input("id", sql.Int, Number(req.params.id))
            .query(`
                DELETE FROM dbo.work_schedules
                OUTPUT DELETED.id
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Work schedule not found."
            });
        }

        return res.json({
            message: "Work schedule deleted successfully."
        });
    } catch (error) {
        console.error("DELETE WORK SCHEDULE ERROR:", error);
        return res.status(500).json({
            message: "Failed to delete work schedule."
        });
    }
};

module.exports = {
    getWorkSchedules,
    getWorkScheduleById,
    createWorkSchedule,
    updateWorkSchedule,
    cancelWorkSchedule,
    deleteWorkSchedule
};
