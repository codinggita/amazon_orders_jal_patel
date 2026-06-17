"use strict";

/**
 * @file statsRoutes.js
 * @description Phase 18 — Express route definitions for Statistics APIs.
 *
 * BASE PATH: /api/v1/stats (registered in app.js)
 *
 * All routes require JWT authentication (protect).
 * Admin-only routes additionally use restrictTo("admin").
 *
 * Routes overview:
 *   GET /stats/orders/total             — Total number of orders
 *   GET /stats/orders/daily             — Daily orders statistics (last 30 days)
 *   GET /stats/orders/monthly           — Monthly orders statistics
 *   GET /stats/orders/yearly            — Yearly orders statistics
 *   GET /stats/revenue/total            — Total revenue statistics
 *   GET /stats/revenue/daily            — Daily revenue statistics (last 30 days)
 *   GET /stats/revenue/monthly          — Monthly revenue statistics
 *   GET /stats/revenue/yearly           — Yearly revenue statistics
 *   GET /stats/products/count           — Total unique products count
 *   GET /stats/customers/count          — Total customers count
 *   GET /stats/categories/count         — Total categories count
 *   GET /stats/refunds/count            — Refund count statistics
 *   GET /stats/cancellations/count      — Cancellation count statistics
 *   GET /stats/shipping/average-time    — Average shipping duration
 *   GET /stats/system/performance       — API performance statistics
 */

const express = require("express");
const statsController = require("../controllers/statsController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// All stats routes require authentication
router.use(protect);
router.use(restrictTo("admin"));

// ── Order Statistics ───────────────────────────────────────────────────────
router.get("/orders/total", statsController.getTotalOrders);
router.get("/orders/daily", statsController.getDailyOrders);
router.get("/orders/monthly", statsController.getMonthlyOrders);
router.get("/orders/yearly", statsController.getYearlyOrders);

// ── Revenue Statistics ─────────────────────────────────────────────────────
router.get("/revenue/total", statsController.getTotalRevenue);
router.get("/revenue/daily", statsController.getDailyRevenue);
router.get("/revenue/monthly", statsController.getMonthlyRevenue);
router.get("/revenue/yearly", statsController.getYearlyRevenue);

// ── Entity Count Statistics ────────────────────────────────────────────────
router.get("/products/count", statsController.getProductsCount);
router.get("/customers/count", statsController.getCustomersCount);
router.get("/categories/count", statsController.getCategoriesCount);

// ── Operational Statistics ─────────────────────────────────────────────────
router.get("/refunds/count", statsController.getRefundsCount);
router.get("/cancellations/count", statsController.getCancellationsCount);
router.get("/shipping/average-time", statsController.getShippingAverageTime);

// ── System Performance ─────────────────────────────────────────────────────
router.get("/system/performance", statsController.getSystemPerformance);

module.exports = router;
