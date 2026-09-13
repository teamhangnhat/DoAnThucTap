const { sql, config } = require("../config/db");


// =====================================================
// ADD PRODUCT TO CART
// =====================================================

const addToCart = async (req, res) => {

    try {

        const {

            customer_id,

            product_id,

            quantity,

            size_id,

            color_id

        } = req.body;


        if (

            !customer_id ||

            !product_id ||

            !quantity ||

            !size_id ||

            !color_id

        ) {

            return res.status(400).json({

                message:

                    "Customer, product, size, color and quantity are required."

            });

        }


        if (

            Number(quantity) <= 0

        ) {

            return res.status(400).json({

                message:

                    "Quantity must be greater than 0."

            });

        }


        const pool =

            await sql.connect(config);


        // =================================================
        // CHECK PRODUCT
        // =================================================

        const productResult =

            await pool.request()

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


        // =================================================
        // GET VARIANT STOCK
        // =================================================

        const variantResult =

            await pool.request()

                .input(

                    "product_id",

                    sql.Int,

                    Number(product_id)

                )

                .input(

                    "size_id",

                    sql.Int,

                    Number(size_id)

                )

                .input(

                    "color_id",

                    sql.Int,

                    Number(color_id)

                )

                .query(`

                    SELECT

                        id,

                        stock

                    FROM product_variants

                    WHERE product_id = @product_id

                    AND size_id = @size_id

                    AND color_id = @color_id

                `);


        if (

            variantResult.recordset.length === 0

        ) {

            return res.status(400).json({

                message:

                    "This size and color combination is not available."

            });

        }


        const variant =

            variantResult.recordset[0];


        const stock =

            Number(variant.stock) || 0;


        if (

            stock <= 0

        ) {

            return res.status(400).json({

                message:

                    "This product variant is out of stock."

            });

        }


        // =================================================
        // GET SIZE NAME
        // =================================================

        const sizeResult =

            await pool.request()

                .input(

                    "size_id",

                    sql.Int,

                    Number(size_id)

                )

                .query(`

                    SELECT size

                    FROM product_sizes

                    WHERE id = @size_id

                `);


        if (

            sizeResult.recordset.length === 0

        ) {

            return res.status(400).json({

                message:

                    "Invalid size."

            });

        }


        const sizeName =

            sizeResult.recordset[0].size;


        // =================================================
        // FIND CART
        // =================================================

        const cartResult =

            await pool.request()

                .input(

                    "customer_id",

                    sql.Int,

                    Number(customer_id)

                )

                .query(`

                    SELECT id

                    FROM carts

                    WHERE customer_id = @customer_id

                `);


        let cartId;


        if (

            cartResult.recordset.length === 0

        ) {

            const newCart =

                await pool.request()

                    .input(

                        "customer_id",

                        sql.Int,

                        Number(customer_id)

                    )

                    .query(`

                        INSERT INTO carts

                        (

                            customer_id

                        )

                        OUTPUT INSERTED.id

                        VALUES

                        (

                            @customer_id

                        )

                    `);


            cartId =

                newCart.recordset[0].id;

        }

        else {

            cartId =

                cartResult.recordset[0].id;

        }


        // =================================================
        // CHECK EXISTING ITEM
        // =================================================

        const existingResult =

            await pool.request()

                .input(

                    "cart_id",

                    sql.Int,

                    cartId

                )

                .input(

                    "product_id",

                    sql.Int,

                    Number(product_id)

                )

                .input(

                    "size",

                    sql.NVarChar(50),

                    sizeName

                )

                .input(

                    "color_id",

                    sql.Int,

                    Number(color_id)

                )

                .query(`

                    SELECT

                        id,

                        quantity

                    FROM cart_items

                    WHERE cart_id = @cart_id

                    AND product_id = @product_id

                    AND size = @size

                    AND color_id = @color_id

                `);


        // =================================================
        // EXISTING ITEM
        // =================================================

        if (

            existingResult.recordset.length > 0

        ) {

            const existing =

                existingResult.recordset[0];


            const newQuantity =

                Number(existing.quantity)

                +

                Number(quantity);


            if (

                newQuantity > stock

            ) {

                return res.status(400).json({

                    message:

                        `Only ${stock} items are available for this size and color.`

                });

            }


            await pool.request()

                .input(

                    "id",

                    sql.Int,

                    existing.id

                )

                .input(

                    "quantity",

                    sql.Int,

                    newQuantity

                )

                .query(`

                    UPDATE cart_items

                    SET quantity = @quantity

                    WHERE id = @id

                `);

        }


        // =================================================
        // NEW ITEM
        // =================================================

        else {

            await pool.request()

                .input(

                    "cart_id",

                    sql.Int,

                    cartId

                )

                .input(

                    "product_id",

                    sql.Int,

                    Number(product_id)

                )

                .input(

                    "quantity",

                    sql.Int,

                    Number(quantity)

                )

                .input(

                    "size",

                    sql.NVarChar(50),

                    sizeName

                )

                .input(

                    "color_id",

                    sql.Int,

                    Number(color_id)

                )

                .query(`

                    INSERT INTO cart_items

                    (

                        cart_id,

                        product_id,

                        quantity,

                        size,

                        color_id

                    )

                    VALUES

                    (

                        @cart_id,

                        @product_id,

                        @quantity,

                        @size,

                        @color_id

                    )

                `);

        }


        return res.status(201).json({

            message:

                "Product added to cart successfully."

        });

    }


    catch (err) {

        console.error(

            "ADD TO CART ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Failed to add product to cart.",

            error:

                err.message

        });

    }

};



