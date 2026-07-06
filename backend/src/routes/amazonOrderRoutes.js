/**
 * @file amazonOrderRoutes.js
 * @description Express router for the real Amazon Orders dataset.
 *
 * IMPORTANT ORDERING:
 * Specific named paths (e.g. /overview, /categories) MUST be registered
 * before the parameterised path /:id, otherwise Express would try to
 * interpret "overview" as an _id.
 *
 * Base prefix registered in app.js:  /api/v1/amazon-orders
 */

"use strict";

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/amazonOrderController");

// ── Analytics / aggregate endpoints (must come before /:id) ──────────────────
router.get("/overview",         ctrl.getOverview);
router.get("/revenue/monthly",  ctrl.getMonthlyRevenue);
router.get("/revenue/yearly",   ctrl.getYearlyRevenue);
router.get("/by-status",        ctrl.getOrdersByStatus);
router.get("/categories",       ctrl.getTopCategories);
router.get("/products",         ctrl.getTopProducts);
router.get("/countries",        ctrl.getTopCountries);
router.get("/payment-methods",  ctrl.getPaymentMethodBreakdown);
router.get("/customers",        ctrl.getTopCustomers);

// ── List all orders (paginated, filterable) ───────────────────────────────────
router.get("/",                 ctrl.listOrders);

// ── Single order by MongoDB _id ───────────────────────────────────────────────
router.get("/:id",              ctrl.getOrderById);

module.exports = router;
