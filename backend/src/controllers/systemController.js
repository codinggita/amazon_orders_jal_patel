"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const systemService = require("../services/systemService");

const getVersion = catchAsync(async (req, res) => {
  const result = await systemService.getVersion();
  sendSuccess(res, 200, "System version retrieved successfully", result);
});

const getConfig = catchAsync(async (req, res) => {
  const result = await systemService.getSanitizedConfig();
  sendSuccess(res, 200, "System configuration retrieved successfully", result);
});

const getUptime = catchAsync(async (req, res) => {
  const result = await systemService.getUptime();
  sendSuccess(res, 200, "System uptime retrieved successfully", result);
});

const getPing = catchAsync(async (req, res) => {
  const result = await systemService.getPing();
  sendSuccess(res, 200, "Pong", result);
});

const getDatabaseStatus = catchAsync(async (req, res) => {
  const result = await systemService.getDatabaseStatus();
  sendSuccess(res, 200, "Database status retrieved successfully", result);
});

const getCacheStatus = catchAsync(async (req, res) => {
  const result = await systemService.getCacheStatus();
  sendSuccess(res, 200, "Cache status retrieved successfully", result);
});

const getStorageStatus = catchAsync(async (req, res) => {
  const result = await systemService.getStorageStatus();
  sendSuccess(res, 200, "Storage status retrieved successfully", result);
});

module.exports = {
  getVersion,
  getConfig,
  getUptime,
  getPing,
  getDatabaseStatus,
  getCacheStatus,
  getStorageStatus,
};
