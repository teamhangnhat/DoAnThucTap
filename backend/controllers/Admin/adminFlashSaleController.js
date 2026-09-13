const sql = require("mssql");

const {
    getPool
} = require("../../config/db");


// =====================================================
// GET ALL FLASH SALES
// =====================================================

const getFlashSales = async (req, res) => {

    try {

        const pool = await getPool();

        const result = await pool

            .request()

            .query(`

                SELECT *

                FROM flash_sales

                ORDER BY created_at DESC

            `);


        res.json(

            result.recordset

        );

    }

    catch (error) {

        console.error(

            "Get flash sales error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load flash sales",

            error:

                error.message

        });

    }

};


// =====================================================
// GET ACTIVE FLASH SALE
// =====================================================

const getActiveFlashSale = async (req, res) => {

    try {

        const pool = await getPool();

        const result = await pool

            .request()

            .query(`

                SELECT TOP 1 *

                FROM flash_sales

                WHERE is_active = 1

                AND GETDATE() >= start_time

                AND GETDATE() <= end_time

                ORDER BY created_at DESC

            `);


        if (

            result.recordset.length === 0

        ) {

            return res.json(null);

        }


        res.json(

            result.recordset[0]

        );

    }

    catch (error) {

        console.error(

            "Get active flash sale error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load active flash sale",

            error:

                error.message

        });

    }

};


// =====================================================
// GET FLASH SALE BY ID
// =====================================================

const getFlashSaleById = async (req, res) => {

    try {

        const {

            id

        } = req.params;


        const pool = await getPool();


        const result = await pool

            .request()

            .input(

                "id",

                sql.Int,

                id

            )

            .query(`

                SELECT *

                FROM flash_sales

                WHERE id = @id

            `);


        if (

            result.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Flash sale not found"

            });

        }


        res.json(

            result.recordset[0]

        );

    }

    catch (error) {

        console.error(

            "Get flash sale by id error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to load flash sale",

            error:

                error.message

        });

    }

};


// =====================================================
// CREATE FLASH SALE
// =====================================================

const createFlashSale = async (req, res) => {

    try {

        const {

            title,

            description,

            image_url,

            discount_percent,

            start_time,

            end_time,

            button_text,

            is_active

        } = req.body;


        if (

            !title ||

            discount_percent === undefined ||

            !start_time ||

            !end_time

        ) {

            return res.status(400).json({

                message:

                    "Please fill in all required fields"

            });

        }


        const pool = await getPool();


        const active =

            is_active === true ||

            is_active === 1 ||

            is_active === "1";


        // Nếu Sale mới được bật

        // thì tắt Sale hiện tại

        if (

            active

        ) {

            await pool

                .request()

                .query(`

                    UPDATE flash_sales

                    SET

                        is_active = 0,

                        updated_at = GETDATE()

                    WHERE is_active = 1

                `);

        }


        const result = await pool

            .request()

            .input(

                "title",

                sql.NVarChar(255),

                title.trim()

            )

            .input(

                "description",

                sql.NVarChar(sql.MAX),

                description || null

            )

            .input(

                "image_url",

                sql.NVarChar(500),

                image_url || null

            )

            .input(

                "discount_percent",

                sql.Int,

                discount_percent

            )

            .input(

                "start_time",

                sql.DateTime2,

                start_time

            )

            .input(

                "end_time",

                sql.DateTime2,

                end_time

            )

            .input(

                "button_text",

                sql.NVarChar(100),

                button_text ||

                "SHOP SALE"

            )

            .input(

                "is_active",

                sql.Bit,

                active ? 1 : 0

            )

            .query(`

                INSERT INTO flash_sales

                (

                    title,

                    description,

                    image_url,

                    discount_percent,

                    start_time,

                    end_time,

                    button_text,

                    is_active

                )

                OUTPUT INSERTED.*

                VALUES

                (

                    @title,

                    @description,

                    @image_url,

                    @discount_percent,

                    @start_time,

                    @end_time,

                    @button_text,

                    @is_active

                )

            `);


        res.status(201).json({

            message:

                "Flash sale created successfully",

            sale:

                result.recordset[0]

        });

    }

    catch (error) {

        console.error(

            "Create flash sale error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to create flash sale",

            error:

                error.message

        });

    }

};


// =====================================================
// UPDATE FLASH SALE
// =====================================================

