const {
    sql,
    connectDB
} = require("../config/db");


// =====================================================
// CREATE ORDER
// =====================================================

const createOrder = async (req, res) => {

    let transaction;


    try {

        const pool =
            await connectDB();


        transaction =
            new sql.Transaction(
                pool
            );


        const customerId =
            req.user.id;


        const {

            items,

            fullName,

            phone,

            address,

            city,

            district,

            ward,

            shippingFee = 0,

            discountAmount = 0,

            paymentMethod

        } = req.body;


        // =================================================
        // VALIDATE ITEMS
        // =================================================

        if (

            !Array.isArray(items) ||

            items.length === 0

        ) {

            return res.status(400).json({

                message:
                    "Cart is empty"

            });

        }


        // =================================================
        // VALIDATE SHIPPING
        // =================================================

        if (

            !fullName?.trim() ||

            !phone?.trim() ||

            !address?.trim()

        ) {

            return res.status(400).json({

                message:
                    "Shipping information is required"

            });

        }


        await transaction.begin();


        // =================================================
        // 1. CREATE ADDRESS
        // =================================================

        const addressResult =

            await transaction

                .request()

                .input(

                    "customer_id",

                    sql.Int,

                    customerId

                )

                .input(

                    "receiver_name",

                    sql.NVarChar(255),

                    fullName

                )

                .input(

                    "phone",

                    sql.VarChar(50),

                    phone

                )

                .input(

                    "address_detail",

                    sql.NVarChar(500),

                    address

                )

                .input(

                    "city",

                    sql.NVarChar(100),

                    city || null

                )

                .input(

                    "district",

                    sql.NVarChar(100),

                    district || null

                )

                .input(

                    "ward",

                    sql.NVarChar(100),

                    ward || null

                )

                .query(`

                    INSERT INTO customer_addresses

                    (

                        customer_id,

                        receiver_name,

                        phone,

                        address_detail,

                        city,

                        district,

                        ward,

                        is_default,

                        created_at

                    )

                    OUTPUT INSERTED.id

                    VALUES

                    (

                        @customer_id,

                        @receiver_name,

                        @phone,

                        @address_detail,

                        @city,

                        @district,

                        @ward,

                        0,

                        GETDATE()

                    )

                `);


        const addressId =

            addressResult

                .recordset[0]

                .id;


        // =================================================
        // 2. CALCULATE SUBTOTAL
        // =================================================

        let subtotal = 0;


        for (

            const item of items

        ) {


            // =============================================
            // PRODUCT ID
            // =============================================

            const productId =

                Number(

                    item.product_id

                );


            // =============================================
            // QUANTITY
            // =============================================

            const quantity =

                Number(

                    item.quantity

                );


            // =============================================
            // COLOR ID
            // =============================================

            const colorId =

                item.color_id

                    ? Number(

                        item.color_id

                    )

                    : null;


            // =============================================
            // SIZE ID
            // =============================================

            let sizeId =

                item.size_id

                    ? Number(

                        item.size_id

                    )

                    : null;


            // =============================================
            // SIZE NAME
            // =============================================

            const sizeName =

                item.size || null;


            // =============================================
            // VALIDATE BASIC DATA
            // =============================================

            if (

                !productId ||

                quantity <= 0

            ) {

                throw new Error(

                    "Invalid cart item"

                );

            }


            // =============================================
            // GET SIZE ID IF NULL
            // =============================================

            if (

                !sizeId &&

                sizeName

            ) {


                const sizeResult =

                    await transaction

                        .request()

                        .input(

                            "product_id",

                            sql.Int,

                            productId

                        )

                        .input(

                            "size",

                            sql.NVarChar(50),

                            sizeName

                        )

                        .query(`

                            SELECT id

                            FROM product_sizes

                            WHERE product_id = @product_id

                            AND size = @size

                        `);


                if (

                    sizeResult

                        .recordset

                        .length === 0

                ) {

                    throw new Error(

                        `Size ${sizeName} not found`

                    );

                }


                sizeId =

                    sizeResult

                        .recordset[0]

                        .id;

            }


            // =============================================
            // GET PRODUCT PRICE
            // =============================================

            const productResult =

                await transaction

                    .request()

                    .input(

                        "product_id",

                        sql.Int,

                        productId

                    )

                    .query(`

                        SELECT

                            id,

                            price,

                            discount_percent

                        FROM products

                        WHERE id = @product_id

                    `);


            if (

                productResult

                    .recordset

                    .length === 0

            ) {

                throw new Error(

                    "Product not found"

                );

            }


            const product =

                productResult

                    .recordset[0];


            const originalPrice =

                Number(

                    product.price

                );


            const discountPercent =

                Number(

                    product.discount_percent

                ) || 0;


            const unitPrice =

                originalPrice *

                (

                    100 -

                    discountPercent

                ) /

                100;


            subtotal +=

                unitPrice *

                quantity;


            // =============================================
            // GET VARIANT
            // =============================================

            const variantResult =

                await transaction

                    .request()

                    .input(

                        "product_id",

                        sql.Int,

                        productId

                    )

                    .input(

                        "size_id",

                        sql.Int,

                        sizeId

                    )

                    .input(

                        "color_id",

                        sql.Int,

                        colorId

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

                variantResult

                    .recordset

                    .length === 0

            ) {

                throw new Error(

                    "Product variant not found"

                );

            }


            const variant =

                variantResult

                    .recordset[0];


            const variantId =

                variant.id;


            const currentStock =

                Number(

                    variant.stock

                );


            // =============================================
            // CHECK STOCK
            // =============================================

            if (

                currentStock < quantity

            ) {

                throw new Error(

                    `Not enough stock. Available: ${currentStock}`

                );

            }

        }


        // =================================================
        // 3. CALCULATE TOTAL
        // =================================================

        const totalAmount =

            subtotal +

            Number(

                shippingFee

            ) -

            Number(

                discountAmount

            );


        if (

            totalAmount < 0

        ) {

            throw new Error(

                "Invalid total amount"

            );

        }


        // =================================================
        // 4. CREATE ORDER
        // =================================================

        const orderResult =

            await transaction

                .request()

                .input(

                    "customer_id",

                    sql.Int,

                    customerId

                )

                .input(

                    "total_amount",

                    sql.Decimal(18, 2),

                    totalAmount

                )

                .input(

                    "address_id",

                    sql.Int,

                    addressId

                )

                .input(

                    "shipping_fee",

                    sql.Decimal(18, 2),

                    Number(

                        shippingFee

                    )

                )

                .input(

                    "discount_amount",

                    sql.Decimal(18, 2),

                    Number(

                        discountAmount

                    )

                )

                .input(

                    "payment_method",

                    sql.NVarChar(50),

                    paymentMethod ||

                    "COD"

                )

                .query(`

                    INSERT INTO orders

                    (

                        customer_id,

                        total_amount,

                        status,

                        order_date,

                        address_id,

                        shipping_fee,

                        discount_amount,

                        payment_method,

                        payment_status

                    )

                    OUTPUT INSERTED.id

                    VALUES

                    (

                        @customer_id,

                        @total_amount,

                        'Pending',

                        GETDATE(),

                        @address_id,

                        @shipping_fee,

                        @discount_amount,

                        @payment_method,

                        'Pending'

                    )

                `);


        const orderId =

            orderResult

                .recordset[0]

                .id;


        // =================================================
        // 5. INSERT ORDER DETAILS + REDUCE STOCK
        // =================================================

        for (

            const item of items

        ) {


            const productId =

                Number(

                    item.product_id

                );


            const quantity =

                Number(

                    item.quantity

                );


            const colorId =

                item.color_id

                    ? Number(

                        item.color_id

                    )

                    : null;


            const sizeName =

                item.size || null;


            let sizeId =

                item.size_id

                    ? Number(

                        item.size_id

                    )

                    : null;


            // =============================================
            // GET SIZE ID
            // =============================================

            if (

                !sizeId &&

                sizeName

            ) {

                const sizeResult =

                    await transaction

                        .request()

                        .input(

                            "product_id",

                            sql.Int,

                            productId

                        )

                        .input(

                            "size",

                            sql.NVarChar(50),

                            sizeName

                        )

                        .query(`

                            SELECT id

                            FROM product_sizes

                            WHERE product_id = @product_id

                            AND size = @size

                        `);


                sizeId =

                    sizeResult

                        .recordset[0]

                        .id;

            }


            // =============================================
            // GET PRODUCT PRICE
            // =============================================

            const productResult =

                await transaction

                    .request()

                    .input(

                        "product_id",

                        sql.Int,

                        productId

                    )

                    .query(`

                        SELECT

                            price,

                            discount_percent

                        FROM products

                        WHERE id = @product_id

                    `);


            const product =

                productResult

                    .recordset[0];


            const price =

                Number(

                    product.price

                );


            const discount =

                Number(

                    product.discount_percent

                ) || 0;


            const unitPrice =

                price *

                (

                    100 -

                    discount

                ) /

                100;


            // =============================================
            // GET VARIANT
            // =============================================

            const variantResult =

                await transaction

                    .request()

                    .input(

                        "product_id",

                        sql.Int,

                        productId

                    )

                    .input(

                        "size_id",

                        sql.Int,

                        sizeId

                    )

                    .input(

                        "color_id",

                        sql.Int,

                        colorId

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

                variantResult

                    .recordset

                    .length === 0

            ) {

                throw new Error(

                    "Product variant not found"

                );

            }


            const variant =

                variantResult

                    .recordset[0];


            const variantId =

                variant.id;


            // =============================================
            // INSERT ORDER DETAIL
            // =============================================

            await transaction

                .request()

                .input(

                    "order_id",

                    sql.Int,

                    orderId

                )

                .input(

                    "product_id",

                    sql.Int,

                    productId

                )

                .input(

                    "quantity",

                    sql.Int,

                    quantity

                )

                .input(

                    "unit_price",

                    sql.Decimal(18, 2),

                    unitPrice

                )

                .input(

                    "size",

                    sql.NVarChar(100),

                    sizeName

                )

                .input(

                    "color_id",

                    sql.Int,

                    colorId

                )

                .query(`

                    INSERT INTO order_details

                    (

                        order_id,

                        product_id,

                        quantity,

                        unit_price,

                        size,

                        color_id

                    )

                    VALUES

                    (

                        @order_id,

                        @product_id,

                        @quantity,

                        @unit_price,

                        @size,

                        @color_id

                    )

                `);


            // =============================================
            // REDUCE STOCK
            // =============================================

            const updateStockResult =

                await transaction

                    .request()

                    .input(

                        "variant_id",

                        sql.Int,

                        variantId

                    )

                    .input(

                        "quantity",

                        sql.Int,

                        quantity

                    )

                    .query(`

                        UPDATE product_variants

                        SET stock = stock - @quantity

                        WHERE id = @variant_id

                        AND stock >= @quantity

                    `);


            if (

                updateStockResult

                    .rowsAffected[0] === 0

            ) {

                throw new Error(

                    "Stock was changed. Please try again."

                );

            }

        }


        // =================================================
        // 6. CLEAR CART
        // =================================================

        await transaction

            .request()

            .input(

                "customer_id",

                sql.Int,

                customerId

            )

            .query(`

                DELETE ci

                FROM cart_items ci

                INNER JOIN carts c

                    ON ci.cart_id = c.id

                WHERE c.customer_id = @customer_id

            `);


        // =================================================
        // 7. COMMIT
        // =================================================

        await transaction.commit();


        return res.status(201).json({

            message:

                "Order created successfully",

            orderId,

            totalAmount

        });

    }


    catch (error) {


        if (

            transaction &&

            transaction._aborted !== true

        ) {

            try {

                await transaction.rollback();

            }

            catch (

                rollbackError

            ) {

                console.error(

                    "ROLLBACK ERROR:",

                    rollbackError.message

                );

            }

        }


        console.error(

            "CREATE ORDER ERROR:",

            error

        );


        return res.status(500).json({

            message:

                error.message ||

                "Failed to create order"

        });

    }

};



