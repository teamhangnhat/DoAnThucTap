const {
    sql,
    config
} = require("../../config/db");


// =====================================================
// GET ALL ADMIN ORDERS
// =====================================================

const getAdminOrders = async (req, res) => {

    try {

        const pool = await sql.connect(config);


        const result = await pool

            .request()

            .query(`

                SELECT

                    o.id,

                    o.customer_id,

                    u.full_name,

                    u.email,

                    u.phone,

                    o.total_amount,

                    o.status,

                    o.order_date,

                    o.address_id,

                    o.shipping_fee,

                    o.discount_amount,

                    o.payment_method,

                    o.payment_status

                FROM orders o

                LEFT JOIN users u

                    ON o.customer_id = u.id

                ORDER BY

                    o.order_date DESC

            `);


        res.status(200).json(

            result.recordset

        );

    }


    catch (error) {

        console.error(

            "Get admin orders error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load orders",

            error:

                error.message

        });

    }

};



// =====================================================
// GET ORDER DETAIL
// =====================================================

const getAdminOrderById = async (

    req,

    res

) => {

    try {

        const orderId = parseInt(

            req.params.id

        );


        if (isNaN(orderId)) {

            return res.status(400).json({

                message:

                    "Invalid order ID"

            });

        }


        const pool = await sql.connect(config);


        // =============================================
        // ORDER INFORMATION
        // =============================================

        const orderResult = await pool

            .request()

            .input(

                "order_id",

                sql.Int,

                orderId

            )

            .query(`

                SELECT

                    o.id,

                    o.customer_id,

                    u.full_name,

                    u.email,

                    u.phone,

                    o.total_amount,

                    o.status,

                    o.order_date,

                    o.address_id,

                    o.shipping_fee,

                    o.discount_amount,

                    o.payment_method,

                    o.payment_status

                FROM orders o

                LEFT JOIN users u

                    ON o.customer_id = u.id

                WHERE o.id = @order_id

            `);


        if (

            orderResult.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Order not found"

            });

        }


        // =============================================
        // ORDER ITEMS
        // =============================================

        const itemsResult = await pool

            .request()

            .input(

                "order_id",

                sql.Int,

                orderId

            )

            .query(`

                SELECT

                    oi.order_id,

                    oi.product_id,

                    p.product_name,

                    p.image_url,

                    oi.quantity,

                    oi.unit_price,

                    oi.size,

                    oi.color_id

                FROM order_items oi

                LEFT JOIN products p

                    ON oi.product_id = p.id

                WHERE oi.order_id = @order_id

            `);


        res.status(200).json({

            order:

                orderResult.recordset[0],

            items:

                itemsResult.recordset

        });

    }


    catch (error) {

        console.error(

            "Get admin order detail error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load order detail",

            error:

                error.message

        });

    }

};



// =====================================================
// UPDATE ORDER STATUS
// =====================================================

const updateOrderStatus = async (

    req,

    res

) => {

    try {

        const orderId = parseInt(

            req.params.id

        );


        const {

            status

        } = req.body;


        if (isNaN(orderId)) {

            return res.status(400).json({

                message:

                    "Invalid order ID"

            });

        }


        const allowedStatuses = [

            "Pending",

            "Processing",

            "Shipping",

            "Completed",

            "Cancelled"

        ];


        if (

            !allowedStatuses.includes(

                status

            )

        ) {

            return res.status(400).json({

                message:

                    "Invalid order status"

            });

        }


        const pool = await sql.connect(config);


        const result = await pool

            .request()

            .input(

                "order_id",

                sql.Int,

                orderId

            )

            .input(

                "status",

                sql.NVarChar(50),

                status

            )

            .query(`

                UPDATE orders

                SET

                    status = @status

                WHERE id = @order_id

            `);


        if (

            result.rowsAffected[0] === 0

        ) {

            return res.status(404).json({

                message:

                    "Order not found"

            });

        }


        res.status(200).json({

            message:

                "Order status updated successfully"

        });

    }


    catch (error) {

        console.error(

            "Update order status error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to update order status",

            error:

                error.message

        });

    }

};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getAdminOrders,

    getAdminOrderById,

    updateOrderStatus

};