// =====================================================
// GET CART
// =====================================================

const getCart = async (req, res) => {

    try {

        const {

            customer_id

        } = req.params;


        const pool =

            await sql.connect(config);


        const result =

            await pool.request()

                .input(

                    "customer_id",

                    sql.Int,

                    Number(customer_id)

                )

                .query(`

                    SELECT

                        ci.id,

                        ci.cart_id,

                        ci.product_id,

                        ci.quantity,

                        ci.size,

                        ci.color_id,

                        p.product_name,

                        p.price,

                        p.discount_percent,

                        ISNULL(

                            pc.image_url,

                            p.image_url

                        ) AS image_url,

                        pc.color_name,

                        ps.id AS size_id,

                        ps.size AS size_name,

                        ISNULL(

                            pv.stock,

                            0

                        ) AS stock,

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

                        ) AS final_price,

                        (

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

                            )

                            *

                            ci.quantity

                        ) AS subtotal

                    FROM carts c

                    INNER JOIN cart_items ci

                        ON c.id = ci.cart_id

                    INNER JOIN products p

                        ON p.id = ci.product_id

                    LEFT JOIN product_colors pc

                        ON pc.id = ci.color_id

                    LEFT JOIN product_sizes ps

                        ON ps.product_id = ci.product_id

                        AND ps.size = ci.size

                    LEFT JOIN product_variants pv

                        ON pv.product_id = ci.product_id

                        AND pv.color_id = ci.color_id

                        AND pv.size_id = ps.id

                    WHERE c.customer_id = @customer_id

                    ORDER BY ci.id DESC

                `);


        return res.status(200).json(

            result.recordset

        );

    }


    catch (err) {

        console.error(

            "GET CART ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Failed to load cart.",

            error:

                err.message

        });

    }

};



// =====================================================
// UPDATE CART ITEM
// =====================================================

