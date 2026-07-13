/**
 * @file authValidator.js
 * @description Joi validation schemas for Authentication APIs.
 */

"use strict";

const Joi = require("joi");

const register = {
  body: Joi.object().keys({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    name: Joi.string().min(2).max(100),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(6)
      .message("Password must be at least 6 characters long.")
      .required(),
    role: Joi.string().valid("customer", "admin", "vendor").default("customer"),
  })
  .xor("name", "firstName")
  .with("firstName", "lastName")
  .with("lastName", "firstName"),
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
