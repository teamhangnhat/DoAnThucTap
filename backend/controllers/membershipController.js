const {
    getPool
} = require("../config/db");


// =====================================================
// GET MY MEMBERSHIP
// =====================================================

const getMyMembership = async (

    req,

    res

) => {

    try {

        const userId = req.user.id;

        const pool = await getPool();


        const result = await pool

            .request()

            .input(

                "user_id",

                userId

            )

            .query(`

                SELECT

                    u.id AS user_id,

                    u.full_name,


                    mt.id AS tier_id,

                    mt.name AS tier_name,

                    mt.min_spending,

                    mt.max_spending,

                    mt.benefits,

                    mt.discount_percent,


                    ISNULL(

                        (

                            SELECT SUM(

                                o.total_amount

                            )

                            FROM orders o

                            WHERE o.customer_id = u.id

                            AND o.status = 'Completed'

                        ),

                        0

                    ) AS total_spending,


                    (

                        SELECT MIN(

                            mt2.min_spending

                        )

                        FROM membership_tiers mt2

                        WHERE mt2.min_spending >

                        ISNULL(

                            (

                                SELECT SUM(

                                    o2.total_amount

                                )

                                FROM orders o2

                                WHERE o2.customer_id = u.id

                                AND o2.status = 'Completed'

                            ),

                            0

                        )

                    ) AS next_tier_min_spending


                FROM users u


                OUTER APPLY (

                    SELECT TOP 1 *

                    FROM membership_tiers

                    WHERE min_spending <=

                    ISNULL(

                        (

                            SELECT SUM(

                                o3.total_amount

                            )

                            FROM orders o3

                            WHERE o3.customer_id = u.id

                            AND o3.status = 'Completed'

                        ),

                        0

                    )

                    ORDER BY min_spending DESC

                ) mt


                WHERE u.id = @user_id

            `);


        if (

            result.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "User not found"

            });

        }


        const membership =

            result.recordset[0];


        res.json({

            user_id:

                membership.user_id,

            full_name:

                membership.full_name,

            tier_id:

                membership.tier_id,

            tier_name:

                membership.tier_name,

            min_spending:

                membership.min_spending,

            max_spending:

                membership.max_spending,

            benefits:

                membership.benefits,

            discount_percent:

                membership.discount_percent,

            total_spending:

                membership.total_spending,

            next_tier_min_spending:

                membership.next_tier_min_spending

        });

    }


    catch (error) {


        console.error(

            "Get membership error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load membership",

            error:

                error.message

        });

    }

};



// =====================================================
// REFRESH MEMBERSHIP
// =====================================================

const refreshMyMembership = async (

    req,

    res

) => {

    try {

        const userId = req.user.id;

        const pool = await getPool();


        // =============================================
        // 1. CALCULATE TOTAL SPENDING
        // =============================================

        const spendingResult = await pool

            .request()

            .input(

                "user_id",

                userId

            )

            .query(`

                SELECT

                    ISNULL(

                        SUM(total_amount),

                        0

                    ) AS total_spending

                FROM orders

                WHERE customer_id = @user_id

                AND status = 'Completed'

            `);


        const totalSpending = Number(

            spendingResult

                .recordset[0]

                .total_spending || 0

        );


        // =============================================
        // 2. FIND MEMBERSHIP TIER
        // =============================================

        const tierResult = await pool

            .request()

            .input(

                "total_spending",

                totalSpending

            )

            .query(`

                SELECT TOP 1 *

                FROM membership_tiers

                WHERE min_spending <= @total_spending

                ORDER BY min_spending DESC

            `);


        if (

            tierResult.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "No membership tier found"

            });

        }


        const tier =

            tierResult.recordset[0];


        // =============================================
        // 3. INSERT OR UPDATE USER MEMBERSHIP
        // =============================================

        await pool

            .request()

            .input(

                "user_id",

                userId

            )

            .input(

                "membership_tier_id",

                tier.id

            )

            .input(

                "total_spending",

                totalSpending

            )

            .query(`

                IF EXISTS (

                    SELECT 1

                    FROM user_memberships

                    WHERE user_id = @user_id

                )

                BEGIN

                    UPDATE user_memberships

                    SET

                        membership_tier_id =

                            @membership_tier_id,

                        total_spending =

                            @total_spending,

                        updated_at = GETDATE()

                    WHERE user_id = @user_id

                END

                ELSE

                BEGIN

                    INSERT INTO user_memberships

                    (

                        user_id,

                        membership_tier_id,

                        total_spending

                    )

                    VALUES

                    (

                        @user_id,

                        @membership_tier_id,

                        @total_spending

                    )

                END

            `);


        res.json({

            message:

                "Membership updated successfully",

            data: {

                tier_id:

                    tier.id,

                tier_name:

                    tier.name,

                total_spending:

                    totalSpending,

                discount_percent:

                    tier.discount_percent

            }

        });

    }


    catch (error) {


        console.error(

            "Refresh membership error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to update membership",

            error:

                error.message

        });

    }

};



