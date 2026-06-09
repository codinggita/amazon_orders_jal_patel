"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const paginationService = require("../services/orderPaginationService");

exports.getPagedOrders = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await paginationService.getPagedOrders(page, limit);
  sendSuccess(res, 200, "Paged orders retrieved", result);
});

exports.getInfiniteScrollOrders = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await paginationService.getInfiniteScrollOrders(page, limit);
  sendSuccess(res, 200, "Infinite scroll orders retrieved", result);
});

exports.getRecentOrders = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await paginationService.getRecentOrders(page, limit);
  sendSuccess(res, 200, "Recent orders retrieved", result);
});

exports.getCancelledOrders = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await paginationService.getCancelledOrders(page, limit);
  sendSuccess(res, 200, "Paginated cancelled orders retrieved", result);
});

exports.getRefundedOrders = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await paginationService.getRefundedOrders(page, limit);
  sendSuccess(res, 200, "Paginated refunded orders retrieved", result);
});

exports.getCustomerOrders = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const { page, limit } = req.query;
  const result = await paginationService.getCustomerOrders(customerId, page, limit);
  sendSuccess(res, 200, "Customer orders retrieved", result);
});

exports.getProductOrders = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { page, limit } = req.query;
  const result = await paginationService.getProductOrders(productId, page, limit);
  sendSuccess(res, 200, "Product orders retrieved", result);
});
