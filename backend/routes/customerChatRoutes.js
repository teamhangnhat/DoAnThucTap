const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createConversation,
    getMyConversation,
    getAllConversations,
    getMessages,
    sendMessage
} = require("../controllers/customerChatController");

// Customer
router.post("/conversations", authMiddleware, createConversation);
router.get("/my-conversation", authMiddleware, getMyConversation);

// Employee - Customer Service
router.get("/conversations", authMiddleware, getAllConversations);

// Customer and Customer Service
router.get("/:id/messages", authMiddleware, getMessages);
router.post("/:id/messages", authMiddleware, sendMessage);

module.exports = router;