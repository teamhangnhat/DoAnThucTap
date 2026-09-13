const { sql, config } = require("../config/db");


// =====================================================
// GET WISHLIST
// =====================================================

const getWishlist = async (req, res) => {

    try {

        const {

            customer_id

        } = req.params;


        const pool = await sql.connect(config);


        const result = await pool

            .request()

            .input(

                "customer_id",

                sql.Int,

                Number(customer_id)

            )

            .query(`

                SELECT

                    w.id AS wishlist_id,

                    w.customer_id,

                    w.product_id,

                    w.created_at,

                    p.product_name,

                    p.price,

                    p.discount_percent,

                    p.image_url,

                    (

                        p.price *

                        (

                            100 -

                            ISNULL(

                                p.discount_percent,

                                0

                            )

                        )

                        / 100

                    ) AS final_price

                FROM wishlists w

                INNER JOIN products p

                    ON w.product_id = p.id

                WHERE w.customer_id = @customer_id

                ORDER BY w.created_at DESC

            `);


        return res.status(200).json(

            result.recordset

        );

    }


    catch (err) {

        console.error(

            "GET WISHLIST ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Failed to load wishlist.",

            error:

                err.message

        });

    }

};



// =====================================================
// ADD TO WISHLIST
// =====================================================

const addToWishlist = async (req, res) => {

    try {

        const {

            customer_id,

            product_id

        } = req.body;


        if (

            !customer_id ||

            !product_id

        ) {

            return res.status(400).json({

                message:

                    "Customer and product are required."

            });

        }


        const pool = await sql.connect(config);


        // CHECK PRODUCT

        const productResult = await pool

            .request()

            .input(

                "product_id",

                sql.Int,

                Number(product_id)

            )

            .query(`

                SELECT id

                FROM products

                WHERE id = @product_id

            `);


        if (

            productResult.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Product not found."

            });

        }


        // CHECK EXISTING WISHLIST

        const existingResult = await pool

            .request()

            .input(

                "customer_id",

                sql.Int,

                Number(customer_id)

            )

            .input(

                "product_id",

                sql.Int,

                Number(product_id)

            )

            .query(`

                SELECT id

                FROM wishlists

                WHERE customer_id = @customer_id

                AND product_id = @product_id

            `);


        if (

            existingResult.recordset.length > 0

        ) {

            return res.status(400).json({

                message:

                    "Product is already in wishlist."

            });

        }


        // INSERT REAL DATA

        await pool

            .request()

            .input(

                "customer_id",

                sql.Int,

                Number(customer_id)

            )

            .input(

                "product_id",

                sql.Int,

                Number(product_id)

            )

            .query(`

                INSERT INTO wishlists

                (

                    customer_id,

                    product_id

                )

                VALUES

                (

                    @customer_id,

                    @product_id

                )

            `);


        return res.status(201).json({

            message:

                "Product added to wishlist."

        });

    }


    catch (err) {

        console.error(

            "ADD WISHLIST ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Failed to add product to wishlist.",

            error:

                err.message

        });

    }

};



// =====================================================
// REMOVE FROM WISHLIST
// =====================================================

const removeFromWishlist = async (req, res) => {

    try {

        const {

            customer_id,

            product_id

        } = req.params;


        const pool = await sql.connect(config);


        await pool

            .request()

            .input(

                "customer_id",

                sql.Int,

                Number(customer_id)

            )

            .input(

                "product_id",

                sql.Int,

                Number(product_id)

            )

            .query(`

                DELETE FROM wishlists

                WHERE customer_id = @customer_id

                AND product_id = @product_id

            `);


        return res.status(200).json({

            message:

                "Product removed from wishlist."

        });

    }


    catch (err) {

        console.error(

            "REMOVE WISHLIST ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Failed to remove product from wishlist.",

            error:

                err.message

        });

    }

};



module.exports = {

    getWishlist,

    addToWishlist,

    removeFromWishlist

};