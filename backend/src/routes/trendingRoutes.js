"use strict";

const express = require("express");
const trendingController = require("../controllers/trendingController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/products", trendingController.getTrendingProducts);
router.get("/categories", trendingController.getTrendingCategories);

module.exports = router;