// =====================================================
// GET MY ORDERS
// =====================================================

const getMyOrders = async (req, res) => {

    try {

        const pool =

            await connectDB();


        const customerId =

            req.user.id;


        const result =

            await pool

                .request()

                .input(

                    "customer_id",

                    sql.Int,

                    customerId

                )

                .query(`

                    SELECT

                        o.id,

                        o.customer_id,

                        o.total_amount,

                        o.status,

                        o.order_date,

                        o.address_id,

                        o.shipping_fee,

                        o.discount_amount,

                        o.payment_method,

                        o.payment_status,

                        ca.receiver_name,

                        ca.phone,

                        ca.address_detail,

                        ca.city,

                        ca.district,

                        ca.ward

                    FROM orders o

                    LEFT JOIN customer_addresses ca

                        ON o.address_id = ca.id

                    WHERE o.customer_id = @customer_id

                    ORDER BY o.order_date DESC

                `);


        return res.json(

            result.recordset

        );

    }


    catch (error) {

        console.error(

            "GET MY ORDERS ERROR:",

            error

        );


        return res.status(500).json({

            message:

                "Failed to get orders"

        });

    }

};



// =====================================================
// GET ORDER DETAILS
// =====================================================

const getOrderDetails = async (req, res) => {

    try {

        const pool =

            await connectDB();


        const customerId =

            req.user.id;


        const orderId =

            Number(

                req.params.id

            );


        if (

            !orderId

        ) {

            return res.status(400).json({

                message:

                    "Invalid order ID"

            });

        }


        const result =

            await pool

                .request()

                .input(

                    "order_id",

                    sql.Int,

                    orderId

                )

                .input(

                    "customer_id",

                    sql.Int,

                    customerId

                )

                .query(`

                    SELECT

                        o.id AS order_id,

                        o.customer_id,

                        o.total_amount,

                        o.status,

                        o.order_date,

                        o.address_id,

                        o.shipping_fee,

                        o.discount_amount,

                        o.payment_method,

                        o.payment_status,

                        ca.receiver_name,

                        ca.phone,

                        ca.address_detail,

                        ca.city,

                        ca.district,

                        ca.ward,

                        od.id,

                        od.product_id,

                        od.quantity,

                        od.unit_price,

                        od.size,

                        od.color_id,

                        p.product_name,

                        p.image_url,

                        pc.color_name,

                        pc.image_url AS color_image

                    FROM orders o

                    INNER JOIN order_details od

                        ON o.id = od.order_id

                    INNER JOIN products p

                        ON od.product_id = p.id

                    LEFT JOIN customer_addresses ca

                        ON o.address_id = ca.id

                    LEFT JOIN product_colors pc

                        ON od.color_id = pc.id

                    WHERE

                        o.id = @order_id

                        AND o.customer_id = @customer_id

                    ORDER BY od.id ASC

                `);


        if (

            result.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Order not found"

            });

        }


        return res.json({

            order: {

                id:

                    result

                        .recordset[0]

                        .order_id,

                customer_id:

                    result

                        .recordset[0]

                        .customer_id,

                total_amount:

                    result

                        .recordset[0]

                        .total_amount,

                status:

                    result

                        .recordset[0]

                        .status,

                order_date:

                    result

                        .recordset[0]

                        .order_date,

                address_id:

                    result

                        .recordset[0]

                        .address_id,

                shipping_fee:

                    result

                        .recordset[0]

                        .shipping_fee,

                discount_amount:

                    result

                        .recordset[0]

                        .discount_amount,

                payment_method:

                    result

                        .recordset[0]

                        .payment_method,

                payment_status:

                    result

                        .recordset[0]

                        .payment_status,


                address: {

                    receiver_name:

                        result

                            .recordset[0]

                            .receiver_name,

                    phone:

                        result

                            .recordset[0]

                            .phone,

                    address_detail:

                        result

                            .recordset[0]

                            .address_detail,

                    city:

                        result

                            .recordset[0]

                            .city,

                    district:

                        result

                            .recordset[0]

                            .district,

                    ward:

                        result

                            .recordset[0]

                            .ward

                }

            },


            items:

                result

                    .recordset

                    .map(

                        item => ({

                            id:

                                item.id,

                            product_id:

                                item.product_id,

                            product_name:

                                item.product_name,

                            image_url:

                                item.image_url,

                            color_image:

                                item.color_image,

                            color_name:

                                item.color_name,

                            color_id:

                                item.color_id,

                            size:

                                item.size,

                            quantity:

                                item.quantity,

                            unit_price:

                                item.unit_price

                        })

                    )

        });

    }


    catch (error) {

        console.error(

            "GET ORDER DETAILS ERROR:",

            error

        );


        return res.status(500).json({

            message:

                "Failed to get order details"

        });

    }

};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createOrder,

    getMyOrders,

    getOrderDetails

};