// =====================================================
// GET MY VOUCHERS
// =====================================================

const getMyVouchers = async (

    req,

    res

) => {

    try {

        const userId = req.user.id;

        const pool = await getPool();


        const result = await pool

            .request()

            .input(

                "user_id",

                userId

            )

            .query(`

                SELECT

                    uv.id AS user_voucher_id,

                    uv.is_used,

                    uv.used_at,

                    uv.created_at AS received_at,


                    v.id AS voucher_id,

                    v.code,

                    v.description,

                    v.discount_type,

                    v.discount_value,

                    v.min_order_amount,

                    v.max_discount_amount,

                    v.usage_limit,

                    v.used_count,

                    v.start_date,

                    v.end_date,

                    v.is_active,


                    mt.name AS membership_tier_name


                FROM user_vouchers uv


                INNER JOIN vouchers v

                    ON uv.voucher_id = v.id


                LEFT JOIN membership_tiers mt

                    ON v.membership_tier_id = mt.id


                WHERE uv.user_id = @user_id


                ORDER BY uv.created_at DESC

            `);


        res.json({

            vouchers:

                result.recordset

        });

    }


    catch (error) {


        console.error(

            "Get vouchers error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load vouchers",

            error:

                error.message

        });

    }

};



// =====================================================
// VALIDATE VOUCHER
// =====================================================

