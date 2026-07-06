/**
 * @file amazonOrderController.js
 * @description HTTP controllers for the real Amazon Orders dataset API.
 *
 * Routes served:
 *   GET  /api/v1/amazon-orders                  → list (paginated, filtered)
 *   GET  /api/v1/amazon-orders/overview          → KPI overview
 *   GET  /api/v1/amazon-orders/revenue/monthly   → monthly revenue trend
 *   GET  /api/v1/amazon-orders/revenue/yearly    → yearly revenue trend
 *   GET  /api/v1/amazon-orders/by-status         → orders grouped by status
 *   GET  /api/v1/amazon-orders/categories        → top categories
 *   GET  /api/v1/amazon-orders/products          → top products
 *   GET  /api/v1/amazon-orders/countries         → top countries
 *   GET  /api/v1/amazon-orders/payment-methods   → payment method breakdown
 *   GET  /api/v1/amazon-orders/customers         → top customers
 *   GET  /api/v1/amazon-orders/:id               → single order by _id
 */

"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");
const amazonOrderService = require("../services/amazonOrderService");

/** GET /api/v1/amazon-orders */
const listOrders = catchAsync(async (req, res) => {
  const result = await amazonOrderService.listOrders(req.query);
  sendSuccess(res, 200, "Amazon orders retrieved successfully.", result);
});

/** GET /api/v1/amazon-orders/overview */
const getOverview = catchAsync(async (req, res) => {
  const result = await amazonOrderService.getOverview();
  sendSuccess(res, 200, "Amazon orders overview retrieved.", result);
});

/** GET /api/v1/amazon-orders/revenue/monthly */
const getMonthlyRevenue = catchAsync(async (req, res) => {
  const result = await amazonOrderService.getMonthlyRevenue();
  sendSuccess(res, 200, "Monthly revenue data retrieved.", result);
});

/** GET /api/v1/amazon-orders/revenue/yearly */
const getYearlyRevenue = catchAsync(async (req, res) => {
  const result = await amazonOrderService.getYearlyRevenue();
  sendSuccess(res, 200, "Yearly revenue data retrieved.", result);
});

/** GET /api/v1/amazon-orders/by-status */
const getOrdersByStatus = catchAsync(async (req, res) => {
  const result = await amazonOrderService.getOrdersByStatus();
  sendSuccess(res, 200, "Orders by status retrieved.", result);
});

/** GET /api/v1/amazon-orders/categories */
const getTopCategories = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await amazonOrderService.getTopCategories(limit);
  sendSuccess(res, 200, "Top categories retrieved.", result);
});

/** GET /api/v1/amazon-orders/products */
const getTopProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await amazonOrderService.getTopProducts(limit);
  sendSuccess(res, 200, "Top products retrieved.", result);
});

/** GET /api/v1/amazon-orders/countries */
const getTopCountries = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await amazonOrderService.getTopCountries(limit);
  sendSuccess(res, 200, "Top countries retrieved.", result);
});

/** GET /api/v1/amazon-orders/payment-methods */
const getPaymentMethodBreakdown = catchAsync(async (req, res) => {
  const result = await amazonOrderService.getPaymentMethodBreakdown();
  sendSuccess(res, 200, "Payment method breakdown retrieved.", result);
});

/** GET /api/v1/amazon-orders/customers */
const getTopCustomers = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await amazonOrderService.getTopCustomers(limit);
  sendSuccess(res, 200, "Top customers retrieved.", result);
});

/** GET /api/v1/amazon-orders/:id */
const getOrderById = catchAsync(async (req, res) => {
  const order = await amazonOrderService.getOrderById(req.params.id);
  if (!order) throw new ApiError("Order not found.", 404);
  sendSuccess(res, 200, "Amazon order retrieved.", order);
});

module.exports = {
  listOrders,
  getOverview,
  getMonthlyRevenue,
  getYearlyRevenue,
  getOrdersByStatus,
  getTopCategories,
  getTopProducts,
  getTopCountries,
  getPaymentMethodBreakdown,
  getTopCustomers,
  getOrderById,
};