const updateFlashSale = async (req, res) => {

    try {

        const {

            id

        } = req.params;


        const {

            title,

            description,

            image_url,

            discount_percent,

            start_time,

            end_time,

            button_text,

            is_active

        } = req.body;


        const pool = await getPool();


        const active =

            is_active === true ||

            is_active === 1 ||

            is_active === "1";


        // Nếu sale này được bật

        // tắt tất cả sale khác

        if (

            active

        ) {

            await pool

                .request()

                .input(

                    "id",

                    sql.Int,

                    id

                )

                .query(`

                    UPDATE flash_sales

                    SET

                        is_active = 0,

                        updated_at = GETDATE()

                    WHERE id <> @id

                    AND is_active = 1

                `);

        }


        const result = await pool

            .request()

            .input(

                "id",

                sql.Int,

                id

            )

            .input(

                "title",

                sql.NVarChar(255),

                title.trim()

            )

            .input(

                "description",

                sql.NVarChar(sql.MAX),

                description || null

            )

            .input(

                "image_url",

                sql.NVarChar(500),

                image_url || null

            )

            .input(

                "discount_percent",

                sql.Int,

                discount_percent

            )

            .input(

                "start_time",

                sql.DateTime2,

                start_time

            )

            .input(

                "end_time",

                sql.DateTime2,

                end_time

            )

            .input(

                "button_text",

                sql.NVarChar(100),

                button_text ||

                "SHOP SALE"

            )

            .input(

                "is_active",

                sql.Bit,

                active ? 1 : 0

            )

            .query(`

                UPDATE flash_sales

                SET

                    title = @title,

                    description = @description,

                    image_url = @image_url,

                    discount_percent = @discount_percent,

                    start_time = @start_time,

                    end_time = @end_time,

                    button_text = @button_text,

                    is_active = @is_active,

                    updated_at = GETDATE()

                OUTPUT INSERTED.*

                WHERE id = @id

            `);


        if (

            result.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Flash sale not found"

            });

        }


        res.json({

            message:

                "Flash sale updated successfully",

            sale:

                result.recordset[0]

        });

    }

    catch (error) {

        console.error(

            "Update flash sale error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to update flash sale",

            error:

                error.message

        });

    }

};


// =====================================================
// TOGGLE ACTIVE
// =====================================================

const toggleFlashSale = async (req, res) => {

    try {

        const {

            id

        } = req.params;


        const pool = await getPool();


        const current = await pool

            .request()

            .input(

                "id",

                sql.Int,

                id

            )

            .query(`

                SELECT is_active

                FROM flash_sales

                WHERE id = @id

            `);


        if (

            current.recordset.length === 0

        ) {

            return res.status(404).json({

                message:

                    "Flash sale not found"

            });

        }


        const newStatus =

            current.recordset[0].is_active

                ? 0

                : 1;


        // Nếu bật sale này

        // tắt sale khác

        if (

            newStatus === 1

        ) {

            await pool

                .request()

                .query(`

                    UPDATE flash_sales

                    SET

                        is_active = 0,

                        updated_at = GETDATE()

                    WHERE is_active = 1

                `);

        }


        const result = await pool

            .request()

            .input(

                "id",

                sql.Int,

                id

            )

            .input(

                "is_active",

                sql.Bit,

                newStatus

            )

            .query(`

                UPDATE flash_sales

                SET

                    is_active = @is_active,

                    updated_at = GETDATE()

                OUTPUT INSERTED.*

                WHERE id = @id

            `);


        res.json({

            message:

                "Flash sale status updated",

            sale:

                result.recordset[0]

        });

    }

    catch (error) {

        console.error(

            "Toggle flash sale error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to update status",

            error:

                error.message

        });

    }

};


// =====================================================
// DELETE
// =====================================================

const deleteFlashSale = async (req, res) => {

    try {

        const {

            id

        } = req.params;


        const pool = await getPool();


        const result = await pool

            .request()

            .input(

                "id",

                sql.Int,

                id

            )

            .query(`

                DELETE FROM flash_sales

                WHERE id = @id

            `);


        if (

            result.rowsAffected[0] === 0

        ) {

            return res.status(404).json({

                message:

                    "Flash sale not found"

            });

        }


        res.json({

            message:

                "Flash sale deleted successfully"

        });

    }

    catch (error) {

        console.error(

            "Delete flash sale error:",

            error

        );


        res.status(500).json({

            message:

                "Failed to delete flash sale",

            error:

                error.message

        });

    }

};


module.exports = {

    getFlashSales,

    getActiveFlashSale,

    getFlashSaleById,

    createFlashSale,

    updateFlashSale,

    toggleFlashSale,

    deleteFlashSale

};