const sql = require("mssql");

const {

    getPool

} = require("../../config/db");


// =====================================================
// GET REVENUE SUMMARY
// =====================================================

const getRevenueSummary = async (

    req,

    res

) => {


    try {


        const pool =

            await getPool();


        const result =

            await pool.request().query(`

                SELECT

                    COUNT(*) AS total_orders,

                    ISNULL(

                        SUM(total_amount),

                        0

                    ) AS total_revenue,


                    ISNULL(

                        AVG(total_amount),

                        0

                    ) AS average_order_value


                FROM orders


                WHERE status = 'Completed'

            `);


        res.json(

            result.recordset[0]

        );

    }


    catch (error) {


        console.error(

            "Get revenue summary error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load revenue summary",

            error:

                error.message

        });

    }

};



// =====================================================
// REVENUE BY DAY
// =====================================================

const getRevenueByDay = async (

    req,

    res

) => {


    try {


        const pool =

            await getPool();


        const result =

            await pool.request().query(`

                SELECT

                    CAST(

                        order_date

                        AS DATE

                    ) AS revenue_date,


                    COUNT(*) AS total_orders,


                    SUM(total_amount)

                        AS revenue


                FROM orders


                WHERE status = 'Completed'


                GROUP BY

                    CAST(

                        order_date

                        AS DATE

                    )


                ORDER BY

                    revenue_date ASC

            `);


        res.json(

            result.recordset

        );

    }


    catch (error) {


        console.error(

            "Get revenue by day error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load daily revenue",

            error:

                error.message

        });

    }

};



// =====================================================
// REVENUE BY MONTH
// =====================================================

const getRevenueByMonth = async (

    req,

    res

) => {


    try {


        const pool =

            await getPool();


        const result =

            await pool.request().query(`

                SELECT

                    YEAR(order_date)

                        AS revenue_year,


                    MONTH(order_date)

                        AS revenue_month,


                    COUNT(*) AS total_orders,


                    SUM(total_amount)

                        AS revenue


                FROM orders


                WHERE status = 'Completed'


                GROUP BY

                    YEAR(order_date),

                    MONTH(order_date)


                ORDER BY

                    revenue_year ASC,

                    revenue_month ASC

            `);


        res.json(

            result.recordset

        );

    }


    catch (error) {


        console.error(

            "Get revenue by month error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load monthly revenue",

            error:

                error.message

        });

    }

};



module.exports = {


    getRevenueSummary,


    getRevenueByDay,


    getRevenueByMonth

};