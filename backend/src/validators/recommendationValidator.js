"use strict";

const Joi = require("joi");

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ID format. Must be a 24-character hex string.");

const getProductRecommendations = {
  params: Joi.object().keys({
    customerId: objectId.required(),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
};

const getOrderRecommendations = {
  params: Joi.object().keys({
    orderId: objectId.required(),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
};

module.exports = {
  getProductRecommendations,
  getOrderRecommendations,
};
