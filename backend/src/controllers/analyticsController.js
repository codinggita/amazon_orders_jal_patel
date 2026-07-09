"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const analyticsService = require("../services/analyticsService");

const getTotalRevenue = catchAsync(async (req, res) => {
  const result = await analyticsService.getTotalRevenue();
  sendSuccess(res, 200, "Total revenue retrieved successfully", result);
});

const getDateBounds = catchAsync(async (req, res) => {
  const result = await analyticsService.getDateBounds();
  sendSuccess(res, 200, "Date bounds retrieved successfully", result);
});

const getMonthlyRevenue = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await analyticsService.getMonthlyRevenue(startDate, endDate);
  sendSuccess(res, 200, "Monthly revenue retrieved successfully", result);
});

const getYearlyRevenue = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await analyticsService.getYearlyRevenue(startDate, endDate);
  sendSuccess(res, 200, "Yearly revenue retrieved successfully", result);
});

const getAverageOrderValue = catchAsync(async (req, res) => {
  const result = await analyticsService.getAverageOrderValue();
  sendSuccess(res, 200, "Average order value retrieved successfully", result);
});

const getOrdersCount = catchAsync(async (req, res) => {
  const result = await analyticsService.getOrdersCount();
  sendSuccess(res, 200, "Total orders count retrieved successfully", result);
});

const getCancelledOrders = catchAsync(async (req, res) => {
  const result = await analyticsService.getCancelledOrders();
  sendSuccess(res, 200, "Cancelled orders analytics retrieved successfully", result);
});

const getRefundedOrders = catchAsync(async (req, res) => {
  const result = await analyticsService.getRefundedOrders();
  sendSuccess(res, 200, "Refunded orders analytics retrieved successfully", result);
});

const getTopCustomers = catchAsync(async (req, res) => {
  const result = await analyticsService.getTopCustomers();
  sendSuccess(res, 200, "Top customers analytics retrieved successfully", result);
});

const getTopSellingProducts = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await analyticsService.getTopSellingProducts(startDate, endDate);
  sendSuccess(res, 200, "Top selling products retrieved successfully", result);
});

const getLowSellingProducts = catchAsync(async (req, res) => {
  const result = await analyticsService.getLowSellingProducts();
  sendSuccess(res, 200, "Low selling products retrieved successfully", result);
});

const getTopCategories = catchAsync(async (req, res) => {
  const result = await analyticsService.getTopCategories();
  sendSuccess(res, 200, "Top categories analytics retrieved successfully", result);
});

const getPaymentDistribution = catchAsync(async (req, res) => {
  const result = await analyticsService.getPaymentDistribution();
  sendSuccess(res, 200, "Payment methods distribution retrieved successfully", result);
});

const getTopCities = catchAsync(async (req, res) => {
  const result = await analyticsService.getTopCities();
  sendSuccess(res, 200, "Top performing cities retrieved successfully", result);
});

const getReturnsRate = catchAsync(async (req, res) => {
  const result = await analyticsService.getReturnsRate();
  sendSuccess(res, 200, "Return rate analytics retrieved successfully", result);
});

const getDiscountUsage = catchAsync(async (req, res) => {
  const result = await analyticsService.getDiscountUsage();
  sendSuccess(res, 200, "Discount usage analytics retrieved successfully", result);
});

module.exports = {
  getDateBounds,
  getTotalRevenue,
  getMonthlyRevenue,
  getYearlyRevenue,
  getAverageOrderValue,
  getOrdersCount,
  getCancelledOrders,
  getRefundedOrders,
  getTopCustomers,
  getTopSellingProducts,
  getLowSellingProducts,
  getTopCategories,
  getPaymentDistribution,
  getTopCities,
  getReturnsRate,
  getDiscountUsage,
};
