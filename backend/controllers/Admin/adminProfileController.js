const { sql, getPool } =
    require("../../config/db");


// =====================================================
// GET CURRENT ADMIN PROFILE
// =====================================================

const getAdminProfile = async (req, res) => {

    try {

        const adminId =
            req.user.id;


        const pool =
            await getPool();


        const result =
            await pool

                .request()

                .input(
                    "id",
                    sql.Int,
                    adminId
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

                    AND role = 'ADMIN'

                `);


        if (
            result.recordset.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Admin profile not found."

            });

        }


        res.json(

            result.recordset[0]

        );

    }

    catch (error) {

        console.error(

            "GET ADMIN PROFILE ERROR:",
            error

        );


        res.status(500).json({

            message:
                "Failed to load admin profile.",

            error:
                error.message

        });

    }

};


// =====================================================
// UPDATE CURRENT ADMIN PROFILE
// =====================================================

const updateAdminProfile = async (req, res) => {

    try {

        const adminId =
            req.user.id;


        const {

            full_name,
            phone,
            address

        } = req.body;


        if (!full_name) {

            return res.status(400).json({

                message:
                    "Full name is required."

            });

        }


        const pool =
            await getPool();


        const result =
            await pool

                .request()

                .input(
                    "id",
                    sql.Int,
                    adminId
                )

                .input(
                    "full_name",
                    sql.NVarChar,
                    full_name.trim()
                )

                .input(
                    "phone",
                    sql.VarChar,
                    phone || null
                )

                .input(
                    "address",
                    sql.NVarChar,
                    address || null
                )

                .query(`

                    UPDATE users

                    SET

                        full_name = @full_name,

                        phone = @phone,

                        address = @address

                    WHERE id = @id

                    AND role = 'ADMIN';


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

                    AND role = 'ADMIN';

                `);


        if (
            result.recordsets[0].length === 0
        ) {

            return res.status(404).json({

                message:
                    "Admin profile not found."

            });

        }


        res.json({

            message:
                "Admin profile updated successfully.",

            admin:
                result.recordsets[0][0]

        });

    }

    catch (error) {

        console.error(

            "UPDATE ADMIN PROFILE ERROR:",
            error

        );


        res.status(500).json({

            message:
                "Failed to update admin profile.",

            error:
                error.message

        });

    }

};


module.exports = {

    getAdminProfile,
    updateAdminProfile

};