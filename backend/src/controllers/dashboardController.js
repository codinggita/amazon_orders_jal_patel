"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const dashboardService = require("../services/dashboardService");

const getOverview = catchAsync(async (req, res) => {
  const result = await dashboardService.getOverview();
  sendSuccess(res, 200, "Dashboard overview retrieved successfully", result);
});

const getRevenue = catchAsync(async (req, res) => {
  const period = req.query.period || "monthly";
  const result = await dashboardService.getRevenue(period);
  sendSuccess(res, 200, "Dashboard revenue data retrieved successfully", result);
});

const getOrders = catchAsync(async (req, res) => {
  const result = await dashboardService.getOrders();
  sendSuccess(res, 200, "Dashboard orders data retrieved successfully", result);
});

const getCustomers = catchAsync(async (req, res) => {
  const result = await dashboardService.getCustomers();
  sendSuccess(res, 200, "Dashboard customers data retrieved successfully", result);
});

const getProducts = catchAsync(async (req, res) => {
  const result = await dashboardService.getProducts();
  sendSuccess(res, 200, "Dashboard products data retrieved successfully", result);
});

module.exports = {
  getOverview,
  getRevenue,
  getOrders,
  getCustomers,
  getProducts,
};
