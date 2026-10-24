
const { getPool, sql } = require("../../config/db");

// Lấy ID tài khoản từ JWT
const getUserId = (req) => {
    const id = Number(req.user?.id);
    return Number.isInteger(id) && id > 0 ? id : null;
};

// Kiểm tra người dùng có quyền Management không
const isManagement = async (pool, userId) => {
    const result = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT TOP 1 u.id
            FROM dbo.users u
            LEFT JOIN dbo.employee_profiles ep
                ON ep.user_id = u.id
            WHERE u.id = @userId
              AND (
                  UPPER(LTRIM(RTRIM(u.role))) = 'MANAGEMENT'
                  OR UPPER(LTRIM(RTRIM(ep.department))) = 'MANAGEMENT'
              )
        `);

    return result.recordset.length > 0;
};

// GET /api/admin/employee-tasks
// Management xem công việc đã giao; nhân viên chỉ xem công việc được giao cho mình
const getEmployeeTasks = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "Invalid user information in token."
            });
        }

        const pool = await getPool();
        const management = await isManagement(pool, userId);

        const request = pool.request();
        let query = `
            SELECT
                t.id,
                t.title,
                t.description,
                t.assigned_to,
                employee.full_name AS employee_name,
                ep.department,
                t.assigned_by,
                manager.full_name AS assigned_by_name,
                t.due_date,
                t.status,
                t.created_at,
                t.updated_at,
                t.completed_at
            FROM dbo.employee_tasks t
            INNER JOIN dbo.users employee
                ON employee.id = t.assigned_to
            INNER JOIN dbo.users manager
                ON manager.id = t.assigned_by
            LEFT JOIN dbo.employee_profiles ep
                ON ep.user_id = employee.id
        `;

        if (management) {
            query += " WHERE t.assigned_by = @userId";
        } else {
            query += " WHERE t.assigned_to = @userId";
        }

        request.input("userId", sql.Int, userId);

        query += " ORDER BY t.created_at DESC";

        const result = await request.query(query);

        return res.json({
            tasks: result.recordset
        });
    } catch (error) {
        console.error("GET EMPLOYEE TASKS ERROR:", error);

        return res.status(500).json({
            message: "Failed to retrieve employee tasks."
        });
    }
};

// POST /api/admin/employee-tasks
// Management giao công việc cho nhân viên
const createEmployeeTask = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "Invalid user information in token."
            });
        }

        const pool = await getPool();

        if (!(await isManagement(pool, userId))) {
            return res.status(403).json({
                message: "Only Management can assign tasks."
            });
        }

        const title =
            typeof req.body.title === "string"
                ? req.body.title.trim()
                : "";

        const description =
            typeof req.body.description === "string"
                ? req.body.description.trim()
                : null;

        const employeeId = Number(req.body.assigned_to);
        const dueDate = req.body.due_date || null;

        if (!title || title.length > 200) {
            return res.status(400).json({
                message: "Title is required and must not exceed 200 characters."
            });
        }

        if (
            !Number.isInteger(employeeId) ||
            employeeId <= 0
        ) {
            return res.status(400).json({
                message: "A valid assigned_to employee ID is required."
            });
        }

        if (description && description.length > 10000) {
            return res.status(400).json({
                message: "Description is too long."
            });
        }

        if (
            dueDate !== null &&
            (
                typeof dueDate !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
                Number.isNaN(Date.parse(`${dueDate}T00:00:00Z`)) ||
                new Date(`${dueDate}T00:00:00Z`)
                    .toISOString().slice(0, 10) !== dueDate
            )
        ) {
            return res.status(400).json({
                message: "due_date must use YYYY-MM-DD format."
            });
        }

        const employeeResult = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .query(`
                SELECT u.id
                FROM dbo.users u
                INNER JOIN dbo.employee_profiles ep
                    ON ep.user_id = u.id
                WHERE u.id = @employeeId
                  AND UPPER(LTRIM(RTRIM(u.role)))
                      IN ('EMPLOYEE', 'MANAGEMENT')
            `);

        if (employeeResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Employee account not found."
            });
        }

        const result = await pool.request()
            .input("title", sql.NVarChar(200), title)
            .input("description", sql.NVarChar(sql.MAX), description)
            .input("assignedTo", sql.Int, employeeId)
            .input("assignedBy", sql.Int, userId)
            .input("dueDate", sql.Date, dueDate)
            .query(`
                INSERT INTO dbo.employee_tasks (
                    title,
                    description,
                    assigned_to,
                    assigned_by,
                    due_date
                )
                OUTPUT INSERTED.*
                VALUES (
                    @title,
                    @description,
                    @assignedTo,
                    @assignedBy,
                    @dueDate
                )
            `);

        return res.status(201).json({
            message: "Task assigned successfully.",
            task: result.recordset[0]
        });
    } catch (error) {
        console.error("CREATE EMPLOYEE TASK ERROR:", error);

        return res.status(500).json({
            message: "Failed to assign employee task."
        });
    }
};

// PATCH /api/admin/employee-tasks/:id/status
// Nhân viên chỉ được cập nhật trạng thái công việc được giao cho mình
const updateEmployeeTaskStatus = async (req, res) => {
    try {
        const userId = getUserId(req);
        const taskId = Number(req.params.id);
        const status = req.body.status;

        if (!userId) {
            return res.status(401).json({
                message: "Invalid user information in token."
            });
        }

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        if (!["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
            return res.status(400).json({
                message: "Invalid task status."
            });
        }

        const pool = await getPool();

        const result = await pool.request()
            .input("id", sql.Int, taskId)
            .input("userId", sql.Int, userId)
            .input("status", sql.VarChar(20), status)
            .query(`
                UPDATE dbo.employee_tasks
                SET
                    status = @status,
                    updated_at = SYSDATETIME(),
                    completed_at = CASE
                        WHEN @status = 'COMPLETED'
                            THEN SYSDATETIME()
                        ELSE NULL
                    END
                OUTPUT INSERTED.*
                WHERE id = @id
                  AND assigned_to = @userId
                  AND status <> 'CANCELLED'
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Task not found or you do not have permission to update it."
            });
        }

        return res.json({
            message: "Task status updated successfully.",
            task: result.recordset[0]
        });
    } catch (error) {
        console.error("UPDATE EMPLOYEE TASK STATUS ERROR:", error);

        return res.status(500).json({
            message: "Failed to update task status."
        });
    }
};

