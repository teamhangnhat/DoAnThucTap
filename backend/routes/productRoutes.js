const express = require("express");
const router = express.Router();

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
     getBestSeller
} = require("../controllers/productController");

router.get("/", getProducts);

router.get("/best-seller", getBestSeller);

router.get("/:id", getProductById);

router.post("/", createProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);
module.exports = router;