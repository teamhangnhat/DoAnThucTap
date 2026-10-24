const { getPool } = require("../../config/db");
const sql = require("mssql");

// GET: Lấy lịch sử lương của một nhân viên
const getEmployeeSalaries = async (req, res) => {
    try {
        const employeeId = Number(req.params.employeeId);

        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(400).json({
                message: "Invalid employee ID."
            });
        }

        const pool = await getPool();

        // Chỉ lấy lương của tài khoản nhân viên hợp lệ
        const employee = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .query(`
                SELECT u.id
                FROM users u
                INNER JOIN employee_profiles ep
                    ON ep.user_id = u.id
                WHERE u.id = @employeeId
                  AND u.role = 'EMPLOYEE'
            `);

        if (employee.recordset.length === 0) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        const result = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .query(`
                SELECT
                    id,
                    employee_id,
                    salary_month,
                    salary_year,
                    base_salary,
                    bonus,
                    deduction,
                    total_salary,
                    salary_type
                FROM dbo.salaries
                WHERE employee_id = @employeeId
                ORDER BY salary_year DESC, salary_month DESC, id DESC
            `);

        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("GET EMPLOYEE SALARIES ERROR:", error);

        return res.status(500).json({
            message: "Failed to load employee salaries."
        });
    }
};

// POST: Thêm một kỳ lương mới
const createEmployeeSalary = async (req, res) => {
    try {
        const employeeId = Number(req.params.employeeId);
        const {
            salary_month,
            salary_year,
            base_salary,
            bonus = 0,
            deduction = 0,
            salary_type = "MONTHLY"
        } = req.body;

        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(400).json({
                message: "Invalid employee ID."
            });
        }

        if (
            !Number.isInteger(Number(salary_month)) ||
            Number(salary_month) < 1 ||
            Number(salary_month) > 12 ||
            !Number.isInteger(Number(salary_year)) ||
            Number(salary_year) < 2000 ||
            !Number.isFinite(Number(base_salary)) ||
            Number(base_salary) < 0 ||
            !Number.isFinite(Number(bonus)) ||
            Number(bonus) < 0 ||
            !Number.isFinite(Number(deduction)) ||
            Number(deduction) < 0
        ) {
            return res.status(400).json({
                message: "Invalid salary information."
            });
        }

        const allowedTypes = ["MONTHLY", "13TH_MONTH"];

        if (!allowedTypes.includes(salary_type)) {
            return res.status(400).json({
                message: "Invalid salary type."
            });
        }

        // Lương tháng 13 không dùng chung với kỳ lương thường.
        // Quy ước lưu tháng 12 cho bản ghi lương tháng 13.
        const month = salary_type === "13TH_MONTH"
            ? 12
            : Number(salary_month);

        const year = Number(salary_year);
        const base = Number(base_salary);
        const bonusAmount = Number(bonus);
        const deductionAmount = Number(deduction);

        const totalSalary =
            base + bonusAmount - deductionAmount;

        if (totalSalary < 0) {
            return res.status(400).json({
                message: "Total salary cannot be negative."
            });
        }

        const pool = await getPool();

        const employee = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .query(`
                SELECT u.id
                FROM users u
                INNER JOIN employee_profiles ep
                    ON ep.user_id = u.id
                WHERE u.id = @employeeId
                  AND u.role = 'EMPLOYEE'
            `);

        if (employee.recordset.length === 0) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        const existing = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .input("month", sql.Int, month)
            .input("year", sql.Int, year)
            .input("salaryType", sql.VarChar(30), salary_type)
            .query(`
                SELECT id
                FROM dbo.salaries
                WHERE employee_id = @employeeId
                  AND salary_month = @month
                  AND salary_year = @year
                  AND salary_type = @salaryType
            `);

        if (existing.recordset.length > 0) {
            return res.status(409).json({
                message: "A salary record already exists for this period."
            });
        }

        const result = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .input("month", sql.Int, month)
            .input("year", sql.Int, year)
            .input("baseSalary", sql.Decimal(18, 2), base)
            .input("bonus", sql.Decimal(18, 2), bonusAmount)
            .input("deduction", sql.Decimal(18, 2), deductionAmount)
            .input("totalSalary", sql.Decimal(18, 2), totalSalary)
            .input("salaryType", sql.VarChar(30), salary_type)
            .query(`
                INSERT INTO dbo.salaries (
                    employee_id,
                    salary_month,
                    salary_year,
                    base_salary,
                    bonus,
                    deduction,
                    total_salary,
                    salary_type
                )
                OUTPUT INSERTED.*
                VALUES (
                    @employeeId,
                    @month,
                    @year,
                    @baseSalary,
                    @bonus,
                    @deduction,
                    @totalSalary,
                    @salaryType
                )
            `);

        return res.status(201).json({
            message: "Salary created successfully.",
            salary: result.recordset[0]
        });
    } catch (error) {
        console.error("CREATE EMPLOYEE SALARY ERROR:", error);

        return res.status(500).json({
            message: "Failed to create employee salary."
        });
    }
};
console.log("Salary controller exports:", {
    getEmployeeSalaries: typeof getEmployeeSalaries,
    createEmployeeSalary: typeof createEmployeeSalary
});
module.exports = {
    getEmployeeSalaries,
    createEmployeeSalary
};