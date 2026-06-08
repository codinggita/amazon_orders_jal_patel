"use strict";

/**
 * @file apiResponse.js
 * @description Utility for sending consistent JSON API responses as per user requirements.
 */

const sendSuccess = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = { sendSuccess };
