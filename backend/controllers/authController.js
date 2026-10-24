const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, getPool } = require("../config/db");


// =====================================================
// PASSWORD VALIDATION
// =====================================================

const validatePassword = (password) => {

    const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d).{5,}$/;

    return passwordRegex.test(password);

};


// =====================================================
// REGISTER CUSTOMER
// =====================================================

const register = async (req, res) => {

    try {

        const {

            full_name,
            email,
            password,
            phone,
            address

        } = req.body;


        if (

            !full_name ||
            !email ||
            !password ||
            !phone ||
            !address

        ) {

            return res.status(400).json({

                message:
                    "Please fill in all required fields."

            });

        }


        if (!validatePassword(password)) {

            return res.status(400).json({

                message:
                    "Password must be at least 5 characters long and contain at least 1 uppercase letter and 1 number."

            });

        }


        const pool = await getPool();


        // CHECK EMAIL

        const checkUser = await pool
            .request()
            .input(
                "email",
                sql.VarChar,
                email.trim()
            )
            .query(`

                SELECT id

                FROM users

                WHERE email = @email

            `);


        if (checkUser.recordset.length > 0) {

            return res.status(400).json({

                message:
                    "This email is already registered."

            });

        }


        // HASH PASSWORD

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // INSERT CUSTOMER

        await pool
            .request()

            .input(
                "full_name",
                sql.NVarChar,
                full_name.trim()
            )

            .input(
                "email",
                sql.VarChar,
                email.trim()
            )

            .input(
                "password",
                sql.VarChar,
                hashedPassword
            )

            .input(
                "phone",
                sql.VarChar,
                phone.trim()
            )

            .input(
                "address",
                sql.NVarChar,
                address.trim()
            )

            .query(`

                INSERT INTO users

                (

                    full_name,
                    email,
                    password,
                    phone,
                    address,
                    role,
                    status

                )

                VALUES

                (

                    @full_name,
                    @email,
                    @password,
                    @phone,
                    @address,
                    'CUSTOMER',
                    'ACTIVE'

                )

            `);


        res.status(201).json({

            message:
                "Account created successfully."

        });

    }

    catch (err) {

        console.error(
            "Register error:",
            err
        );


        res.status(500).json({

            message:
                "Registration failed.",

            error:
                err.message

        });

    }

};


// =====================================================
// LOGIN
// CUSTOMER + ADMIN + EMPLOYEE + MANAGER
// =====================================================

const login = async (req, res) => {

    try {

        const {

            email,
            password

        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Please enter your email and password."

            });

        }


        const pool = await getPool();


        const result = await pool
            .request()

            .input(
                "email",
                sql.VarChar,
                email.trim()
            )

            .query(`

               SELECT
    u.id,
    u.full_name,
    u.email,
    u.password,
    u.phone,
    u.address,
    u.role,
    u.status,
    ep.employee_code,
    ep.department
FROM dbo.users u
LEFT JOIN dbo.employee_profiles ep
    ON ep.user_id = u.id
WHERE u.email = @email
            `);


        const user = result.recordset[0];


        if (!user) {

            return res.status(400).json({

                message:
                    "Invalid email or password."

            });

        }


        // CHECK STATUS

       if (
    String(user.status || "").trim().toUpperCase() !== "ACTIVE"
) {

            return res.status(403).json({

                message:
                    "Your account is currently inactive or locked."

            });

        }


        // CHECK PASSWORD

        const isMatch =
            await bcrypt.compare(

                password,
                user.password

            );


        if (!isMatch) {

            return res.status(400).json({

                message:
                    "Invalid email or password."

            });

        }


        // CREATE JWT

       const token = jwt.sign(
    {
        id: user.id,
        role: String(user.role || "").trim().toUpperCase(),
        department: String(user.department || "").trim()
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d"
    }
);


        // REMOVE PASSWORD

        delete user.password;


        res.status(200).json({

            message:
                "Login successful.",

            token,

            user

        });

    }

    catch (err) {

        console.error(
            "Login error:",
            err
        );


        res.status(500).json({

            message:
                "Login failed.",

            error:
                err.message

        });

    }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    register,
    login

};