const validateVoucher = async (

    req,

    res

) => {

    try {

        const userId = req.user.id;


        const {

            code,

            order_amount

        } = req.body;


        // =============================================
        // CHECK INPUT
        // =============================================

        if (

            !code

        ) {

            return res.status(400).json({

                message:

                    "Voucher code is required"

            });

        }


        const orderAmount = Number(

            order_amount || 0

        );


        if (

            orderAmount <= 0

        ) {

            return res.status(400).json({

                message:

                    "Order amount must be greater than 0"

            });

        }


        const pool = await getPool();


        // =============================================
        // FIND USER VOUCHER
        // =============================================

        const result = await pool

            .request()

            .input(

                "user_id",

                userId

            )

            .input(

                "code",

                code.trim()

            )

            .query(`

                SELECT

                    uv.id AS user_voucher_id,

                    uv.is_used,

                    uv.used_at,


                    v.id AS voucher_id,

                    v.code,

                    v.description,

                    v.discount_type,

                    v.discount_value,

                    v.min_order_amount,

                    v.max_discount_amount,

                    v.start_date,

                    v.end_date,

                    v.is_active,

                    v.usage_limit,

                    v.used_count,


                    mt.name AS membership_tier_name


                FROM user_vouchers uv


                INNER JOIN vouchers v

                    ON uv.voucher_id = v.id


                LEFT JOIN membership_tiers mt

                    ON v.membership_tier_id = mt.id


                WHERE uv.user_id = @user_id

                AND UPPER(

                    LTRIM(

                        RTRIM(v.code)

                    )

                ) = UPPER(

                    LTRIM(

                        RTRIM(@code)

                    )

                )

            `);


        // =============================================
        // VOUCHER NOT FOUND
        // =============================================

        if (

            result.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Voucher not found"

            });

        }


        const voucher =

            result.recordset[0];


        // =============================================
        // CHECK USER VOUCHER USED
        // =============================================

        if (

            voucher.is_used

        ) {

            return res.status(400).json({

                message:

                    "This voucher has already been used"

            });

        }


        // =============================================
        // CHECK ACTIVE
        // =============================================

        if (

            !voucher.is_active

        ) {

            return res.status(400).json({

                message:

                    "This voucher is inactive"

            });

        }


        // =============================================
        // CHECK START DATE
        // =============================================

        const now = new Date();


        const startDate =

            voucher.start_date

                ? new Date(

                    voucher.start_date

                )

                : null;


        const endDate =

            voucher.end_date

                ? new Date(

                    voucher.end_date

                )

                : null;


        if (

            startDate &&

            now < startDate

        ) {

            return res.status(400).json({

                message:

                    "This voucher is not active yet"

            });

        }


        // =============================================
        // CHECK END DATE
        // =============================================

        if (

            endDate &&

            now > endDate

        ) {

            return res.status(400).json({

                message:

                    "This voucher has expired"

            });

        }


        // =============================================
        // CHECK MINIMUM ORDER
        // =============================================

        const minOrderAmount = Number(

            voucher.min_order_amount || 0

        );


        if (

            orderAmount < minOrderAmount

        ) {

            return res.status(400).json({

                message:

                    `Minimum order amount is ${minOrderAmount.toLocaleString(

                        "vi-VN"

                    )} ₫`

            });

        }


        // =============================================
        // CHECK USAGE LIMIT
        // =============================================

        if (

            voucher.usage_limit !== null &&

            voucher.usage_limit !== undefined &&

            Number(

                voucher.used_count || 0

            ) >= Number(

                voucher.usage_limit

            )

        ) {

            return res.status(400).json({

                message:

                    "This voucher has reached its usage limit"

            });

        }


        // =============================================
        // CALCULATE DISCOUNT
        // =============================================

        let discountAmount = 0;


        if (

            voucher.discount_type ===

            "PERCENTAGE"

        ) {

            discountAmount =

                orderAmount *

                Number(

                    voucher.discount_value

                ) /

                100;

        }


        else if (

            voucher.discount_type ===

            "FIXED"

        ) {

            discountAmount =

                Number(

                    voucher.discount_value

                );

        }


        // =============================================
        // CHECK MAX DISCOUNT
        // =============================================

        if (

            voucher.max_discount_amount !== null &&

            voucher.max_discount_amount !== undefined

        ) {

            discountAmount = Math.min(

                discountAmount,

                Number(

                    voucher.max_discount_amount

                )

            );

        }


        // =============================================
        // DISCOUNT CANNOT EXCEED ORDER
        // =============================================

        discountAmount = Math.min(

            discountAmount,

            orderAmount

        );


        const finalAmount =

            orderAmount -

            discountAmount;


        // =============================================
        // RESPONSE
        // =============================================

        res.json({

            message:

                "Voucher is valid",

            voucher: {

                user_voucher_id:

                    voucher.user_voucher_id,

                voucher_id:

                    voucher.voucher_id,

                code:

                    voucher.code,

                description:

                    voucher.description,

                discount_type:

                    voucher.discount_type,

                discount_value:

                    voucher.discount_value,

                discount_amount:

                    discountAmount,

                original_amount:

                    orderAmount,

                final_amount:

                    finalAmount,

                min_order_amount:

                    voucher.min_order_amount,

                max_discount_amount:

                    voucher.max_discount_amount,

                membership_tier_name:

                    voucher.membership_tier_name

            }

        });

    }


    catch (error) {


        console.error(

            "Validate voucher error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to validate voucher",

            error:

                error.message

        });

    }

};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getMyMembership,

    refreshMyMembership,

    getMyVouchers,

    validateVoucher

};