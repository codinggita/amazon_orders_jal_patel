"use strict";

const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// All analytics routes are highly sensitive and should be admin-only
router.use(protect);
router.use(restrictTo("admin"));

// Revenue & Time Analytics
router.get("/date-bounds", analyticsController.getDateBounds);
router.get("/revenue/total", analyticsController.getTotalRevenue);
router.get("/revenue/monthly", analyticsController.getMonthlyRevenue);
router.get("/revenue/yearly", analyticsController.getYearlyRevenue);

// Order Metrics
router.get("/orders/average-value", analyticsController.getAverageOrderValue);
router.get("/orders/count", analyticsController.getOrdersCount);
router.get("/orders/cancelled", analyticsController.getCancelledOrders);
router.get("/orders/refunded", analyticsController.getRefundedOrders);

// Customer Analytics
router.get("/customers/top", analyticsController.getTopCustomers);

// Product Analytics
router.get("/products/top-selling", analyticsController.getTopSellingProducts);
router.get("/products/low-selling", analyticsController.getLowSellingProducts);
router.get("/categories/top", analyticsController.getTopCategories);

// Financial & Operational Metrics
router.get("/payments/distribution", analyticsController.getPaymentDistribution);
router.get("/locations/top-cities", analyticsController.getTopCities);
router.get("/returns/rate", analyticsController.getReturnsRate);
router.get("/discounts/usage", analyticsController.getDiscountUsage);

module.exports = router;
