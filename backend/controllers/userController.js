const { sql, config } = require("../config/db");

const bcrypt = require("bcryptjs");


// =====================================================
// GET PROFILE
// =====================================================

const getProfile = async (req, res) => {

    try {

        const {

            id

        } = req.params;


        const pool =

            await sql.connect(config);


        const result =

            await pool

                .request()

                .input(

                    "id",

                    sql.Int,

                    Number(id)

                )

                .query(`

                    SELECT

                        id,

                        full_name,

                        email,

                        phone,

                        address,

                        role,

                        status,

                        created_at

                    FROM users

                    WHERE id = @id

                `);


        if (

            result.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Không tìm thấy người dùng."

            });

        }


        return res.status(200).json(

            result.recordset[0]

        );

    }


    catch (err) {

        console.error(

            "GET PROFILE ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Không thể lấy thông tin cá nhân.",

            error:

                err.message

        });

    }

};



// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {

    try {

        const {

            id

        } = req.params;


        const {

            full_name,

            phone,

            address

        } = req.body;


        // =============================================
        // VALIDATE
        // =============================================

        if (

            !full_name ||

            !phone ||

            !address

        ) {

            return res.status(400).json({

                message:

                    "Họ tên, số điện thoại và địa chỉ không được để trống."

            });

        }


        const pool =

            await sql.connect(config);


        // =============================================
        // CHECK USER
        // =============================================

        const userResult =

            await pool

                .request()

                .input(

                    "id",

                    sql.Int,

                    Number(id)

                )

                .query(`

                    SELECT

                        id

                    FROM users

                    WHERE id = @id

                `);


        if (

            userResult.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Người dùng không tồn tại."

            });

        }


        // =============================================
        // UPDATE SQL
        // =============================================

        await pool

            .request()

            .input(

                "id",

                sql.Int,

                Number(id)

            )

            .input(

                "full_name",

                sql.NVarChar(255),

                full_name

            )

            .input(

                "phone",

                sql.VarChar(20),

                phone

            )

            .input(

                "address",

                sql.NVarChar(500),

                address

            )

            .query(`

                UPDATE users

                SET

                    full_name = @full_name,

                    phone = @phone,

                    address = @address

                WHERE id = @id

            `);


        return res.status(200).json({

            message:

                "Cập nhật thông tin thành công."

        });

    }


    catch (err) {

        console.error(

            "UPDATE PROFILE ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Không thể cập nhật thông tin cá nhân.",

            error:

                err.message

        });

    }

};



// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {

    try {

        const {

            id

        } = req.params;


        const {

            old_password,

            new_password

        } = req.body;


        // =============================================
        // VALIDATE
        // =============================================

        if (

            !old_password ||

            !new_password

        ) {

            return res.status(400).json({

                message:

                    "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới."

            });

        }


        if (

            new_password.length < 6

        ) {

            return res.status(400).json({

                message:

                    "Mật khẩu mới phải có ít nhất 6 ký tự."

            });

        }


        const pool =

            await sql.connect(config);


        // =============================================
        // GET CURRENT PASSWORD
        // =============================================

        const result =

            await pool

                .request()

                .input(

                    "id",

                    sql.Int,

                    Number(id)

                )

                .query(`

                    SELECT

                        password

                    FROM users

                    WHERE id = @id

                `);


        if (

            result.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Người dùng không tồn tại."

            });

        }


        const currentPassword =

            result.recordset[0].password;


        // =============================================
        // CHECK OLD PASSWORD
        // =============================================

        const isMatch =

            await bcrypt.compare(

                old_password,

                currentPassword

            );


        if (

            !isMatch

        ) {

            return res.status(400).json({

                message:

                    "Mật khẩu cũ không đúng."

            });

        }


        // =============================================
        // HASH NEW PASSWORD
        // =============================================

        const hashedPassword =

            await bcrypt.hash(

                new_password,

                10

            );


        // =============================================
        // UPDATE PASSWORD
        // =============================================

        await pool

            .request()

            .input(

                "id",

                sql.Int,

                Number(id)

            )

            .input(

                "password",

                sql.VarChar(255),

                hashedPassword

            )

            .query(`

                UPDATE users

                SET

                    password = @password

                WHERE id = @id

            `);


        return res.status(200).json({

            message:

                "Đổi mật khẩu thành công."

        });

    }


    catch (err) {

        console.error(

            "CHANGE PASSWORD ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Không thể đổi mật khẩu.",

            error:

                err.message

        });

    }

};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getProfile,

    updateProfile,

    changePassword

};