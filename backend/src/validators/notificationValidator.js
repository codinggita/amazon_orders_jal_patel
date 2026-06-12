"use strict";

const Joi = require("joi");

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ID format. Must be a 24-character hex string.");

const getNotifications = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    unreadOnly: Joi.boolean().default(false),
    type: Joi.string().valid(
      "order_update",
      "shipping_update",
      "promotion",
      "system",
      "account",
      "payment"
    ),
  }),
};

const markAsRead = {
  params: Joi.object().keys({
    id: objectId.required(),
  }),
};

const deleteNotification = {
  params: Joi.object().keys({
    id: objectId.required(),
  }),
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
};
