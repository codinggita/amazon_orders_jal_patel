"use strict";

/**
 * @file order.validator.js
 * @description Joi validation schemas for all Order APIs.
 */

const Joi = require("joi");

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ID format. Must be a 24-character hex string.");

const orderIdParam = {
  params: Joi.object().keys({
    orderId: objectId.required(),
  }),
};

const createOrder = {
  body: Joi.object().keys({
    user: objectId.required(),
    orderItems: Joi.array()
      .items(
        Joi.object().keys({
          product: objectId.required(),
          name: Joi.string().required(),
          price: Joi.number().min(0).required(),
          quantity: Joi.number().integer().min(1).required(),
          image: Joi.string().optional(),
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object()
      .keys({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().required(),
      })
      .required(),
    itemsPrice: Joi.number().min(0).required(),
    taxPrice: Joi.number().min(0).required(),
    shippingPrice: Joi.number().min(0).required(),
    totalPrice: Joi.number().min(0).required(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: objectId.required(),
  }),
};

const getOrders = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    sort: Joi.string(),
    fields: Joi.string(),
    search: Joi.string(),
  }).unknown(true),
};

const updateOrder = {
  params: Joi.object().keys({
    orderId: objectId.required(),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string().valid("pending", "processing", "shipped", "delivered", "cancelled"),
    })
    .min(1),
};

const deleteOrder = {
  params: Joi.object().keys({
    orderId: objectId.required(),
  }),
};

const replaceOrder = {
  params: Joi.object().keys({
    orderId: objectId.required(),
  }),
  body: Joi.object().keys({
    user: objectId.required(),
    orderItems: Joi.array()
      .items(
        Joi.object().keys({
          product: objectId.required(),
          name: Joi.string().required(),
          price: Joi.number().min(0).required(),
          quantity: Joi.number().integer().min(1).required(),
          image: Joi.string().optional(),
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object()
      .keys({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().required(),
      })
      .required(),
    itemsPrice: Joi.number().min(0).required(),
    taxPrice: Joi.number().min(0).required(),
    shippingPrice: Joi.number().min(0).required(),
    totalPrice: Joi.number().min(0).required(),
    status: Joi.string().valid("pending", "processing", "shipped", "delivered", "cancelled").optional(),
  }),
};

const checkOrderExists = orderIdParam;
const getOrderSummary = orderIdParam;
const getOrderItems = orderIdParam;
const getOrderHistory = orderIdParam;
const archiveOrder = orderIdParam;
const restoreOrder = orderIdParam;

const cancelOrder = {
  params: Joi.object().keys({
    orderId: objectId.required(),
  }),
  body: Joi.object().keys({
    cancelReason: Joi.string()
      .trim()
      .min(5)
      .max(500)
      .required()
      .messages({
        "string.min": "Cancellation reason must be at least 5 characters.",
        "string.max": "Cancellation reason must not exceed 500 characters.",
        "any.required": "A cancellation reason is required.",
      }),
  }),
};

const duplicateOrder = orderIdParam;
const getOrderInvoice = orderIdParam;

module.exports = {
  createOrder,
  getOrder,
  getOrders,
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
