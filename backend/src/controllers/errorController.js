"use strict";

const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const notFound = catchAsync(async (req, res) => {
  throw new ApiError("The requested resource was not found on this server.", 404);
});

const serverError = catchAsync(async (req, res) => {
  throw new Error("Internal server error — something went wrong on the server.");
});

const databaseError = catchAsync(async (req, res) => {
  throw new ApiError("Database connection failed. Please try again later.", 503);
});

const validationError = catchAsync(async (req, res) => {
  throw new ApiError("Validation failed: 'email' must be a valid email address.", 422);
});

const rateLimitError = catchAsync(async (req, res) => {
  throw new ApiError("Too many requests. Please slow down and try again in 60 seconds.", 429);
});

const tokenExpiredError = catchAsync(async (req, res) => {
  const err = new ApiError("Your session token has expired. Please log in again.", 401);
  err.name = "TokenExpiredError";
  throw err;
});

const paymentFailedError = catchAsync(async (req, res) => {
  throw new ApiError("Payment declined. Insufficient funds or card expired.", 402);
});

const shippingFailedError = catchAsync(async (req, res) => {
  throw new ApiError("Shipping service unavailable. Unable to process delivery.", 500);
});

const uploadError = catchAsync(async (req, res) => {
  throw new ApiError("File upload failed. File size exceeds the 5 MB limit.", 413);
});

const cacheError = catchAsync(async (req, res) => {
  throw new ApiError("Cache service is unreachable. Please try again later.", 503);
});

module.exports = {
  notFound,
  serverError,
  databaseError,
  validationError,
  rateLimitError,
  tokenExpiredError,
  paymentFailedError,
  shippingFailedError,
  uploadError,
  cacheError,
};
