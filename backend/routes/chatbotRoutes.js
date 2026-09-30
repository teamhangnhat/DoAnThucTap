const express = require("express");

const router = express.Router();

const {
    chatWithAI
} = require("../controllers/chatbotController");

router.get("/", (req, res) => {

    res.json({
        message: "Chatbot API OK"
    });

});

router.post("/", chatWithAI);

module.exports = router;