/**
 * @file orderController.js
 * @description Controller for Order APIs.
 *
 * WHY THIS EXISTS:
 * Controllers act as the glue between the HTTP request and the Service layer.
 * They extract data from `req.body` or `req.params`, pass it to the Service,
 * and then format the successful response using `ApiResponse`.
 * 
 * Notice how there are NO try/catch blocks here. The `catchAsync` wrapper
 * automatically handles rejected promises.
 */

"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/ApiResponse");
const orderService = require("../services/orderService");

/**
 * @desc    Create a new order
 * @route   POST /api/v1/orders
 * @access  Private (Assume JWT Auth in future phase)
 */
const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  sendSuccess(res, 201, "Order created successfully", order);
});

/**
 * @desc    Get all orders (with advanced search, filter, sort, pagination)
 * @route   GET /api/v1/orders
 * @access  Private/Admin
 */
const getOrders = catchAsync(async (req, res) => {
  // We simply pass the entire req.query object to the service.
  // The QueryBuilder handles extracting what it needs.
  const result = await orderService.queryOrders(req.query);
  sendSuccess(res, 200, "Orders retrieved successfully", result);
});

/**
 * @desc    Get order by ID
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  sendSuccess(res, 200, "Order retrieved successfully", order);
});

/**
 * @desc    Update order status
 * @route   PATCH /api/v1/orders/:id
 * @access  Private/Admin
 */
const updateOrder = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderById(req.params.id, req.body);
  sendSuccess(res, 200, "Order updated successfully", order);
});

/**
 * @desc    Delete order by ID
 * @route   DELETE /api/v1/orders/:id
 * @access  Private/Admin
 */
const deleteOrder = catchAsync(async (req, res) => {
  await orderService.deleteOrderById(req.params.id);
  // Using 200 instead of 204 so we can still return our standardized JSON message
  sendSuccess(res, 200, "Order deleted successfully");
});

/**
 * @desc    Replace entire order information
 * @route   PUT /api/v1/orders/:id
 * @access  Private/Admin
 */
const replaceOrder = catchAsync(async (req, res) => {
  const order = await orderService.replaceOrderById(req.params.id, req.body);
  sendSuccess(res, 200, "Order replaced successfully", order);
});

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  replaceOrder,
  deleteOrder,
};
