"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const orderFilterService = require("../services/orderFilterService");

exports.filterByStatus = catchAsync(async (req, res) => {
  const { type } = req.query;
  const result = await orderFilterService.filterByStatus(type);
  sendSuccess(res, 200, `Orders filtered by status: ${type}`, result);
});

exports.filterByPayment = catchAsync(async (req, res) => {
  const { method } = req.query;
  const result = await orderFilterService.filterByPayment(method);
  sendSuccess(res, 200, `Orders filtered by payment method: ${method}`, result);
});

exports.filterByCategory = catchAsync(async (req, res) => {
  const { name } = req.query;
  const result = await orderFilterService.filterByCategory(name);
  sendSuccess(res, 200, `Orders filtered by category: ${name}`, result);
});

exports.filterByBrand = catchAsync(async (req, res) => {
  const { name } = req.query;
  const result = await orderFilterService.filterByBrand(name);
  sendSuccess(res, 200, `Orders filtered by brand: ${name}`, result);
});

exports.filterByPrice = catchAsync(async (req, res) => {
  const { min, max } = req.query;
  const result = await orderFilterService.filterByPrice(min, max);
  sendSuccess(res, 200, `Orders filtered by price range: ${min}-${max}`, result);
});

exports.filterByDate = catchAsync(async (req, res) => {
  const { start, end } = req.query;
  const result = await orderFilterService.filterByDate(start, end);
  sendSuccess(res, 200, `Orders filtered by date range: ${start} to ${end}`, result);
});

exports.filterByCountry = catchAsync(async (req, res) => {
  const { name } = req.query;
  const result = await orderFilterService.filterByCountry(name);
  sendSuccess(res, 200, `Orders filtered by country: ${name}`, result);
});

exports.filterByState = catchAsync(async (req, res) => {
  const { name } = req.query;
  const result = await orderFilterService.filterByState(name);
  sendSuccess(res, 200, `Orders filtered by state: ${name}`, result);
});

exports.filterByCity = catchAsync(async (req, res) => {
  const { name } = req.query;
  const result = await orderFilterService.filterByCity(name);
  sendSuccess(res, 200, `Orders filtered by city: ${name}`, result);
});

exports.filterByHighValue = catchAsync(async (req, res) => {
  const { amount } = req.query;
  const result = await orderFilterService.filterByHighValue(amount);
  sendSuccess(res, 200, `High value orders (>= ${amount})`, result);
});

exports.filterByDiscounted = catchAsync(async (req, res) => {
  const result = await orderFilterService.filterByDiscounted();
  sendSuccess(res, 200, "Discounted orders retrieved", result);
});

exports.filterByCancelled = catchAsync(async (req, res) => {
  const result = await orderFilterService.filterByCancelled();
  sendSuccess(res, 200, "Cancelled orders retrieved", result);
});

exports.filterByRefunded = catchAsync(async (req, res) => {
  const result = await orderFilterService.filterByRefunded();
  sendSuccess(res, 200, "Refunded orders retrieved", result);
});

exports.filterByShipped = catchAsync(async (req, res) => {
  const result = await orderFilterService.filterByShipped();
  sendSuccess(res, 200, "Shipped orders retrieved", result);
});

exports.filterByDelivered = catchAsync(async (req, res) => {
  const result = await orderFilterService.filterByDelivered();
  sendSuccess(res, 200, "Delivered orders retrieved", result);
});
