/**
 * @file authValidator.js
 * @description Joi validation schemas for Authentication APIs.
 */

"use strict";

const Joi = require("joi");

const register = {
  body: Joi.object().keys({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .message("Password must be alphanumeric and at least 8 characters long.")
      .required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
};
