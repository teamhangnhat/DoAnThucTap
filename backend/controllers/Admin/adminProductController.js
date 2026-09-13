const { sql, config } = require("../../config/db");


// =====================================================
// GET ALL ADMIN PRODUCTS
// =====================================================

const getAdminProducts = async (req, res) => {

    try {

        const pool = await sql.connect(config);

        const result = await pool.request().query(`

            SELECT

                p.id,

                p.product_name,

                p.description,

                p.price,

                p.image_url,

                p.brand,

                p.discount_percent,

                p.is_featured,

                p.is_active,

                p.created_at,

                p.category_id,

                c.category_name,

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

            ORDER BY p.id DESC

        `);


        res.status(200).json(

            result.recordset

        );

    }

    catch (err) {

        console.error(

            "Get admin products error:",

            err

        );


        res.status(500).json({

            message:

                "Failed to load admin products",

            error:

                err.message

        });

    }

};



// =====================================================
// GET PRODUCT DETAIL
// =====================================================

const getAdminProductById = async (req, res) => {

    try {

        const productId =

            parseInt(

                req.params.id

            );


        if (isNaN(productId)) {

            return res.status(400).json({

                message:

                    "Invalid product ID"

            });

        }


        const pool =

            await sql.connect(config);



        // =================================================
        // PRODUCT
        // =================================================

        const productResult =

            await pool

                .request()

                .input(

                    "product_id",

                    sql.Int,

                    productId

                )

                .query(`

                    SELECT *

                    FROM products

                    WHERE id = @product_id

                `);


        if (

            productResult.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Product not found"

            });

        }



        // =================================================
        // COLORS
        // =================================================

        const colorsResult =

            await pool

                .request()

                .input(

                    "product_id",

                    sql.Int,

                    productId

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

        const sizesResult =

            await pool

                .request()

                .input(

                    "product_id",

                    sql.Int,

                    productId

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

        const variantsResult =

            await pool

                .request()

                .input(

                    "product_id",

                    sql.Int,

                    productId

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



        res.status(200).json({

            product:

                productResult.recordset[0],

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

            "Get admin product detail error:",

            err

        );


        res.status(500).json({

            message:

                "Failed to load product detail",

            error:

                err.message

        });

    }

};



// =====================================================
// CREATE PRODUCT
// =====================================================

const createAdminProduct = async (req, res) => {

    const transaction =

        new sql.Transaction();


    try {

        const {

            product_name,

            description,

            price,

            category_id,

            image_url,

            brand,

            discount_percent,

            is_featured,

            colors,

            sizes,

            variants

        } = req.body;



        await transaction.begin();



        // =================================================
        // INSERT PRODUCT
        // =================================================

        const productResult =

            await new sql.Request(

                transaction

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

                    brand || "DK Clothing"

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

                        is_featured,

                        is_active

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

                        @is_featured,

                        1

                    )

                `);



        const productId =

            productResult

                .recordset[0]

                .id;



        // =================================================
        // COLOR MAP
        // =================================================

        const colorIdMap = {};



        if (Array.isArray(colors)) {

            for (

                const color of colors

            ) {

                const result =

                    await new sql.Request(

                        transaction

                    )

                        .input(

                            "product_id",

                            sql.Int,

                            productId

                        )

                        .input(

                            "color_name",

                            sql.NVarChar,

                            color.color_name

                        )

                        .input(

                            "image_url",

                            sql.NVarChar,

                            color.image_url || null

                        )

                        .query(`

                            INSERT INTO product_colors

                            (

                                product_id,

                                color_name,

                                image_url

                            )

                            OUTPUT INSERTED.id

                            VALUES

                            (

                                @product_id,

                                @color_name,

                                @image_url

                            )

                        `);



                colorIdMap[

                    color.temp_id

                ] =

                    result.recordset[0].id;

            }

        }



        // =================================================
        // SIZE MAP
        // =================================================

        const sizeIdMap = {};



        if (Array.isArray(sizes)) {

            for (

                const size of sizes

            ) {

                const result =

                    await new sql.Request(

                        transaction

                    )

                        .input(

                            "product_id",

                            sql.Int,

                            productId

                        )

                        .input(

                            "size",

                            sql.NVarChar,

                            size.size

                        )

                        .query(`

                            INSERT INTO product_sizes

                            (

                                product_id,

                                size

                            )

                            OUTPUT INSERTED.id

                            VALUES

                            (

                                @product_id,

                                @size

                            )

                        `);



                sizeIdMap[

                    size.temp_id

                ] =

                    result.recordset[0].id;

            }

        }



        // =================================================
        // INSERT VARIANTS
        // =================================================

        if (Array.isArray(variants)) {

            for (

                const variant of variants

            ) {

                const colorId =

                    colorIdMap[

                        variant.color_temp_id

                    ];


                const sizeId =

                    sizeIdMap[

                        variant.size_temp_id

                    ];



                if (

                    !colorId ||

                    !sizeId

                ) {

                    continue;

                }



                await new sql.Request(

                    transaction

                )

                    .input(

                        "product_id",

                        sql.Int,

                        productId

                    )

                    .input(

                        "color_id",

                        sql.Int,

                        colorId

                    )

                    .input(

                        "size_id",

                        sql.Int,

                        sizeId

                    )

                    .input(

                        "stock",

                        sql.Int,

                        Number(

                            variant.stock

                        ) || 0

                    )

                    .query(`

                        INSERT INTO product_variants

                        (

                            product_id,

                            color_id,

                            size_id,

                            stock

                        )

                        VALUES

                        (

                            @product_id,

                            @color_id,

                            @size_id,

                            @stock

                        )

                    `);

            }

        }



        await transaction.commit();



        res.status(201).json({

            message:

                "Product created successfully",

            product_id:

                productId

        });

    }

    catch (err) {

        try {

            await transaction.rollback();

        }

        catch (rollbackError) {

            console.error(

                rollbackError

            );

        }



        console.error(

            "Create admin product error:",

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
// UPDATE PRODUCT + COLORS + SIZES + VARIANTS
// =====================================================

const updateAdminProduct = async (req, res) => {

    const transaction =

        new sql.Transaction();


    try {

        const productId =

            parseInt(

                req.params.id

            );


        if (isNaN(productId)) {

            return res.status(400).json({

                message:

                    "Invalid product ID"

            });

        }



        const {

            product_name,

            description,

            price,

            category_id,

            image_url,

            brand,

            discount_percent,

            is_featured,

            colors,

            sizes,

            variants

        } = req.body;



        await transaction.begin();



        // =================================================
        // UPDATE PRODUCT
        // =================================================

        await new sql.Request(

            transaction

        )

            .input(

                "id",

                sql.Int,

                productId

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



        // =================================================
        // DELETE OLD VARIANTS FIRST
        // =================================================

        await new sql.Request(

            transaction

        )

            .input(

                "product_id",

                sql.Int,

                productId

            )

            .query(`

                DELETE FROM product_variants

                WHERE product_id = @product_id

            `);



        // =================================================
        // DELETE OLD COLORS
        // =================================================

        await new sql.Request(

            transaction

        )

            .input(

                "product_id",

                sql.Int,

                productId

            )

            .query(`

                DELETE FROM product_colors

                WHERE product_id = @product_id

            `);



        // =================================================
        // DELETE OLD SIZES
        // =================================================

        await new sql.Request(

            transaction

        )

            .input(

                "product_id",

                sql.Int,

                productId

            )

            .query(`

                DELETE FROM product_sizes

                WHERE product_id = @product_id

            `);



        // =================================================
        // INSERT NEW COLORS
        // =================================================

        const colorIdMap = {};



        if (Array.isArray(colors)) {

            for (

                const color of colors

            ) {

                const result =

                    await new sql.Request(

                        transaction

                    )

                        .input(

                            "product_id",

                            sql.Int,

                            productId

                        )

                        .input(

                            "color_name",

                            sql.NVarChar,

                            color.color_name

                        )

                        .input(

                            "image_url",

                            sql.NVarChar,

                            color.image_url || null

                        )

                        .query(`

                            INSERT INTO product_colors

                            (

                                product_id,

                                color_name,

                                image_url

                            )

                            OUTPUT INSERTED.id

                            VALUES

                            (

                                @product_id,

                                @color_name,

                                @image_url

                            )

                        `);



                colorIdMap[

                    color.temp_id

                ] =

                    result.recordset[0].id;

            }

        }



        // =================================================
        // INSERT NEW SIZES
        // =================================================

        const sizeIdMap = {};



        if (Array.isArray(sizes)) {

            for (

                const size of sizes

            ) {

                const result =

                    await new sql.Request(

                        transaction

                    )

                        .input(

                            "product_id",

                            sql.Int,

                            productId

                        )

                        .input(

                            "size",

                            sql.NVarChar,

                            size.size

                        )

                        .query(`

                            INSERT INTO product_sizes

                            (

                                product_id,

                                size

                            )

                            OUTPUT INSERTED.id

                            VALUES

                            (

                                @product_id,

                                @size

                            )

                        `);



                sizeIdMap[

                    size.temp_id

                ] =

                    result.recordset[0].id;

            }

        }



        // =================================================
        // INSERT NEW VARIANTS
        // =================================================

        if (Array.isArray(variants)) {

            for (

                const variant of variants

            ) {

                const colorId =

                    colorIdMap[

                        variant.color_temp_id

                    ];


                const sizeId =

                    sizeIdMap[

                        variant.size_temp_id

                    ];



                if (

                    !colorId ||

                    !sizeId

                ) {

                    continue;

                }



                await new sql.Request(

                    transaction

                )

                    .input(

                        "product_id",

                        sql.Int,

                        productId

                    )

                    .input(

                        "color_id",

                        sql.Int,

                        colorId

                    )

                    .input(

                        "size_id",

                        sql.Int,

                        sizeId

                    )

                    .input(

                        "stock",

                        sql.Int,

                        Number(

                            variant.stock

                        ) || 0

                    )

                    .query(`

                        INSERT INTO product_variants

                        (

                            product_id,

                            color_id,

                            size_id,

                            stock

                        )

                        VALUES

                        (

                            @product_id,

                            @color_id,

                            @size_id,

                            @stock

                        )

                    `);

            }

        }



        await transaction.commit();



        res.status(200).json({

            message:

                "Product updated successfully"

        });

    }

    catch (err) {

        try {

            await transaction.rollback();

        }

        catch (rollbackError) {

            console.error(

                rollbackError

            );

        }



        console.error(

            "Update admin product error:",

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

const deleteAdminProduct = async (req, res) => {

    const transaction =

        new sql.Transaction();


    try {

        const productId =

            parseInt(

                req.params.id

            );


        if (isNaN(productId)) {

            return res.status(400).json({

                message:

                    "Invalid product ID"

            });

        }



        await transaction.begin();



        // DELETE VARIANTS

        await new sql.Request(

            transaction

        )

            .input(

                "product_id",

                sql.Int,

                productId

            )

            .query(`

                DELETE FROM product_variants

                WHERE product_id = @product_id

            `);



        // DELETE COLORS

        await new sql.Request(

            transaction

        )

            .input(

                "product_id",

                sql.Int,

                productId

            )

            .query(`

                DELETE FROM product_colors

                WHERE product_id = @product_id

            `);



        // DELETE SIZES

        await new sql.Request(

            transaction

        )

            .input(

                "product_id",

                sql.Int,

                productId

            )

            .query(`

                DELETE FROM product_sizes

                WHERE product_id = @product_id

            `);



        // DELETE PRODUCT

        await new sql.Request(

            transaction

        )

            .input(

                "product_id",

                sql.Int,

                productId

            )

            .query(`

                DELETE FROM products

                WHERE id = @product_id

            `);



        await transaction.commit();



        res.status(200).json({

            message:

                "Product deleted successfully"

        });

    }

    catch (err) {

        try {

            await transaction.rollback();

        }

        catch (rollbackError) {

            console.error(

                rollbackError

            );

        }



        console.error(

            "Delete admin product error:",

            err

        );



        res.status(500).json({

            message:

                "Failed to delete product",

            error:

                err.message

        });

    }

};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getAdminProducts,

    getAdminProductById,

    createAdminProduct,

    updateAdminProduct,

    deleteAdminProduct

};