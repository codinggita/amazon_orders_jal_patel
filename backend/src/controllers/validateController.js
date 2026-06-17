"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const validateService = require("../services/validateService");

const validateOrder = catchAsync(async (req, res) => {
  const result = await validateService.validateOrderData(req.body);
  sendSuccess(res, 200, "Order validation completed", result);
});

const validateOrderUpdate = catchAsync(async (req, res) => {
  const result = await validateService.validateOrderUpdateData(
    req.params.id,
    req.body
  );
  sendSuccess(res, 200, "Order update validation completed", result);
});

const validatePayment = catchAsync(async (req, res) => {
  const result = await validateService.validatePaymentData(req.body);
  sendSuccess(res, 200, "Payment validation completed", result);
});

const validateAddress = catchAsync(async (req, res) => {
  const result = await validateService.validateAddressData(req.body);
  sendSuccess(res, 200, "Address validation completed", result);
});

const validateAuthRegister = catchAsync(async (req, res) => {
  const result = await validateService.validateAuthRegisterData(req.body);
  sendSuccess(res, 200, "Registration validation completed", result);
});

const validateAuthLogin = catchAsync(async (req, res) => {
  const result = await validateService.validateAuthLoginData(req.body);
  sendSuccess(res, 200, "Login validation completed", result);
});

const validateProduct = catchAsync(async (req, res) => {
  const result = await validateService.validateProductData(req.body);
  sendSuccess(res, 200, "Product validation completed", result);
});

const validateRefund = catchAsync(async (req, res) => {
  const result = await validateService.validateRefundData(req.body);
  sendSuccess(res, 200, "Refund validation completed", result);
});

const validateCoupon = catchAsync(async (req, res) => {
  const result = await validateService.validateCouponData(req.body);
  sendSuccess(res, 200, "Coupon validation completed", result);
});

const validateUpload = catchAsync(async (req, res) => {
  const result = await validateService.validateUploadData(req.body);
  sendSuccess(res, 200, "Upload validation completed", result);
});

module.exports = {
  validateOrder,
  validateOrderUpdate,
  validatePayment,
  validateAddress,
  validateAuthRegister,
  validateAuthLogin,
  validateProduct,
  validateRefund,
  validateCoupon,
  validateUpload,
};
