const { sql, getPool } = require("../config/db");

// =====================================================
// CHECK CUSTOMER SERVICE ACCESS
// =====================================================

const isCustomerService = (user) => {
    return (
        user.role === "EMPLOYEE" &&
        String(user.department || "").trim().toUpperCase() ===
            "CUSTOMER SERVICE".toUpperCase()
    );
};

// =====================================================
// CREATE OR GET CUSTOMER CONVERSATION
// =====================================================

const createConversation = async (req, res) => {
    try {
        if (req.user.role !== "CUSTOMER") {
            return res.status(403).json({
                message: "Only customers can create conversations."
            });
        }

        const pool = await getPool();

        const existing = await pool.request()
            .input("customer_id", sql.Int, req.user.id)
            .query(`
                SELECT TOP 1 *
                FROM customer_chat_conversations
                WHERE customer_id = @customer_id
                  AND status = 'OPEN'
                ORDER BY updated_at DESC
            `);

        if (existing.recordset.length > 0) {
            return res.status(200).json({
                conversation: existing.recordset[0]
            });
        }

        const result = await pool.request()
            .input("customer_id", sql.Int, req.user.id)
            .query(`
                INSERT INTO customer_chat_conversations (
                    customer_id,
                    status
                )
                OUTPUT INSERTED.*
                VALUES (
                    @customer_id,
                    'OPEN'
                )
            `);

        return res.status(201).json({
            conversation: result.recordset[0]
        });

    } catch (error) {
        console.error("Create conversation error:", error);

        return res.status(500).json({
            message: "Failed to create conversation."
        });
    }
};

// =====================================================
// GET CUSTOMER CONVERSATION
// =====================================================

const getMyConversation = async (req, res) => {
    try {
        if (req.user.role !== "CUSTOMER") {
            return res.status(403).json({
                message: "Customer access only."
            });
        }

        const pool = await getPool();

        const result = await pool.request()
            .input("customer_id", sql.Int, req.user.id)
            .query(`
                SELECT TOP 1 *
                FROM customer_chat_conversations
                WHERE customer_id = @customer_id
                ORDER BY updated_at DESC
            `);

        return res.json({
            conversation: result.recordset[0] || null
        });

    } catch (error) {
        console.error("Get customer conversation error:", error);

        return res.status(500).json({
            message: "Failed to get conversation."
        });
    }
};

// =====================================================
// GET ALL CONVERSATIONS FOR CUSTOMER SERVICE
// =====================================================

const getAllConversations = async (req, res) => {
    try {
        if (!isCustomerService(req.user)) {
            return res.status(403).json({
                message: "Customer Service access only."
            });
        }

        const pool = await getPool();

        const result = await pool.request().query(`
            SELECT
                c.id,
                c.customer_id,
                c.employee_id,
                c.status,
                c.created_at,
                c.updated_at,
                u.full_name AS customer_name,
                u.email AS customer_email,
                (
                    SELECT TOP 1 m.message
                    FROM customer_chat_messages m
                    WHERE m.conversation_id = c.id
                    ORDER BY m.created_at DESC, m.id DESC
                ) AS last_message,
                (
                    SELECT TOP 1 m.created_at
                    FROM customer_chat_messages m
                    WHERE m.conversation_id = c.id
                    ORDER BY m.created_at DESC, m.id DESC
                ) AS last_message_at
            FROM customer_chat_conversations c
            INNER JOIN users u ON u.id = c.customer_id
            ORDER BY c.updated_at DESC, c.id DESC
        `);

        return res.json(result.recordset);

    } catch (error) {
        console.error("Get conversations error:", error);

        return res.status(500).json({
            message: "Failed to get conversations."
        });
    }
};

// =====================================================
// GET MESSAGES
// =====================================================

