"use strict";

/**
 * @file apiResponse.js
 * @description Utility for sending consistent JSON API responses.
 *
 * SUCCESS shape:
 *   { success: true,  message: "...", data: {...} }
 *
 * ERROR shape:
 *   { success: false, message: "...", error: {...} }
 */

/**
 * Send a standardised success response.
 * @param {import('express').Response} res
 * @param {number}  statusCode - HTTP status (200, 201, …)
 * @param {string}  message
 * @param {*}       [data={}]
 */
const sendSuccess = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({ success: true, message, data });

/**
 * Send a standardised error response.
 * Prefer throwing ApiError and letting the global error handler call this;
 * use directly only when you need fine-grained control from a controller.
 * @param {import('express').Response} res
 * @param {number}  statusCode - HTTP status (400, 404, 500, …)
 * @param {string}  message
 * @param {*}       [error={}]
 */
const sendError = (res, statusCode, message, error = {}) =>
  res.status(statusCode).json({ success: false, message, error });

module.exports = { sendSuccess, sendError };
