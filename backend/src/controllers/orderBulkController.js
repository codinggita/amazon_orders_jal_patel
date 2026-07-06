/**
 * @file orderBulkController.js
 * @description Phase 9 — HTTP Controller Handlers for Bulk Operations.
 *
 * CONTROLLER RESPONSIBILITIES:
 *  - Extract payload (arrays of IDs, update structures) from req.body.
 *  - Delegate bulk execution to orderBulkService.
 *  - Standardize API JSON response formats.
 *
 * NOTE ON EXCEPTION HANDLING:
 *  - Handled implicitly by `catchAsync` wrapper which intercepts any DB/Service errors.
 */

"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const orderBulkService = require("../services/orderBulkService");

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bulk Create Orders
// ─────────────────────────────────────────────────────────────────────────────
const createBulk = catchAsync(async (req, res) => {
  // Pass req.user to ensure user association during bulk processing
  const result = await orderBulkService.createOrdersInBulk(req.body.orders, req.user);
  sendSuccess(res, 201, "Bulk create operation completed.", result);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Bulk Update Orders (Distinct Updates)
// ─────────────────────────────────────────────────────────────────────────────
const updateBulk = catchAsync(async (req, res) => {
  const result = await orderBulkService.updateOrdersInBulk(req.body.updates);
  sendSuccess(res, 200, "Bulk update operation completed.", result);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bulk Delete Orders
// ─────────────────────────────────────────────────────────────────────────────
const deleteBulk = catchAsync(async (req, res) => {
  const result = await orderBulkService.deleteOrdersInBulk(req.body.orderIds);
  sendSuccess(res, 200, "Bulk delete operation completed.", result);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Bulk Update Status
// ─────────────────────────────────────────────────────────────────────────────
const updateStatusBulk = catchAsync(async (req, res) => {
  const { orderIds, status } = req.body;
  const result = await orderBulkService.updateOrdersStatus(orderIds, status);
  sendSuccess(res, 200, "Bulk status update operation completed.", result);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Bulk Archive Orders
// ─────────────────────────────────────────────────────────────────────────────
const archiveBulk = catchAsync(async (req, res) => {
  const result = await orderBulkService.archiveOrdersInBulk(req.body.orderIds);
  sendSuccess(res, 200, "Bulk archive operation completed.", result);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Bulk Restore Orders
// ─────────────────────────────────────────────────────────────────────────────
const restoreBulk = catchAsync(async (req, res) => {
  const result = await orderBulkService.restoreOrdersInBulk(req.body.orderIds);
  sendSuccess(res, 200, "Bulk restore operation completed.", result);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Bulk Apply Discount
// ─────────────────────────────────────────────────────────────────────────────
const applyDiscountBulk = catchAsync(async (req, res) => {
  const { orderIds, discountPercentage, discountAmount, reason } = req.body;
  const result = await orderBulkService.applyDiscountToOrders(
    orderIds,
    { discountPercentage, discountAmount, reason }
  );
  sendSuccess(res, 200, "Bulk discount applied successfully.", result);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Bulk Update Payment Status
// ─────────────────────────────────────────────────────────────────────────────
const updatePaymentStatusBulk = catchAsync(async (req, res) => {
  const { orderIds, paymentStatus } = req.body;
  const result = await orderBulkService.updatePaymentStatusInBulk(
    orderIds,
    paymentStatus
  );
  sendSuccess(res, 200, "Bulk payment status update completed.", result);
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Bulk Update Shipping Status
// ─────────────────────────────────────────────────────────────────────────────
const updateShippingStatusBulk = catchAsync(async (req, res) => {
  const { orderIds, shippingStatus, carrier, trackingNumber } = req.body;
  const result = await orderBulkService.updateShippingStatusInBulk(
    orderIds,
    { shippingStatus, carrier, trackingNumber }
  );
  sendSuccess(res, 200, "Bulk shipping status update completed.", result);
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Bulk Cleanup Cancelled Orders
// ─────────────────────────────────────────────────────────────────────────────
const cleanupCancelledBulk = catchAsync(async (req, res) => {
  const { olderThanDays } = req.body;
  const result = await orderBulkService.cleanupCancelledOrders(olderThanDays);
  sendSuccess(res, 200, "Cleanup of cancelled orders completed.", result);
});

module.exports = {
  createBulk,
  updateBulk,
  deleteBulk,
  updateStatusBulk,
  archiveBulk,
  restoreBulk,
  applyDiscountBulk,
  updatePaymentStatusBulk,
  updateShippingStatusBulk,
  cleanupCancelledBulk,
};
