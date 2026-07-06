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
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-[\]{};:'",.<>/?\\|`~]).{8,}$/)
      .message("Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special character, and be at least 8 characters long.")
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
