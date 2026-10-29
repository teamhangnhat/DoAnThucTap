const { sql, getPool } = require("../../config/db");
// CREATE EMPLOYEE
const bcrypt = require("bcryptjs");



const createEmployee = async (req, res) => {
    const {
        full_name,
        email,
        password,
        phone,
        address,
        hire_date,
        department
    } = req.body;

    let transaction;

    try {
        if (
            !full_name?.trim() ||
            !email?.trim() ||
            !password ||
            !phone?.trim() ||
            !address?.trim()
        ) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        // Validate password
        if (!/^(?=.*[A-Z])(?=.*\d).{5,}$/.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 5 characters long and contain at least 1 uppercase letter and 1 number."
            });
        }

        const pool = await getPool();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Check whether the email already exists
            const emailCheck = await new sql.Request(transaction)
                .input("email", sql.VarChar(255), email.trim())
                .query(`
                    SELECT COUNT(*) AS email_count
                    FROM users
                    WHERE email = @email
                `);

            if (emailCheck.recordset[0].email_count > 0) {
                await transaction.rollback();
                transaction = null;

                return res.status(400).json({
                    message: "This email is already registered."
                });
            }

            // Generate the next employee code
            // Lock the employee_profiles table during code generation
            const codeResult = await new sql.Request(transaction)
                .query(`
                    SELECT
                        ISNULL(
                            MAX(TRY_CAST(SUBSTRING(employee_code, 4, 20) AS INT)),
                            0
                        ) + 1 AS nextNumber
                    FROM employee_profiles WITH (TABLOCKX, HOLDLOCK)
                    WHERE employee_code LIKE 'EMP%'
                `);

            const nextNumber = codeResult.recordset[0].nextNumber;
            const employeeCode =
                `EMP${String(nextNumber).padStart(3, "0")}`;

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user account
            const userResult = await new sql.Request(transaction)
                .input("full_name", sql.NVarChar(255), full_name.trim())
                .input("email", sql.VarChar(255), email.trim())
                .input("password", sql.VarChar(255), hashedPassword)
                .input("phone", sql.VarChar(20), phone.trim())
                .input("address", sql.NVarChar(500), address.trim())
                .query(`
                    INSERT INTO users (
                        full_name,
                        email,
                        password,
                        phone,
                        address,
                        role,
                        status
                    )
                    OUTPUT INSERTED.id
                    VALUES (
                        @full_name,
                        @email,
                        @password,
                        @phone,
                        @address,
                        'EMPLOYEE',
                        'ACTIVE'
                    )
                `);

            const userId = userResult.recordset[0].id;

            // Create employee profile
            await new sql.Request(transaction)
                .input("user_id", sql.Int, userId)
                .input("employee_code", sql.VarChar(20), employeeCode)
                .input("hire_date", sql.Date, hire_date || null)
                .input(
                    "department",
                    sql.NVarChar(200),
                    department?.trim() || null
                )
                .query(`
                    INSERT INTO employee_profiles (
                        user_id,
                        employee_code,
                        hire_date,
                        department
                    )
                    VALUES (
                        @user_id,
                        @employee_code,
                        @hire_date,
                        @department
                    )
                `);

            await transaction.commit();
            transaction = null;

            return res.status(201).json({
                message: "Employee created successfully.",
                employee: {
                    id: userId,
                    full_name: full_name.trim(),
                    email: email.trim(),
                    employee_code: employeeCode,
                    department: department?.trim() || null,
                    hire_date: hire_date || null,
                    role: "EMPLOYEE",
                    status: "ACTIVE"
                }
            });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
                transaction = null;
            }
            throw error;
        }
    } catch (error) {
        console.error("CREATE EMPLOYEE ERROR:", error);

        return res.status(500).json({
            message: "Failed to create employee."
        });
    }
};

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
    getScheduleEmployees,
    createEmployee
};