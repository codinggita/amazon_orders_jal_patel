"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const recommendationService = require("../services/recommendationService");

const getProductRecommendations = catchAsync(async (req, res) => {
  const result = await recommendationService.getProductRecommendations(
    req.params.customerId,
    req.query.limit
  );
  sendSuccess(
    res,
    200,
    "Product recommendations retrieved successfully",
    result
  );
});

const getOrderRecommendations = catchAsync(async (req, res) => {
  const result = await recommendationService.getOrderRecommendations(
    req.params.orderId,
    req.query.limit
  );
  sendSuccess(
    res,
    200,
    "Order recommendations retrieved successfully",
    result
  );
});

module.exports = {
  getProductRecommendations,
  getOrderRecommendations,
};
