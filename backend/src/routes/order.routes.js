"use strict";

/**
 * @file order.routes.js
 * @description Express routes for Orders API.
 */

const express = require("express");
const orderController = require("../controllers/order.controller");
const validate = require("../middlewares/validate");
const orderValidator = require("../validators/order.validator");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(validate(orderValidator.createOrder), orderController.createOrder)
  .get(restrictTo("admin"), validate(orderValidator.getOrders), orderController.getOrders);

router.get(
  "/:orderId/exists",
  validate(orderValidator.checkOrderExists),
  orderController.checkOrderExists
);

router.get(
  "/:orderId/summary",
  validate(orderValidator.getOrderSummary),
  orderController.getOrderSummary
);

router.get(
  "/:orderId/items",
  validate(orderValidator.getOrderItems),
  orderController.getOrderItems
);

router.get(
  "/:orderId/history",
  validate(orderValidator.getOrderHistory),
  orderController.getOrderHistory
);

router.get(
  "/:orderId/invoice",
  validate(orderValidator.getOrderInvoice),
  orderController.getOrderInvoice
);

router.patch(
  "/:orderId/archive",
  restrictTo("admin"),
  validate(orderValidator.archiveOrder),
  orderController.archiveOrder
);

router.patch(
  "/:orderId/restore",
  restrictTo("admin"),
  validate(orderValidator.restoreOrder),
  orderController.restoreOrder
);

router.post(
  "/:orderId/cancel",
  validate(orderValidator.cancelOrder),
  orderController.cancelOrder
);

router.post(
  "/:orderId/duplicate",
  validate(orderValidator.duplicateOrder),
  orderController.duplicateOrder
);

router
  .route("/:orderId")
  .get(validate(orderValidator.getOrder), orderController.getOrder)
  .put(restrictTo("admin"), validate(orderValidator.replaceOrder), orderController.replaceOrder)
  .patch(restrictTo("admin"), validate(orderValidator.updateOrder), orderController.updateOrder)
  .delete(restrictTo("admin"), validate(orderValidator.deleteOrder), orderController.deleteOrder);

module.exports = router;
