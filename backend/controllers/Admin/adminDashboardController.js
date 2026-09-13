const {
    sql,
    config
} = require("../../config/db");


// =====================================================
// GET ADMIN DASHBOARD
// =====================================================

const getAdminDashboard = async (req, res) => {

    try {

        const pool = await sql.connect(config);


        // =====================================================
        // 1. TOTAL PRODUCTS
        // =====================================================

        const productsResult = await pool.request().query(`

            SELECT

                COUNT(*) AS total_products

            FROM products

            WHERE is_active = 1

        `);


        // =====================================================
        // 2. TOTAL CUSTOMERS
        // =====================================================

        const customersResult = await pool.request().query(`

            SELECT

                COUNT(*) AS total_customers

            FROM users

            WHERE role = 'CUSTOMER'

        `);


        // =====================================================
        // 3. TOTAL ORDERS
        // =====================================================

        const ordersResult = await pool.request().query(`

            SELECT

                COUNT(*) AS total_orders

            FROM orders

        `);


        // =====================================================
        // 4. PENDING ORDERS
        // =====================================================

        const pendingOrdersResult = await pool.request().query(`

            SELECT

                COUNT(*) AS pending_orders

            FROM orders

            WHERE status = 'Pending'

        `);


        // =====================================================
        // 5. COMPLETED ORDERS
        // =====================================================

        const completedOrdersResult = await pool.request().query(`

            SELECT

                COUNT(*) AS completed_orders

            FROM orders

            WHERE status = 'Completed'

        `);


        // =====================================================
        // 6. TOTAL REVENUE
        // Chỉ tính đơn Completed
        // =====================================================

        const revenueResult = await pool.request().query(`

            SELECT

                ISNULL(

                    SUM(total_amount),

                    0

                ) AS total_revenue

            FROM orders

            WHERE status = 'Completed'

        `);


        // =====================================================
        // 7. TOTAL STOCK
        // Lấy từ product_variants
        // =====================================================

        const stockResult = await pool.request().query(`

            SELECT

                ISNULL(

                    SUM(stock),

                    0

                ) AS total_stock

            FROM product_variants

        `);


        // =====================================================
        // 8. RECENT ORDERS
        // =====================================================

        const recentOrdersResult = await pool.request().query(`

            SELECT TOP 10

                o.id,

                o.total_amount,

                o.status,

                o.order_date,

                o.payment_method,

                o.payment_status,

                u.full_name,

                u.email

            FROM orders o

            LEFT JOIN users u

                ON o.customer_id = u.id

            ORDER BY

                o.order_date DESC

        `);


        // =====================================================
        // 9. BEST SELLING PRODUCTS
        // Dùng order_details
        // =====================================================

        const bestSellingResult = await pool.request().query(`

            SELECT TOP 5

                p.id,

                p.product_name,

                p.image_url,

                SUM(od.quantity) AS total_sold,

                SUM(

                    od.quantity *

                    od.unit_price

                ) AS total_revenue

            FROM order_details od

            INNER JOIN products p

                ON od.product_id = p.id

            INNER JOIN orders o

                ON od.order_id = o.id

            WHERE

                o.status = 'Completed'

            GROUP BY

                p.id,

                p.product_name,

                p.image_url

            ORDER BY

                total_sold DESC

        `);


        // =====================================================
        // 10. LOW STOCK PRODUCTS
        // Tổng stock <= 10
        // =====================================================

        const lowStockResult = await pool.request().query(`

            SELECT

                p.id,

                p.product_name,

                p.image_url,

                ISNULL(

                    SUM(pv.stock),

                    0

                ) AS stock

            FROM products p

            LEFT JOIN product_variants pv

                ON p.id = pv.product_id

            WHERE

                p.is_active = 1

            GROUP BY

                p.id,

                p.product_name,

                p.image_url

            HAVING

                ISNULL(

                    SUM(pv.stock),

                    0

                ) <= 10

            ORDER BY

                stock ASC

        `);


        // =====================================================
        // 11. ORDER STATUS SUMMARY
        // =====================================================

        const orderStatusResult = await pool.request().query(`

            SELECT

                status,

                COUNT(*) AS total

            FROM orders

            GROUP BY

                status

        `);


        // =====================================================
        // 12. MONTHLY REVENUE
        // Chỉ tính Completed
        // =====================================================

        const monthlyRevenueResult = await pool.request().query(`

            SELECT

                YEAR(order_date) AS year,

                MONTH(order_date) AS month,

                SUM(total_amount) AS revenue

            FROM orders

            WHERE

                status = 'Completed'

            GROUP BY

                YEAR(order_date),

                MONTH(order_date)

            ORDER BY

                year ASC,

                month ASC

        `);


        // =====================================================
        // RESPONSE
        // =====================================================

        res.status(200).json({

            summary: {

                total_products:

                    productsResult

                        .recordset[0]

                        .total_products,


                total_customers:

                    customersResult

                        .recordset[0]

                        .total_customers,


                total_orders:

                    ordersResult

                        .recordset[0]

                        .total_orders,


                pending_orders:

                    pendingOrdersResult

                        .recordset[0]

                        .pending_orders,


                completed_orders:

                    completedOrdersResult

                        .recordset[0]

                        .completed_orders,


                total_revenue:

                    revenueResult

                        .recordset[0]

                        .total_revenue,


                total_stock:

                    stockResult

                        .recordset[0]

                        .total_stock

            },


            recentOrders:

                recentOrdersResult.recordset,


            bestSellingProducts:

                bestSellingResult.recordset,


            lowStockProducts:

                lowStockResult.recordset,


            orderStatus:

                orderStatusResult.recordset,


            monthlyRevenue:

                monthlyRevenueResult.recordset

        });

    }

    catch (error) {

        console.error(

            "Get admin dashboard error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load dashboard data",

            error:

                error.message

        });

    }

};


module.exports = {

    getAdminDashboard

};