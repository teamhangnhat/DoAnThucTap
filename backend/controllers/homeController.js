const { sql, config } = require("../config/db");

const getHeroStatistics = async (req, res) => {
    try {

        const pool = await sql.connect(config);

        const statistics = await pool.request().query(`
            SELECT
                total_visitors,
                total_reviews,
                total_customers
            FROM website_statistics
            WHERE id = 1
        `);

        const products = await pool.request().query(`
            SELECT COUNT(*) AS totalProducts
            FROM products
        `);

        res.json({
            visitors:
                statistics.recordset[0].total_visitors,

            reviews:
                statistics.recordset[0].total_reviews,

            customers:
                statistics.recordset[0].total_customers,

            products:
                products.recordset[0].totalProducts
        });

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
const getWebsiteSettings = async (req, res) => {
    try {
        const pool = await sql.connect(config);

        const result = await pool.request().query(`
            SELECT TOP 1
                id,
                logo_url,
                site_name
            FROM website_settings
            ORDER BY id ASC
        `);

        res.json(result.recordset[0]);

    } catch (error) {
        console.error("Get website settings error:", error);

        res.status(500).json({
            message: "Failed to get website settings"
        });
    }
};
// ================= ACTIVE FLASH SALE =================

const getActiveFlashSale = async (req, res) => {

    try {

        const pool = await sql.connect(config);

        const result = await pool.request().query(`

            SELECT TOP 1

                id,
                title,
                description,
                image_url,
                discount_percent,
                start_time,
                end_time,
                button_text,
                is_active

            FROM flash_sales

            WHERE

                is_active = 1

                AND GETDATE() >= start_time

                AND GETDATE() <= end_time

            ORDER BY start_time DESC

        `);

        if (result.recordset.length === 0) {

            return res.json(null);

        }

        res.json(result.recordset[0]);

    }

    catch (error) {

        console.error(
            "Get active flash sale error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to get active flash sale"

        });

    }

};


module.exports = {
    getHeroStatistics,
      getWebsiteSettings,
      getActiveFlashSale
};