const axios = require("axios");
const { getPool } = require("../config/db");

// ============================================
// FALLBACK MODELS
// ============================================

const MODELS = [
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "openai/gpt-oss-20b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "inclusionai/ling-3.0-flash:free"
];

// ============================================
// OPENROUTER
// ============================================

async function callOpenRouter(prompt) {

    let lastError = null;

    for (const model of MODELS) {

        try {

            console.log("=================================");
            console.log("Trying model:", model);

            const response = await axios.post(

                "https://openrouter.ai/api/v1/chat/completions",

                {

                    model,

                    messages: [

                        {

                            role: "system",

                            content: `
You are DK Fashion AI Assistant.

You work for DK Fashion, an online clothing store.

You help customers:

- Find products
- Recommend clothing
- Explain size
- Explain promotions
- Explain shipping
- Explain return policy

Rules:

- Be friendly.
- Answer briefly.
- If products are provided, only use those products.
- Never make up products.
- Answer in English.
`

                        },

                        {

                            role: "user",

                            content: prompt

                        }

                    ],

                    temperature: 0.7,

                    max_tokens: 300

                },

                {

                    headers: {

                        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,

                        "Content-Type": "application/json"

                    }

                }

            );

            console.log("Using model:", model);

            return response.data.choices[0].message.content;

        }

        catch (err) {

            console.log("Model failed:", model);

            if (err.response?.data) {

                console.log(err.response.data);

            }

            lastError = err;

        }

    }

    throw lastError;

}

// ============================================
// CHATBOT
// ============================================

const chatWithAI = async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {

            return res.status(400).json({

                message: "Message is required"

            });

        }

        const pool = await getPool();

        const question = message.toLowerCase();

        let products = [];

        let prompt = "";
                // ============================================
        // NEWEST PRODUCTS
        // ============================================

        if (
            question.includes("new") ||
            question.includes("newest") ||
            question.includes("latest")
        ) {

            const result = await pool.request().query(`
                SELECT TOP 4
                    id,
                    product_name AS name,
                    price,
                    image_url
                FROM products
                WHERE
                    is_active = 1
                    AND stock > 0
                ORDER BY created_at DESC
            `);

            products = result.recordset;

            prompt = `
Customer asked:

${message}

Newest products:

${JSON.stringify(products)}

Introduce these products naturally.

Mention product name and price.
`;

        }

        // ============================================
        // BEST SELLER
        // ============================================

        else if (

            question.includes("best") ||
            question.includes("popular") ||
            question.includes("hot") ||
            question.includes("best seller") ||
            question.includes("top")

        ) {

            const result = await pool.request().query(`

                SELECT TOP 4

                    p.id,

                    p.product_name AS name,

                    p.price,

                    p.image_url,

                    SUM(od.quantity) AS total_sold

                FROM order_details od

                JOIN orders o
                    ON od.order_id = o.id

                JOIN products p
                    ON od.product_id = p.id

                WHERE

                    p.is_active = 1
                    AND p.stock > 0
                    AND o.status = 'Completed'

                GROUP BY

                    p.id,
                    p.product_name,
                    p.price,
                    p.image_url

                ORDER BY total_sold DESC

            `);

            products = result.recordset;

            // Nếu chưa có đơn hàng thì lấy sản phẩm mới nhất

            if (products.length === 0) {

                const fallback = await pool.request().query(`

                    SELECT TOP 4

                        id,

                        product_name AS name,

                        price,

                        image_url

                    FROM products

                    WHERE
                        is_active = 1
                        AND stock > 0

                    ORDER BY created_at DESC

                `);

                products = fallback.recordset;

            }

            prompt = `
Customer asked:

${message}

Best selling products:

${JSON.stringify(products)}

Introduce these products naturally.

Mention why they are popular.
`;

        }

        // ============================================
        // CATEGORY
        // ============================================

        else if (

            question.includes("shirt") ||
            question.includes("hoodie") ||
            question.includes("pants") ||
            question.includes("jeans") ||
            question.includes("jacket")

        ) {

            let keyword = "";

            if (question.includes("shirt")) keyword = "shirt";
            else if (question.includes("hoodie")) keyword = "hoodie";
            else if (question.includes("pants")) keyword = "pants";
            else if (question.includes("jeans")) keyword = "jeans";
            else if (question.includes("jacket")) keyword = "jacket";

            const result = await pool.request()

                .input("keyword", `%${keyword}%`)

                .query(`

                    SELECT TOP 4

                        id,

                        product_name AS name,

                        price,

                        image_url

                    FROM products

                    WHERE

                        is_active = 1
                        AND stock > 0
                        AND product_name LIKE @keyword

                `);

            products = result.recordset;

            prompt = `
Customer asked:

${message}

Products:

${JSON.stringify(products)}

Recommend these products.
`;

        }

        // ============================================
        // SIZE GUIDE
        // ============================================

        else if (

            question.includes("size") ||
            question.includes("fit")

        ) {

            prompt = `
Customer asked:

${message}

Answer:

We provide sizes S, M, L, XL and XXL.

Recommend choosing the larger size if the customer prefers an oversized fit.
`;

        }

        // ============================================
        // NORMAL CHAT
        // ============================================

        else {

            prompt = `
You are DK Fashion AI Assistant.

You work for an online clothing store.

You can answer questions about:

- Clothing
- Fashion
- Size Guide
- Promotions
- Orders
- Membership
- Voucher
- Shipping
- Return Policy

Customer:

${message}

Answer politely in English.

If the customer asks about products that are not provided,
politely ask them to browse our Shop page.
`;

        }
                // ============================================
        // CALL OPENROUTER AI
        // ============================================

        const reply = await callOpenRouter(prompt);

        res.json({

            success: true,

            reply,

            products

        });

    }

    catch (error) {

        console.error("=================================");
        console.error("CHATBOT ERROR");

        if (error.response?.data) {

            console.error(error.response.data);

        } else {

            console.error(error.message);

        }

        res.status(500).json({

            success: false,

            message: "OpenRouter Error",

            error: error.response?.data || error.message

        });

    }

};

module.exports = {

    chatWithAI

};