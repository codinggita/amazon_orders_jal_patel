/**
 * @file orderRoutes.js
 * @description Express routes for Orders API.
 *
 * This file maps HTTP verbs and URLs to their specific Controller functions.
 * It also applies the Joi validation middleware BEFORE the controller runs.
 */

"use strict";

const express = require("express");
const orderController = require("../controllers/orderController");
const validate = require("../middlewares/validate");
const orderValidator = require("../validators/orderValidator");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// ALL order routes require the user to be logged in
router.use(protect);

// Maps to /api/v1/orders
router
  .route("/")
  .post(validate(orderValidator.createOrder), orderController.createOrder)
  .get(restrictTo("admin"), validate(orderValidator.getOrders), orderController.getOrders);

// Maps to /api/v1/orders/:id
router
  .route("/:id")
  .get(validate(orderValidator.getOrder), orderController.getOrder)
  .patch(restrictTo("admin"), validate(orderValidator.updateOrder), orderController.updateOrder)
  .delete(restrictTo("admin"), validate(orderValidator.deleteOrder), orderController.deleteOrder);

module.exports = router;