const getMessages = async (req, res) => {
    try {
        const conversationId = Number(req.params.id);

        if (!Number.isInteger(conversationId) || conversationId <= 0) {
            return res.status(400).json({
                message: "Invalid conversation ID."
            });
        }

        const pool = await getPool();

        let request = pool.request()
            .input("conversation_id", sql.Int, conversationId);

        let accessQuery = `
            SELECT id
            FROM customer_chat_conversations
            WHERE id = @conversation_id
        `;

        if (req.user.role === "CUSTOMER") {
            accessQuery += " AND customer_id = @user_id";
            request.input("user_id", sql.Int, req.user.id);
        } else if (isCustomerService(req.user)) {
            // Customer Service employees can access conversations.
        } else {
            return res.status(403).json({
                message: "You do not have permission to view this conversation."
            });
        }

        const access = await request.query(accessQuery);

        if (access.recordset.length === 0) {
            return res.status(404).json({
                message: "Conversation not found."
            });
        }

        const result = await pool.request()
            .input("conversation_id", sql.Int, conversationId)
            .query(`
                SELECT
                    m.id,
                    m.conversation_id,
                    m.sender_id,
                    u.full_name AS sender_name,
                    u.role AS sender_role,
                    m.message,
                    m.is_read,
                    m.created_at
                FROM customer_chat_messages m
                INNER JOIN users u ON u.id = m.sender_id
                WHERE m.conversation_id = @conversation_id
                ORDER BY m.created_at ASC, m.id ASC
            `);

        return res.json(result.recordset);

    } catch (error) {
        console.error("Get messages error:", error);

        return res.status(500).json({
            message: "Failed to get messages."
        });
    }
};

// =====================================================
// SEND MESSAGE
// =====================================================

const sendMessage = async (req, res) => {
    try {
        const conversationId = Number(req.params.id);
        const message = String(req.body.message || "").trim();

        if (!Number.isInteger(conversationId) || conversationId <= 0) {
            return res.status(400).json({
                message: "Invalid conversation ID."
            });
        }

        if (!message) {
            return res.status(400).json({
                message: "Message cannot be empty."
            });
        }

        const pool = await getPool();

        const accessRequest = pool.request()
            .input("conversation_id", sql.Int, conversationId);

        let accessQuery = `
            SELECT id, customer_id, employee_id, status
            FROM customer_chat_conversations
            WHERE id = @conversation_id
        `;

        if (req.user.role === "CUSTOMER") {
            accessQuery += " AND customer_id = @user_id";
            accessRequest.input("user_id", sql.Int, req.user.id);
        } else if (isCustomerService(req.user)) {
            // Customer Service employees can reply to conversations.
        } else {
            return res.status(403).json({
                message: "You do not have permission to send messages."
            });
        }

        const access = await accessRequest.query(accessQuery);

        if (access.recordset.length === 0) {
            return res.status(404).json({
                message: "Conversation not found."
            });
        }

        const conversation = access.recordset[0];

        if (conversation.status !== "OPEN") {
            return res.status(400).json({
                message: "This conversation is closed."
            });
        }

        if (isCustomerService(req.user) && conversation.employee_id !== null &&
            conversation.employee_id !== req.user.id) {
            return res.status(403).json({
                message: "This conversation is assigned to another employee."
            });
        }

        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        try {
            const insertRequest = new sql.Request(transaction);

            const inserted = await insertRequest
                .input("conversation_id", sql.Int, conversationId)
                .input("sender_id", sql.Int, req.user.id)
                .input("message", sql.NVarChar(sql.MAX), message)
                .query(`
                    INSERT INTO customer_chat_messages (
                        conversation_id,
                        sender_id,
                        message
                    )
                    OUTPUT INSERTED.*
                    VALUES (
                        @conversation_id,
                        @sender_id,
                        @message
                    )
                `);

            const updateRequest = new sql.Request(transaction);

            await updateRequest
                .input("conversation_id", sql.Int, conversationId)
                .input(
                    "employee_id",
                    sql.Int,
                    isCustomerService(req.user) ? req.user.id : conversation.employee_id
                )
                .query(`
                    UPDATE customer_chat_conversations
                    SET
                        employee_id = COALESCE(employee_id, @employee_id),
                        updated_at = GETDATE()
                    WHERE id = @conversation_id
                `);

            await transaction.commit();

            return res.status(201).json({
                message: "Message sent successfully.",
                data: inserted.recordset[0]
            });

        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error("Send message error:", error);

        return res.status(500).json({
            message: "Failed to send message."
        });
    }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createConversation,
    getMyConversation,
    getAllConversations,
    getMessages,
    sendMessage
};