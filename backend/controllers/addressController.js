const { sql, config } = require("../config/db");

// =======================
// Lấy danh sách địa chỉ
// =======================
const getAddresses = async (req, res) => {
    try {

        const { customer_id } = req.params;

        const pool = await sql.connect(config);

        const result = await pool.request()
            .input("customer_id", sql.Int, customer_id)
            .query(`
                SELECT
                    id,
                    receiver_name,
                    phone,
                    address_detail,
                    ward,
                    district,
                    city,
                    postal_code,
                    is_default,
                    created_at
                FROM customer_addresses
                WHERE customer_id = @customer_id
                ORDER BY is_default DESC, id DESC
            `);

        res.json(result.recordset);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};

// =======================
// Thêm địa chỉ
// =======================
const createAddress = async (req, res) => {
    try {

        const {
            customer_id,
            receiver_name,
            phone,
            address_detail,
            ward,
            district,
            city,
            postal_code,
            is_default
        } = req.body;

        const pool = await sql.connect(config);

        if (is_default) {

            await pool.request()
                .input("customer_id", sql.Int, customer_id)
                .query(`
                    UPDATE customer_addresses
                    SET is_default = 0
                    WHERE customer_id = @customer_id
                `);

        }

        await pool.request()
            .input("customer_id", sql.Int, customer_id)
            .input("receiver_name", sql.NVarChar, receiver_name)
            .input("phone", sql.VarChar, phone)
            .input("address_detail", sql.NVarChar, address_detail)
            .input("ward", sql.NVarChar, ward)
            .input("district", sql.NVarChar, district)
            .input("city", sql.NVarChar, city)
            .input("postal_code", sql.VarChar, postal_code)
            .input("is_default", sql.Bit, is_default)
            .query(`
                INSERT INTO customer_addresses
                (
                    customer_id,
                    receiver_name,
                    phone,
                    address_detail,
                    ward,
                    district,
                    city,
                    postal_code,
                    is_default
                )
                VALUES
                (
                    @customer_id,
                    @receiver_name,
                    @phone,
                    @address_detail,
                    @ward,
                    @district,
                    @city,
                    @postal_code,
                    @is_default
                )
            `);

        res.status(201).json({
            message: "Thêm địa chỉ thành công"
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};

// =======================
// Cập nhật địa chỉ
// =======================
const updateAddress = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            receiver_name,
            phone,
            address_detail,
            ward,
            district,
            city,
            postal_code
        } = req.body;

        const pool = await sql.connect(config);

        await pool.request()
            .input("id", sql.Int, id)
            .input("receiver_name", sql.NVarChar, receiver_name)
            .input("phone", sql.VarChar, phone)
            .input("address_detail", sql.NVarChar, address_detail)
            .input("ward", sql.NVarChar, ward)
            .input("district", sql.NVarChar, district)
            .input("city", sql.NVarChar, city)
            .input("postal_code", sql.VarChar, postal_code)
            .query(`
                UPDATE customer_addresses
                SET
                    receiver_name = @receiver_name,
                    phone = @phone,
                    address_detail = @address_detail,
                    ward = @ward,
                    district = @district,
                    city = @city,
                    postal_code = @postal_code
                WHERE id = @id
            `);

        res.json({
            message: "Cập nhật địa chỉ thành công"
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};

// =======================
// Xóa địa chỉ
// =======================
const deleteAddress = async (req, res) => {
    try {

        const { id } = req.params;

        const pool = await sql.connect(config);

        await pool.request()
            .input("id", sql.Int, id)
            .query(`
                DELETE FROM customer_addresses
                WHERE id = @id
            `);

        res.json({
            message: "Xóa địa chỉ thành công"
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};

// =======================
// Đặt mặc định
// =======================
const setDefaultAddress = async (req, res) => {
    try {

        const { id } = req.params;

        const pool = await sql.connect(config);

        const address = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT customer_id
                FROM customer_addresses
                WHERE id = @id
            `);

        if (address.recordset.length === 0) {

            return res.status(404).json({
                message: "Không tìm thấy địa chỉ"
            });

        }

        const customerId = address.recordset[0].customer_id;

        await pool.request()
            .input("customer_id", sql.Int, customerId)
            .query(`
                UPDATE customer_addresses
                SET is_default = 0
                WHERE customer_id = @customer_id
            `);

        await pool.request()
            .input("id", sql.Int, id)
            .query(`
                UPDATE customer_addresses
                SET is_default = 1
                WHERE id = @id
            `);

        res.json({
            message: "Đặt địa chỉ mặc định thành công"
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};

module.exports = {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};