// PATCH /api/admin/employee-tasks/:id/cancel
// Chỉ Management được hủy công việc do mình giao
const cancelEmployeeTask = async (req, res) => {
    try {
        const userId = getUserId(req);
        const taskId = Number(req.params.id);

        if (!userId) {
            return res.status(401).json({
                message: "Invalid user information in token."
            });
        }

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        const pool = await getPool();

        if (!(await isManagement(pool, userId))) {
            return res.status(403).json({
                message: "Only Management can cancel tasks."
            });
        }

        const result = await pool.request()
            .input("id", sql.Int, taskId)
            .input("userId", sql.Int, userId)
            .query(`
                UPDATE dbo.employee_tasks
                SET
                    status = 'CANCELLED',
                    updated_at = SYSDATETIME()
                OUTPUT INSERTED.*
                WHERE id = @id
                  AND assigned_by = @userId
                  AND status <> 'CANCELLED'
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Task not found or it has already been cancelled."
            });
        }

        return res.json({
            message: "Task cancelled successfully.",
            task: result.recordset[0]
        });
    } catch (error) {
        console.error("CANCEL EMPLOYEE TASK ERROR:", error);

        return res.status(500).json({
            message: "Failed to cancel employee task."
        });
    }
};

module.exports = {
    getEmployeeTasks,
    createEmployeeTask,
    updateEmployeeTaskStatus,
    cancelEmployeeTask
};
