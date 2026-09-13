const express = require("express");

const router = express.Router();

const {
    getHeroStatistics,
     getWebsiteSettings,
     getActiveFlashSale
} = require("../controllers/homeController");

router.get("/hero", getHeroStatistics);
router.get("/settings", getWebsiteSettings);
router.get("/flash-sale",getActiveFlashSale);
module.exports = router;