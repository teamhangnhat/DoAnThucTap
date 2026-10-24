const { getPool } = require("../config/db");

const getAvailableVouchers = async (req, res) => {
    try {

        const userId = req.user.id;

        const pool = await getPool();

        // =====================================================
        // 1. TỰ ĐỘNG TÍNH TỔNG CHI TIÊU
        // =====================================================

        const spendingResult = await pool
            .request()
            .input("userId", userId)
            .query(`
                SELECT
                    ISNULL(
                        SUM(total_amount),
                        0
                    ) AS total_spending
                FROM orders
                WHERE customer_id = @userId
                AND status = 'Completed'
            `);

        const totalSpending = Number(
            spendingResult.recordset[0].total_spending || 0
        );


        // =====================================================
        // 2. TỰ ĐỘNG XÁC ĐỊNH MEMBERSHIP
        // =====================================================

        const tierResult = await pool
            .request()
            .input("totalSpending", totalSpending)
            .query(`
                SELECT TOP 1
                    id,
                    name
                FROM membership_tiers
                WHERE min_spending <= @totalSpending
                ORDER BY min_spending DESC
            `);

        if (tierResult.recordset.length === 0) {

            return res.status(404).json({
                message: "No membership tier found"
            });

        }

        const tier = tierResult.recordset[0];


        // =====================================================
        // 3. TỰ ĐỘNG UPDATE USER MEMBERSHIP
        // =====================================================

        await pool
            .request()
            .input("userId", userId)
            .input("tierId", tier.id)
            .input("totalSpending", totalSpending)
            .query(`
                IF EXISTS (
                    SELECT 1
                    FROM user_memberships
                    WHERE user_id = @userId
                )
                BEGIN

                    UPDATE user_memberships
                    SET
                        membership_tier_id = @tierId,
                        total_spending = @totalSpending,
                        updated_at = GETDATE()
                    WHERE user_id = @userId

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
                        @userId,
                        @tierId,
                        @totalSpending
                    )

                END
            `);


        // =====================================================
        // 4. LẤY VOUCHER THEO MEMBERSHIP
        // =====================================================

        const result = await pool
            .request()
            .input("userId", userId)
            .input("tierId", tier.id)
            .query(`
                SELECT
                    v.id,
                    v.code,
                    v.description,
                    v.discount_type,
                    v.discount_value,
                    v.min_order_amount,
                    v.max_discount_amount,
                    v.membership_tier_id,
                    v.usage_limit,
                    v.used_count,
                    v.start_date,
                    v.end_date

                FROM vouchers v

                WHERE
                    v.membership_tier_id <= @tierId

                    AND v.is_active = 1

                    AND GETDATE()
                        BETWEEN v.start_date
                        AND v.end_date

                    AND NOT EXISTS (
                        SELECT 1
                        FROM voucher_usages vu
                        WHERE
                            vu.voucher_id = v.id
                            AND vu.user_id = @userId
                    )

                ORDER BY
                    v.membership_tier_id ASC,
                    v.discount_value DESC
            `);


        // =====================================================
        // 5. TRẢ VOUCHER
        // =====================================================

        res.json(result.recordset);

    } catch (err) {

        console.error(
            "GET VOUCHERS ERROR:",
            err
        );

        res.status(500).json({
            message: err.message
        });

    }
};
module.exports = {
    getAvailableVouchers
};