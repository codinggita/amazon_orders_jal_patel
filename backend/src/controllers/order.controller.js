"use strict";

/**
 * @file order.controller.js
 * @description Controller for all Order APIs.
 */

const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const orderService = require("../services/order.service");

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  sendSuccess(res, 201, "Order created successfully", order);
});

const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.queryOrders(req.query);
  sendSuccess(res, 200, "Orders retrieved successfully", result);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  sendSuccess(res, 200, "Order retrieved successfully", order);
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderById(req.params.orderId, req.body);
  sendSuccess(res, 200, "Order updated successfully", order);
});

const deleteOrder = asyncHandler(async (req, res) => {
  await orderService.deleteOrderById(req.params.orderId);
  sendSuccess(res, 200, "Order deleted successfully");
});

const replaceOrder = asyncHandler(async (req, res) => {
  const order = await orderService.replaceOrderById(req.params.orderId, req.body);
  sendSuccess(res, 200, "Order replaced successfully", order);
});

const checkOrderExists = asyncHandler(async (req, res) => {
  const result = await orderService.checkOrderExists(req.params.orderId);
  sendSuccess(res, 200, "Order existence checked", result);
});

const getOrderSummary = asyncHandler(async (req, res) => {
  const summary = await orderService.getOrderSummary(req.params.orderId);
  sendSuccess(res, 200, "Order summary retrieved", summary);
});

const getOrderItems = asyncHandler(async (req, res) => {
  const items = await orderService.getOrderItems(req.params.orderId);
  sendSuccess(res, 200, "Order items retrieved", items);
});

const getOrderHistory = asyncHandler(async (req, res) => {
  const history = await orderService.getOrderHistory(req.params.orderId);
  sendSuccess(res, 200, "Order history retrieved", history);
});

const archiveOrder = asyncHandler(async (req, res) => {
  const order = await orderService.archiveOrder(req.params.orderId, req.user ? req.user.email : "system");
  sendSuccess(res, 200, "Order archived successfully", order);
});

const restoreOrder = asyncHandler(async (req, res) => {
  const order = await orderService.restoreOrder(req.params.orderId, req.user ? req.user.email : "system");
  sendSuccess(res, 200, "Order restored successfully", order);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(
    req.params.orderId,
    req.body.cancelReason,
    req.user ? req.user.email : "system"
  );
  sendSuccess(res, 200, "Order cancelled successfully", order);
});

const duplicateOrder = asyncHandler(async (req, res) => {
  const result = await orderService.duplicateOrder(req.params.orderId);
  sendSuccess(res, 201, "Order duplicated successfully", result);
});

const getOrderInvoice = asyncHandler(async (req, res) => {
  const invoice = await orderService.getOrderInvoice(req.params.orderId);
  sendSuccess(res, 200, "Order invoice generated", invoice);
});

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  replaceOrder,
  deleteOrder,
  checkOrderExists,
  getOrderSummary,
  getOrderItems,
  getOrderHistory,
  archiveOrder,
  restoreOrder,
  cancelOrder,
  duplicateOrder,
  getOrderInvoice,
};
