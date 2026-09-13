const { sql, config } = require("../config/db");


// ================= GET CATEGORIES =================

const getCategories = async (req, res) => {

    try {

        const pool = await sql.connect(config);

        const result = await pool.request().query(`

            SELECT
                c.id,
                c.category_name,
                c.parent_id,

                p.category_name AS parent_name

            FROM categories c

            LEFT JOIN categories p
                ON c.parent_id = p.id

            ORDER BY c.id

        `);

        const categories = result.recordset;

        // Lấy category chính
        const mainCategories = categories
            .filter(category => category.parent_id === null)
            .map(category => ({

                id: category.id,

                category_name: category.category_name,

                subcategories: categories
                    .filter(subcategory =>
                        subcategory.parent_id === category.id
                    )

            }));

        res.json(mainCategories);

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

};


// ================= CREATE CATEGORY =================

const createCategory = async (req, res) => {

    try {

        const {
            category_name,
            parent_id
        } = req.body;

        const pool = await sql.connect(config);

        await pool.request()

            .input(
                "category_name",
                sql.NVarChar,
                category_name
            )

            .input(
                "parent_id",
                sql.Int,
                parent_id || null
            )

            .query(`

                INSERT INTO categories
                (
                    category_name,
                    parent_id
                )

                VALUES
                (
                    @category_name,
                    @parent_id
                )

            `);

        res.status(201).json({

            message: "Category created successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

};


// ================= UPDATE CATEGORY =================

const updateCategory = async (req, res) => {

    try {

        const {
            id
        } = req.params;

        const {
            category_name,
            parent_id
        } = req.body;

        const pool = await sql.connect(config);

        await pool.request()

            .input(
                "id",
                sql.Int,
                id
            )

            .input(
                "category_name",
                sql.NVarChar,
                category_name
            )

            .input(
                "parent_id",
                sql.Int,
                parent_id || null
            )

            .query(`

                UPDATE categories

                SET

                    category_name = @category_name,

                    parent_id = @parent_id

                WHERE id = @id

            `);

        res.json({

            message: "Category updated successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

};


// ================= DELETE CATEGORY =================

const deleteCategory = async (req, res) => {

    try {

        const {
            id
        } = req.params;

        const pool = await sql.connect(config);

        await pool.request()

            .input(
                "id",
                sql.Int,
                id
            )

            .query(`

                DELETE FROM categories

                WHERE id = @id

            `);

        res.json({

            message: "Category deleted successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

};


// ================= EXPORT =================

module.exports = {

    getCategories,

    createCategory,

    updateCategory,

    deleteCategory

};