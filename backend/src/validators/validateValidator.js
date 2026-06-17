"use strict";

const Joi = require("joi");

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ID format. Must be a 24-character hex string.");

const validateOrder = {
  body: Joi.object().keys({
    user: objectId.optional(),
    orderItems: Joi.array()
      .items(
        Joi.object({
          product: objectId.required(),
          name: Joi.string().required(),
          price: Joi.number().min(0).required(),
          quantity: Joi.number().integer().min(1).required(),
          image: Joi.string().optional(),
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
    itemsPrice: Joi.number().min(0).required(),
    taxPrice: Joi.number().min(0).required(),
    shippingPrice: Joi.number().min(0).required(),
    totalPrice: Joi.number().min(0).required(),
  }),
};

const validateOrderUpdate = {
  params: Joi.object().keys({
    id: objectId.required(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .valid("pending", "processing", "shipped", "delivered", "cancelled")
      .optional(),
    shippingAddress: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      postalCode: Joi.string(),
      country: Joi.string(),
    }).optional(),
    itemsPrice: Joi.number().min(0).optional(),
    taxPrice: Joi.number().min(0).optional(),
    shippingPrice: Joi.number().min(0).optional(),
    totalPrice: Joi.number().min(0).optional(),
  }).min(1),
};

const validatePayment = {
  body: Joi.object().keys({
    order: objectId.required(),
    user: objectId.required(),
    paymentMethod: Joi.string()
      .valid("credit_card", "paypal", "stripe", "amazon_pay")
      .required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().default("USD"),
  }),
};

const validateAddress = {
  body: Joi.object().keys({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
    isDefault: Joi.boolean().default(false),
  }),
};

const validateAuthRegister = {
  body: Joi.object().keys({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    phone: Joi.string().optional(),
  }),
};

const validateAuthLogin = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const validateProduct = {
  body: Joi.object().keys({
    name: Joi.string().min(2).max(200).required(),
    sku: Joi.string().uppercase().required(),
    description: Joi.string().optional(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).default(0),
    category: objectId.required(),
    images: Joi.array().items(Joi.string()).max(10).optional(),
    isActive: Joi.boolean().default(true),
  }),
};

const validateRefund = {
  body: Joi.object().keys({
    order: objectId.required(),
    amount: Joi.number().positive().optional(),
    reason: Joi.string().min(5).max(500).required(),
  }),
};

const validateCoupon = {
  body: Joi.object().keys({
    code: Joi.string().min(3).max(20).uppercase().required(),
    discountPercentage: Joi.number().min(1).max(100).optional(),
    discountAmount: Joi.number().positive().optional(),
    minOrderValue: Joi.number().min(0).optional(),
    expiresAt: Joi.date().iso().optional(),
    maxUses: Joi.number().integer().min(1).optional(),
  }).min(2),
};

const validateUpload = {
  body: Joi.object().keys({
    fileName: Joi.string().required(),
    fileSize: Joi.number().max(5242880).optional(),
    fileType: Joi.string()
      .valid("image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf")
      .optional(),
    destination: Joi.string().optional(),
  }),
};

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
