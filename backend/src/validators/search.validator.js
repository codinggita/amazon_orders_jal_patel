"use strict";

/**
 * @file search.validator.js
 * @description Joi validation schemas for all Search API endpoints.
 *
 * VALIDATION STRATEGY:
 *  - searchQuery        → general q param (min 1 char) used by 11 routes
 *  - dateSearchQuery    → q must match YYYY | YYYY-MM | YYYY-MM-DD
 *  - trackingSearchQuery → q must be min 3 chars (tracking IDs are short)
 *  - recentPopularQuery → no q required; optional limit only
 *
 * The validate() middleware in middlewares/validate.js applies these schemas
 * to req.query before the request ever reaches the controller.
 */

const Joi = require("joi");

// ── Shared base for q parameter ───────────────────────────────────────────────

const qString = Joi.string().trim().min(1).max(200);

// ── Pagination (optional on every search) ────────────────────────────────────

const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. General Search — used by: global, customer, product, category, brand,
//    status, payment, location, fuzzy, autocomplete, highlight
// ─────────────────────────────────────────────────────────────────────────────
const searchQuery = {
  query: Joi.object().keys({
    q: qString.required().messages({
      "string.empty": "Search query cannot be empty.",
      "string.min": "Search query must be at least 1 character.",
      "string.max": "Search query must not exceed 200 characters.",
      "any.required": "Query parameter 'q' is required.",
    }),
    ...pagination,
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Date Search — q must be YYYY, YYYY-MM, or YYYY-MM-DD
// ─────────────────────────────────────────────────────────────────────────────
const dateSearchQuery = {
  query: Joi.object().keys({
    q: Joi.string()
      .trim()
      .pattern(/^\d{4}(-\d{2})?(-\d{2})?$/)
      .required()
      .messages({
        "string.empty": "Date query cannot be empty.",
        "string.pattern.base":
          "Date must be in format YYYY, YYYY-MM, or YYYY-MM-DD (e.g. 2025, 2025-01, 2025-01-15).",
        "any.required": "Query parameter 'q' is required.",
      }),
    ...pagination,
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Tracking ID Search — q min 3 chars
// ─────────────────────────────────────────────────────────────────────────────
const trackingSearchQuery = {
  query: Joi.object().keys({
    q: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .required()
      .messages({
        "string.empty": "Tracking ID cannot be empty.",
        "string.min": "Tracking ID must be at least 3 characters.",
        "string.max": "Tracking ID must not exceed 100 characters.",
        "any.required": "Query parameter 'q' is required.",
      }),
    ...pagination,
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Recent / Popular — no q, only optional limit
// ─────────────────────────────────────────────────────────────────────────────
const recentPopularQuery = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
};

module.exports = {
  searchQuery,
  dateSearchQuery,
  trackingSearchQuery,
  recentPopularQuery,
};
