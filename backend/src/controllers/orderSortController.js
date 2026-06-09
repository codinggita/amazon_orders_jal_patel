"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const orderSortService = require("../services/orderSortService");

exports.sortByHighestValue = catchAsync(async (req, res) => {
  const result = await orderSortService.sortByHighestValue();
  sendSuccess(res, 200, "Orders sorted by highest value", result);
});

exports.sortByLowestValue = catchAsync(async (req, res) => {
  const result = await orderSortService.sortByLowestValue();
  sendSuccess(res, 200, "Orders sorted by lowest value", result);
});

exports.sortByLatest = catchAsync(async (req, res) => {
  const result = await orderSortService.sortByLatest();
  sendSuccess(res, 200, "Latest orders", result);
});

exports.sortByOldest = catchAsync(async (req, res) => {
  const result = await orderSortService.sortByOldest();
  sendSuccess(res, 200, "Oldest orders", result);
});

exports.sortByMostItems = catchAsync(async (req, res) => {
  const result = await orderSortService.sortByMostItems();
  sendSuccess(res, 200, "Orders sorted by most items", result);
});

exports.sortByLeastItems = catchAsync(async (req, res) => {
  const result = await orderSortService.sortByLeastItems();
  sendSuccess(res, 200, "Orders sorted by least items", result);
});

exports.sortByDiscountAmount = catchAsync(async (req, res) => {
  const result = await orderSortService.sortByDiscountAmount();
  sendSuccess(res, 200, "Orders sorted by discount amount", result);
});
