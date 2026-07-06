"use strict";

/**
 * @file statsController.js
 * @description Phase 18 — HTTP controllers for Statistics APIs.
 *
 * ┌────────────────────────────────────────────────────────────┐
 * │  Route                               → Controller Handler  │
 * ├────────────────────────────────────────────────────────────┤
 * │  GET /stats/orders/total             → getTotalOrders       │
 * │  GET /stats/orders/daily             → getDailyOrders       │
 * │  GET /stats/orders/monthly           → getMonthlyOrders     │
 * │  GET /stats/orders/yearly            → getYearlyOrders      │
 * │  GET /stats/revenue/total            → getTotalRevenue      │
 * │  GET /stats/revenue/daily            → getDailyRevenue      │
 * │  GET /stats/revenue/monthly          → getMonthlyRevenue    │
 * │  GET /stats/revenue/yearly           → getYearlyRevenue     │
 * │  GET /stats/products/count           → getProductsCount     │
 * │  GET /stats/customers/count          → getCustomersCount    │
 * │  GET /stats/categories/count         → getCategoriesCount   │
 * │  GET /stats/refunds/count            → getRefundsCount      │
 * │  GET /stats/cancellations/count      → getCancellationsCount│
 * │  GET /stats/shipping/average-time    → getShippingAvgTime   │
 * │  GET /stats/system/performance       → getSystemPerformance │
 * └────────────────────────────────────────────────────────────┘
 */

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const statsService = require("../services/statsService");

const getTotalOrders = catchAsync(async (req, res) => {
  const result = await statsService.getTotalOrders();
  sendSuccess(res, 200, "Total orders count retrieved.", result);
});

const getDailyOrders = catchAsync(async (req, res) => {
  const result = await statsService.getDailyOrders();
  sendSuccess(res, 200, "Daily orders statistics retrieved.", result);
});

const getMonthlyOrders = catchAsync(async (req, res) => {
  const result = await statsService.getMonthlyOrders();
  sendSuccess(res, 200, "Monthly orders statistics retrieved.", result);
});

const getYearlyOrders = catchAsync(async (req, res) => {
  const result = await statsService.getYearlyOrders();
  sendSuccess(res, 200, "Yearly orders statistics retrieved.", result);
});

const getTotalRevenue = catchAsync(async (req, res) => {
  const result = await statsService.getTotalRevenue();
  sendSuccess(res, 200, "Total revenue statistics retrieved.", result);
});

const getDailyRevenue = catchAsync(async (req, res) => {
  const result = await statsService.getDailyRevenue();
  sendSuccess(res, 200, "Daily revenue statistics retrieved.", result);
});

const getMonthlyRevenue = catchAsync(async (req, res) => {
  const result = await statsService.getMonthlyRevenue();
  sendSuccess(res, 200, "Monthly revenue statistics retrieved.", result);
});

const getYearlyRevenue = catchAsync(async (req, res) => {
  const result = await statsService.getYearlyRevenue();
  sendSuccess(res, 200, "Yearly revenue statistics retrieved.", result);
});

const getProductsCount = catchAsync(async (req, res) => {
  const result = await statsService.getProductsCount();
  sendSuccess(res, 200, "Total products count retrieved.", result);
});

const getCustomersCount = catchAsync(async (req, res) => {
  const result = await statsService.getCustomersCount();
  sendSuccess(res, 200, "Total customers count retrieved.", result);
});

const getCategoriesCount = catchAsync(async (req, res) => {
  const result = await statsService.getCategoriesCount();
  sendSuccess(res, 200, "Total categories count retrieved.", result);
});

const getRefundsCount = catchAsync(async (req, res) => {
  const result = await statsService.getRefundsCount();
  sendSuccess(res, 200, "Refund count statistics retrieved.", result);
});

const getCancellationsCount = catchAsync(async (req, res) => {
  const result = await statsService.getCancellationsCount();
  sendSuccess(res, 200, "Cancellation count statistics retrieved.", result);
});

const getShippingAverageTime = catchAsync(async (req, res) => {
  const result = await statsService.getShippingAverageTime();
  sendSuccess(res, 200, "Average shipping duration retrieved.", result);
});

const getSystemPerformance = catchAsync(async (req, res) => {
  const result = await statsService.getSystemPerformance();
  sendSuccess(res, 200, "API performance statistics retrieved.", result);
});

module.exports = {
  getTotalOrders,
  getDailyOrders,
  getMonthlyOrders,
  getYearlyOrders,
  getTotalRevenue,
  getDailyRevenue,
  getMonthlyRevenue,
  getYearlyRevenue,
  getProductsCount,
  getCustomersCount,
  getCategoriesCount,
  getRefundsCount,
  getCancellationsCount,
  getShippingAverageTime,
  getSystemPerformance,
};
