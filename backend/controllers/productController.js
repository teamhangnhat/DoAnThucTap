const { sql, config } = require("../config/db");


// =====================================================
// GET ALL PRODUCTS
// =====================================================

const getProducts = async (req, res) => {

    try {

        const {

            search,

            category,

            subcategory,

            featured,

            sort,

            sale

        } = req.query;


        const pool = await sql.connect(config);


        let query = `

            SELECT

                p.id,

                p.product_name,

                p.description,

                p.price,

                p.image_url,

                p.brand,

                p.discount_percent,

                p.is_featured,

                p.created_at,

                p.category_id,

                c.category_name,

                c.parent_id,

                ISNULL(

                    (

                        SELECT SUM(pv.stock)

                        FROM product_variants pv

                        WHERE pv.product_id = p.id

                    ),

                    0

                ) AS stock

            FROM products p

            LEFT JOIN categories c

                ON p.category_id = c.id

            WHERE 1 = 1

        `;


        const request = pool.request();


        // =================================================
        // SEARCH
        // =================================================

        if (

            search &&

            search.trim() !== ""

        ) {

            query += `

                AND p.product_name LIKE @search

            `;


            request.input(

                "search",

                sql.NVarChar,

                `%${search.trim()}%`

            );

        }


        // =================================================
        // SALE
        // =================================================

        if (

            sale === "true"

        ) {

            query += `

                AND p.discount_percent > 0

            `;

        }


        // =================================================
        // SUBCATEGORY
        // =================================================

        if (

            subcategory &&

            subcategory.trim() !== ""

        ) {

            query += `

                AND LOWER(

                    REPLACE(

                        c.category_name,

                        ' ',

                        '-'

                    )

                )

                = LOWER(@subcategory)

            `;


            request.input(

                "subcategory",

                sql.NVarChar,

                subcategory.trim()

            );

        }


        // =================================================
        // MAIN CATEGORY
        // =================================================

        else if (

            category &&

            category.trim() !== ""

        ) {

            query += `

                AND (

                    LOWER(c.category_name)

                    = LOWER(@category)


                    OR c.parent_id = (

                        SELECT TOP 1 id

                        FROM categories

                        WHERE LOWER(category_name)

                        = LOWER(@category)

                        AND parent_id IS NULL

                    )

                )

            `;


            request.input(

                "category",

                sql.NVarChar,

                category.trim()

            );

        }


        // =================================================
        // FEATURED
        // =================================================

        if (

            featured === "true"

        ) {

            query += `

                AND p.is_featured = 1

            `;

        }


        // =================================================
        // SORT
        // =================================================

        if (

            sort === "price_asc"

        ) {

            query += `

                ORDER BY

                    p.price ASC,

                    p.id DESC

            `;

        }


        else if (

            sort === "price_desc"

        ) {

            query += `

                ORDER BY

                    p.price DESC,

                    p.id DESC

            `;

        }


        else {

            query += `

                ORDER BY

                    p.created_at DESC,

                    p.id DESC

            `;

        }


        const result = await request.query(

            query

        );


        res.status(200).json(

            result.recordset

        );

    }


    catch (err) {

        console.error(

            "Get products error:",

            err

        );


        res.status(500).json({

            message:

                "Failed to load products",

            error:

                err.message

        });

    }

};



// =====================================================
// GET PRODUCT BY ID
// =====================================================

const getProductById = async (req, res) => {

    try {

        const id = parseInt(

            req.params.id

        );


        if (

            isNaN(id)

        ) {

            return res.status(400).json({

                message:

                    "Invalid product ID"

            });

        }


        const pool = await sql.connect(config);


        // =================================================
        // PRODUCT
        // =================================================

        const productResult = await pool.request()

            .input(

                "id",

                sql.Int,

                id

            )

            .query(`

                SELECT

                    p.id,

                    p.product_name,

                    p.description,

                    p.price,

                    p.image_url,

                    p.brand,

                    p.discount_percent,

                    p.is_featured,

                    p.created_at,

                    p.category_id,

                    c.category_name,

                    c.parent_id

                FROM products p

                LEFT JOIN categories c

                    ON p.category_id = c.id

                WHERE p.id = @id

            `);


        if (

            productResult.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Product not found"

            });

        }


        const product =

            productResult.recordset[0];


        // =================================================
        // COLORS
        // =================================================

        const colorsResult = await pool.request()

            .input(

                "product_id",

                sql.Int,

                id

            )

            .query(`

                SELECT

                    id,

                    product_id,

                    color_name,

                    image_url

                FROM product_colors

                WHERE product_id = @product_id

                ORDER BY id ASC

            `);


        // =================================================
        // SIZES
        // =================================================

        const sizesResult = await pool.request()

            .input(

                "product_id",

                sql.Int,

                id

            )

            .query(`

                SELECT

                    id,

                    product_id,

                    size

                FROM product_sizes

                WHERE product_id = @product_id

                ORDER BY id ASC

            `);


        // =================================================
        // VARIANTS
        // =================================================

        const variantsResult = await pool.request()

            .input(

                "product_id",

                sql.Int,

                id

            )

            .query(`

                SELECT

                    id,

                    product_id,

                    color_id,

                    size_id,

                    stock

                FROM product_variants

                WHERE product_id = @product_id

                ORDER BY id ASC

            `);


        // =================================================
        // TOTAL STOCK
        // =================================================

        const stockResult = await pool.request()

            .input(

                "product_id",

                sql.Int,

                id

            )

            .query(`

                SELECT

                    ISNULL(

                        SUM(stock),

                        0

                    ) AS stock

                FROM product_variants

                WHERE product_id = @product_id

            `);


        res.status(200).json({

            ...product,

            stock:

                stockResult.recordset[0].stock,

            colors:

                colorsResult.recordset,

            sizes:

                sizesResult.recordset,

            variants:

                variantsResult.recordset

        });

    }


    catch (err) {

        console.error(

            "Get product by ID error:",

            err

        );


        res.status(500).json({

            message:

                "Failed to load product",

            error:

                err.message

        });

    }

};



// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = async (req, res) => {

    try {

        const {

            product_name,

            description,

            price,

            category_id,

            image_url,

            brand,

            discount_percent,

            is_featured

        } = req.body;


        const pool = await sql.connect(config);


        const result = await pool.request()

            .input(

                "product_name",

                sql.NVarChar,

                product_name

            )

            .input(

                "description",

                sql.NVarChar,

                description || null

            )

            .input(

                "price",

                sql.Decimal(18, 2),

                price

            )

            .input(

                "category_id",

                sql.Int,

                category_id

            )

            .input(

                "image_url",

                sql.NVarChar,

                image_url

            )

            .input(

                "brand",

                sql.NVarChar,

                brand || null

            )

            .input(

                "discount_percent",

                sql.Int,

                discount_percent || 0

            )

            .input(

                "is_featured",

                sql.Bit,

                is_featured || false

            )

            .query(`

                INSERT INTO products

                (

                    product_name,

                    description,

                    price,

                    category_id,

                    image_url,

                    brand,

                    discount_percent,

                    is_featured

                )

                OUTPUT INSERTED.id

                VALUES

                (

                    @product_name,

                    @description,

                    @price,

                    @category_id,

                    @image_url,

                    @brand,

                    @discount_percent,

                    @is_featured

                )

            `);


        res.status(201).json({

            message:

                "Product created successfully",

            product_id:

                result.recordset[0].id

        });

    }


    catch (err) {

        console.error(

            "Create product error:",

            err

        );


        res.status(500).json({

            message:

                "Failed to create product",

            error:

                err.message

        });

    }

};



// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = async (req, res) => {

    try {

        const {

            id

        } = req.params;


        const {

            product_name,

            description,

            price,

            category_id,

            image_url,

            brand,

            discount_percent,

            is_featured

        } = req.body;


        const pool = await sql.connect(config);


        await pool.request()

            .input(

                "id",

                sql.Int,

                id

            )

            .input(

                "product_name",

                sql.NVarChar,

                product_name

            )

            .input(

                "description",

                sql.NVarChar,

                description || null

            )

            .input(

                "price",

                sql.Decimal(18, 2),

                price

            )

            .input(

                "category_id",

                sql.Int,

                category_id

            )

            .input(

                "image_url",

                sql.NVarChar,

                image_url

            )

            .input(

                "brand",

                sql.NVarChar,

                brand || null

            )

            .input(

                "discount_percent",

                sql.Int,

                discount_percent || 0

            )

            .input(

                "is_featured",

                sql.Bit,

                is_featured || false

            )

            .query(`

                UPDATE products

                SET

                    product_name = @product_name,

                    description = @description,

                    price = @price,

                    category_id = @category_id,

                    image_url = @image_url,

                    brand = @brand,

                    discount_percent = @discount_percent,

                    is_featured = @is_featured

                WHERE id = @id

            `);


        res.status(200).json({

            message:

                "Product updated successfully"

        });

    }


    catch (err) {

        console.error(

            "Update product error:",

            err

        );


        res.status(500).json({

            message:

                "Failed to update product",

            error:

                err.message

        });

    }

};



// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = async (req, res) => {

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

                DELETE FROM products

                WHERE id = @id

            `);


        res.status(200).json({

            message:

                "Product deleted successfully"

        });

    }


    catch (err) {

        console.error(

            "Delete product error:",

            err

        );


        res.status(500).json({

            message:

                "Cannot delete product",

            error:

                err.message

        });

    }

};



// =====================================================
// BEST SELLER
// =====================================================

const getBestSeller = async (req, res) => {

    try {

        const pool = await sql.connect(config);


        const result = await pool.request().query(`

            SELECT TOP 4

                p.id,

                p.product_name,

                p.description,

                p.price,

                p.image_url,

                p.brand,

                p.discount_percent,

                p.is_featured,

                p.created_at,

                c.category_name,

                ISNULL(

                    SUM(od.quantity),

                    0

                ) AS total_sold

            FROM products p

            LEFT JOIN categories c

                ON p.category_id = c.id

            LEFT JOIN order_details od

                ON p.id = od.product_id

            GROUP BY

                p.id,

                p.product_name,

                p.description,

                p.price,

                p.image_url,

                p.brand,

                p.discount_percent,

                p.is_featured,

                p.created_at,

                c.category_name

            ORDER BY

                total_sold DESC,

                p.id DESC

        `);


        res.status(200).json(

            result.recordset

        );

    }


    catch (err) {

        console.error(

            "Get best seller error:",

            err

        );


        res.status(500).json({

            message:

                "Failed to load best seller products",

            error:

                err.message

        });

    }

};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getProducts,

    getProductById,

    createProduct,

    updateProduct,

    deleteProduct,

    getBestSeller

};