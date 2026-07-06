"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const trendingService = require("../services/trendingService");

const getTrendingProducts = catchAsync(async (req, res) => {
  const result = await trendingService.getTrendingProducts(
    req.query.period,
    req.query.limit
  );
  sendSuccess(res, 200, "Trending products retrieved successfully", result);
});

const getTrendingCategories = catchAsync(async (req, res) => {
  const result = await trendingService.getTrendingCategories(
    req.query.period,
    req.query.limit
  );
  sendSuccess(res, 200, "Trending categories retrieved successfully", result);
});

module.exports = {
  getTrendingProducts,
  getTrendingCategories,
};
