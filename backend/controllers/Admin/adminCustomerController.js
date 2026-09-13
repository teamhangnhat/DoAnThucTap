const { sql, getPool } = require("../../config/db");


// =====================================================
// GET ALL CUSTOMERS
// =====================================================

const getCustomers = async (req, res) => {

    try {

        const pool = await getPool();

        const result = await pool
            .request()
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

                WHERE role = 'CUSTOMER'

                ORDER BY created_at DESC

            `);

        res.status(200).json(result.recordset);

    }

    catch (error) {

        console.error(
            "Get customers error:",
            error
        );

        res.status(500).json({

            message: "Failed to load customers",

            error: error.message

        });

    }

};


// =====================================================
// GET CUSTOMER BY ID
// =====================================================

const getCustomerById = async (req, res) => {

    try {

        const { id } = req.params;

        const pool = await getPool();

        const result = await pool

            .request()

            .input(
                "id",
                sql.Int,
                id
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

                AND role = 'CUSTOMER'

            `);


        if (
            result.recordset.length === 0
        ) {

            return res.status(404).json({

                message: "Customer not found"

            });

        }


        res.status(200).json(

            result.recordset[0]

        );

    }

    catch (error) {

        console.error(

            "Get customer by id error:",

            error

        );

        res.status(500).json({

            message: "Failed to load customer",

            error: error.message

        });

    }

};


// =====================================================
// UPDATE CUSTOMER STATUS
// ACTIVE / LOCKED / INACTIVE
// =====================================================

const updateCustomerStatus = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const { status } = req.body;


        const allowedStatuses = [

            "ACTIVE",

            "LOCKED",

            "INACTIVE"

        ];


        if (

            !allowedStatuses.includes(status)

        ) {

            return res.status(400).json({

                message: "Invalid status"

            });

        }


        const pool = await getPool();


        const result = await pool

            .request()

            .input(

                "id",

                sql.Int,

                id

            )

            .input(

                "status",

                sql.VarChar(20),

                status

            )

            .query(`

                UPDATE users

                SET status = @status

                WHERE id = @id

                AND role = 'CUSTOMER';


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

                AND role = 'CUSTOMER';

            `);


        if (

            result.recordsets[1].length === 0

        ) {

            return res.status(404).json({

                message: "Customer not found"

            });

        }


        res.status(200).json({

            message:

                "Customer status updated successfully",

            customer:

                result.recordsets[1][0]

        });

    }

    catch (error) {

        console.error(

            "Update customer status error:",

            error

        );

        res.status(500).json({

            message:

                "Failed to update customer status",

            error:

                error.message

        });

    }

};


// =====================================================
// DELETE CUSTOMER
// =====================================================

const deleteCustomer = async (

    req,

    res

) => {

    const transaction = new sql.Transaction();


    try {

        const { id } = req.params;


        const pool = await getPool();


        // =============================================
        // CHECK CUSTOMER EXISTS
        // =============================================

        const customer = await pool

            .request()

            .input(

                "id",

                sql.Int,

                id

            )

            .query(`

                SELECT id

                FROM users

                WHERE id = @id

                AND role = 'CUSTOMER'

            `);


        if (

            customer.recordset.length === 0

        ) {

            return res.status(404).json({

                message: "Customer not found"

            });

        }


        // =============================================
        // START TRANSACTION
        // =============================================

        await transaction.begin(pool);


        // =============================================
        // 1. DELETE CART ITEMS
        // =============================================

        await new sql.Request(transaction)

            .input(

                "customer_id",

                sql.Int,

                id

            )

            .query(`

                DELETE FROM cart_items

                WHERE cart_id IN (

                    SELECT id

                    FROM carts

                    WHERE customer_id = @customer_id

                )

            `);


        // =============================================
        // 2. DELETE CARTS
        // =============================================

        await new sql.Request(transaction)

            .input(

                "customer_id",

                sql.Int,

                id

            )

            .query(`

                DELETE FROM carts

                WHERE customer_id = @customer_id

            `);


        // =============================================
        // 3. DELETE ADDRESSES
        // =============================================

        await new sql.Request(transaction)

            .input(

                "customer_id",

                sql.Int,

                id

            )

            .query(`

                DELETE FROM addresses

                WHERE customer_id = @customer_id

            `);


        // =============================================
        // 4. DELETE ORDER DETAILS
        // =============================================

        await new sql.Request(transaction)

            .input(

                "customer_id",

                sql.Int,

                id

            )

            .query(`

                DELETE FROM order_details

                WHERE order_id IN (

                    SELECT id

                    FROM orders

                    WHERE customer_id = @customer_id

                )

            `);


        // =============================================
        // 5. DELETE ORDERS
        // =============================================

        await new sql.Request(transaction)

            .input(

                "customer_id",

                sql.Int,

                id

            )

            .query(`

                DELETE FROM orders

                WHERE customer_id = @customer_id

            `);


        // =============================================
        // 6. DELETE CUSTOMER
        // =============================================

        const result = await new sql.Request(

            transaction

        )

            .input(

                "id",

                sql.Int,

                id

            )

            .query(`

                DELETE FROM users

                WHERE id = @id

                AND role = 'CUSTOMER'

            `);


        if (

            result.rowsAffected[0] === 0

        ) {

            await transaction.rollback();


            return res.status(404).json({

                message: "Customer not found"

            });

        }


        // =============================================
        // COMMIT
        // =============================================

        await transaction.commit();


        res.status(200).json({

            message:

                "Customer deleted successfully"

        });

    }

    catch (error) {

        console.error(

            "Delete customer error:",

            error

        );


        try {

            await transaction.rollback();

        }

        catch (rollbackError) {

            console.error(

                "Rollback error:",

                rollbackError

            );

        }


        res.status(500).json({

            message:

                "Failed to delete customer",

            error:

                error.message

        });

    }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getCustomers,

    getCustomerById,

    updateCustomerStatus,

    deleteCustomer

};