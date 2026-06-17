"use strict";

const express = require("express");
const validateController = require("../controllers/validateController");
const validateValidator = require("../validators/validateValidator");
const validate = require("../middlewares/validate");

const router = express.Router();

router.post(
  "/order",
  validate(validateValidator.validateOrder),
  validateController.validateOrder
);

router.patch(
  "/order/:id",
  validate(validateValidator.validateOrderUpdate),
  validateController.validateOrderUpdate
);

router.post(
  "/payment",
  validate(validateValidator.validatePayment),
  validateController.validatePayment
);

router.post(
  "/address",
  validate(validateValidator.validateAddress),
  validateController.validateAddress
);

router.post(
  "/auth/register",
  validate(validateValidator.validateAuthRegister),
  validateController.validateAuthRegister
);

router.post(
  "/auth/login",
  validate(validateValidator.validateAuthLogin),
  validateController.validateAuthLogin
);

router.post(
  "/product",
  validate(validateValidator.validateProduct),
  validateController.validateProduct
);

router.post(
  "/refund",
  validate(validateValidator.validateRefund),
  validateController.validateRefund
);

router.post(
  "/coupon",
  validate(validateValidator.validateCoupon),
  validateController.validateCoupon
);

router.post(
  "/upload",
  validate(validateValidator.validateUpload),
  validateController.validateUpload
);

module.exports = router;
