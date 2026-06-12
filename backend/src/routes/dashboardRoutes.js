"use strict";

const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

router.get("/overview", dashboardController.getOverview);
router.get("/revenue", dashboardController.getRevenue);
router.get("/orders", dashboardController.getOrders);
router.get("/customers", dashboardController.getCustomers);
router.get("/products", dashboardController.getProducts);

module.exports = router;
