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


// ================= CREATE =================

const createCategory = async (req, res) => {

    res.json({

        message: "Create category"

    });

};


// ================= UPDATE =================

const updateCategory = async (req, res) => {

    res.json({

        message: "Update category"

    });

};


// ================= DELETE =================

const deleteCategory = async (req, res) => {

    res.json({

        message: "Delete category"

    });

};


// ================= EXPORT =================

module.exports = {

    getCategories,

    createCategory,

    updateCategory,

    deleteCategory

};