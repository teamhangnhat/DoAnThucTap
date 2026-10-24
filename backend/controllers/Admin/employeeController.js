const { getPool } = require("../../config/db");

const getEmployees = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request().query(`
            SELECT
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.status,
                ep.employee_code,
                ep.hire_date,
                ep.department
            FROM users u
            INNER JOIN employee_profiles ep
                ON u.id = ep.user_id
            WHERE u.role = 'EMPLOYEE'
            ORDER BY u.id ASC
        `);

        res.status(200).json(result.recordset);

    } catch (error) {

        console.error("GET EMPLOYEES ERROR:", error);

        res.status(500).json({
            message: "Failed to load employees."
        });
    }
};

// GET employee detail
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await getPool();

        const result = await pool.request()
            .input("id", id)
            .query(`
                SELECT
                    u.id,
                    u.full_name,
                    u.email,
                    u.phone,
                    u.address,
                    u.status,
                    u.role,
                    ep.employee_code,
                    ep.hire_date,
                    ep.department
                FROM users u
                INNER JOIN employee_profiles ep
                    ON u.id = ep.user_id
                WHERE u.id = @id
                  AND u.role = 'EMPLOYEE'
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        res.status(200).json(result.recordset[0]);

    } catch (error) {
        console.error("GET EMPLOYEE DETAIL ERROR:", error);

        res.status(500).json({
            message: "Failed to load employee details."
        });
    }
};


const getScheduleEmployees = async (req, res) => {
    try {
        const { getPool } = require("../../config/db");
        const {
            getUserInfo,
            isAdmin,
            isManagement
        } = require("../../middleware/workSchedulePermission");

        const currentUser = await getUserInfo(req.user.id);

        if (!currentUser) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        if (!isAdmin(currentUser) && !isManagement(currentUser)) {
            return res.status(403).json({
                message: "You are not allowed to manage work schedules."
            });
        }

        const pool = await getPool();

        let query = `
            SELECT
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.status,
                u.role,
                ep.employee_code,
                ep.department
            FROM dbo.users u
            INNER JOIN dbo.employee_profiles ep
                ON ep.user_id = u.id
        `;

        if (isAdmin(currentUser)) {
            query += `
                WHERE UPPER(LTRIM(RTRIM(u.role))) = 'MANAGEMENT'
                   OR UPPER(LTRIM(RTRIM(ISNULL(ep.department, '')))) = 'MANAGEMENT'
            `;
        } else {
            query += `
                WHERE UPPER(LTRIM(RTRIM(ISNULL(u.role, '')))) NOT IN ('ADMIN', 'MANAGEMENT')
                  AND UPPER(LTRIM(RTRIM(ISNULL(ep.department, '')))) <> 'MANAGEMENT'
                  AND ep.employee_code IS NOT NULL
                  AND LTRIM(RTRIM(ep.employee_code)) <> ''
            `;
        }

        query += " ORDER BY u.id ASC";

        const result = await pool.request().query(query);

        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("GET SCHEDULE EMPLOYEES ERROR:", error);

        return res.status(500).json({
            message: "Failed to load employees for scheduling."
        });
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
     getScheduleEmployees
};