const updateCartItem = async (req, res) => {

    try {

        const {

            cart_item_id,

            quantity,

            size_id,

            color_id

        } = req.body;


        if (

            !cart_item_id ||

            !quantity ||

            !size_id ||

            !color_id

        ) {

            return res.status(400).json({

                message:

                    "Cart item, quantity, size and color are required."

            });

        }


        if (

            Number(quantity) <= 0

        ) {

            return res.status(400).json({

                message:

                    "Quantity must be greater than 0."

            });

        }


        const pool =

            await sql.connect(config);


        // =================================================
        // GET SIZE NAME
        // =================================================

        const sizeResult =

            await pool.request()

                .input(

                    "size_id",

                    sql.Int,

                    Number(size_id)

                )

                .query(`

                    SELECT size

                    FROM product_sizes

                    WHERE id = @size_id

                `);


        if (

            sizeResult.recordset.length === 0

        ) {

            return res.status(400).json({

                message:

                    "Invalid size."

            });

        }


        const sizeName =

            sizeResult.recordset[0].size;


        // =================================================
        // GET PRODUCT ID
        // =================================================

        const itemResult =

            await pool.request()

                .input(

                    "cart_item_id",

                    sql.Int,

                    Number(cart_item_id)

                )

                .query(`

                    SELECT product_id

                    FROM cart_items

                    WHERE id = @cart_item_id

                `);


        if (

            itemResult.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Cart item not found."

            });

        }


        const productId =

            itemResult.recordset[0].product_id;


        // =================================================
        // CHECK STOCK
        // =================================================

        const variantResult =

            await pool.request()

                .input(

                    "product_id",

                    sql.Int,

                    Number(productId)

                )

                .input(

                    "size_id",

                    sql.Int,

                    Number(size_id)

                )

                .input(

                    "color_id",

                    sql.Int,

                    Number(color_id)

                )

                .query(`

                    SELECT stock

                    FROM product_variants

                    WHERE product_id = @product_id

                    AND size_id = @size_id

                    AND color_id = @color_id

                `);


        if (

            variantResult.recordset.length === 0

        ) {

            return res.status(400).json({

                message:

                    "This size and color combination is not available."

            });

        }


        const stock =

            Number(

                variantResult.recordset[0].stock

            ) || 0;


        if (

            Number(quantity) > stock

        ) {

            return res.status(400).json({

                message:

                    `Only ${stock} items are available in stock.`

            });

        }


        // =================================================
        // UPDATE DATABASE
        // =================================================

        await pool.request()

            .input(

                "cart_item_id",

                sql.Int,

                Number(cart_item_id)

            )

            .input(

                "quantity",

                sql.Int,

                Number(quantity)

            )

            .input(

                "size",

                sql.NVarChar(50),

                sizeName

            )

            .input(

                "color_id",

                sql.Int,

                Number(color_id)

            )

            .query(`

                UPDATE cart_items

                SET

                    quantity = @quantity,

                    size = @size,

                    color_id = @color_id

                WHERE id = @cart_item_id

            `);


        return res.status(200).json({

            message:

                "Cart updated successfully."

        });

    }


    catch (err) {

        console.error(

            "UPDATE CART ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Failed to update cart.",

            error:

                err.message

        });

    }

};



// =====================================================
// DELETE CART ITEM
// =====================================================

const deleteCartItem = async (req, res) => {

    try {

        const {

            id

        } = req.params;


        const pool =

            await sql.connect(config);


        await pool.request()

            .input(

                "id",

                sql.Int,

                Number(id)

            )

            .query(`

                DELETE FROM cart_items

                WHERE id = @id

            `);


        return res.status(200).json({

            message:

                "Product removed from cart successfully."

        });

    }


    catch (err) {

        console.error(

            "DELETE CART ITEM ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Failed to remove product from cart.",

            error:

                err.message

        });

    }

};



// =====================================================
// CLEAR CART
// =====================================================

const clearCart = async (req, res) => {

    try {

        const {

            customer_id

        } = req.params;


        const pool =

            await sql.connect(config);


        await pool.request()

            .input(

                "customer_id",

                sql.Int,

                Number(customer_id)

            )

            .query(`

                DELETE ci

                FROM cart_items ci

                INNER JOIN carts c

                    ON ci.cart_id = c.id

                WHERE c.customer_id = @customer_id

            `);


        return res.status(200).json({

            message:

                "Cart cleared successfully."

        });

    }


    catch (err) {

        console.error(

            "CLEAR CART ERROR:",

            err

        );


        return res.status(500).json({

            message:

                "Failed to clear cart.",

            error:

                err.message

        });

    }

};



module.exports = {

    addToCart,

    getCart,

    updateCartItem,

    deleteCartItem,

    clearCart

};