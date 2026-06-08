"use strict";

/**
 * @file error.middleware.js
 * @description Global error-handling middleware for Express.
 */

const config = require("../config/env");
const ApiError = require("../utils/ApiError");

const handleCastError = (err) =>
  new ApiError(`Invalid value for field: ${err.path}`, 400);

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new ApiError(
    `Duplicate value "${value}" for field "${field}". Please use another value.`,
    409
  );
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new ApiError(`Validation failed: ${messages.join(". ")}`, 422);
};

const sendDevError = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Operation failed",
    error: err,
    stack: err.stack
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "Operation failed",
      error: {}
    });
  }

  console.error("💥 UNHANDLED ERROR:", err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
    error: {}
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (config.isDev) {
    sendDevError(err, res);
  } else {
    let error = { ...err, message: err.message };

    if (err.name === "CastError") error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicateKeyError(error);
    if (err.name === "ValidationError") error = handleValidationError(error);

    sendProdError(error, res);
  }
};

module.exports = globalErrorHandler;
