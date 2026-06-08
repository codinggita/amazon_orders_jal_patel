"use strict";

/**
 * @file search.routes.js
 * @description Express router for all Search API routes.
 *
 * BASE PATH (registered in app.js):
 *   /api/v1/orders/search
 *
 * ROUTE ORDER MATTERS:
 *   Static segments (e.g. /customer, /recent) MUST be defined BEFORE
 *   parameterised segments (e.g. /:id) to prevent Express from treating
 *   "customer" as a parameter value. All routes here are static — no issue.
 *
 * MIDDLEWARE CHAIN PER ROUTE:
 *   validate(schema) → controller function → asyncHandler → globalErrorHandler
 *
 * AUTHENTICATION:
 *   Search routes are intentionally left public (no protect middleware) for
 *   maximum discoverability. Add `protect` from authMiddleware if your project
 *   requires authentication for search operations.
 */

const express = require("express");
const searchController = require("../controllers/search.controller");
const validate = require("../middlewares/validate");
const searchValidator = require("../validators/search.validator");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// STATIC HISTORY ROUTES — defined first to avoid conflict with ?q routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/orders/search/recent
 * Returns the most recent search queries (in-memory, newest first).
 * Query: ?limit=10 (optional)
 */
router.get(
  "/recent",
  validate(searchValidator.recentPopularQuery),
  searchController.getRecentSearches
);


router.get(
  "/popular",
  validate(searchValidator.recentPopularQuery),
  searchController.getPopularSearches
);


router.get(
  "/",
  validate(searchValidator.searchQuery),
  searchController.globalSearch
);


router.get(
  "/customer",
  validate(searchValidator.searchQuery),
  searchController.searchByCustomer
);


router.get(
  "/product",
  validate(searchValidator.searchQuery),
  searchController.searchByProduct
);


router.get(
  "/category",
  validate(searchValidator.searchQuery),
  searchController.searchByCategory
);

/**
 * GET /api/v1/orders/search/brand?q=samsung
 * Search by product brand.
 */
router.get(
  "/brand",
  validate(searchValidator.searchQuery),
  searchController.searchByBrand
);

/**
 * GET /api/v1/orders/search/status?q=delivered
 * Search by order status (pending | processing | shipped | delivered | cancelled).
 */
router.get(
  "/status",
  validate(searchValidator.searchQuery),
  searchController.searchByStatus
);

/**
 * GET /api/v1/orders/search/payment?q=upi
 * Search by payment method (upi | card | netbanking | cod | wallet …).
 */
router.get(
  "/payment",
  validate(searchValidator.searchQuery),
  searchController.searchByPayment
);

/**
 * GET /api/v1/orders/search/location?q=delhi
 * Search by city, state, or country in shipping address.
 */
router.get(
  "/location",
  validate(searchValidator.searchQuery),
  searchController.searchByLocation
);

/**
 * GET /api/v1/orders/search/date?q=2025-01
 * Search by order date. Supports YYYY, YYYY-MM, YYYY-MM-DD.
 */
router.get(
  "/date",
  validate(searchValidator.dateSearchQuery),
  searchController.searchByDate
);

/**
 * GET /api/v1/orders/search/tracking?q=TRK123
 * Search by tracking ID or tracking number.
 */
router.get(
  "/tracking",
  validate(searchValidator.trackingSearchQuery),
  searchController.searchByTracking
);

/**
 * GET /api/v1/orders/search/fuzzy?q=headfone
 * Fuzzy (typo-tolerant) search across product names, categories, and brands.
 * "headfone" will match "headphone", "samsng" will match "samsung", etc.
 */
router.get(
  "/fuzzy",
  validate(searchValidator.searchQuery),
  searchController.fuzzySearch
);

/**
 * GET /api/v1/orders/search/autocomplete?q=iph
 * Returns distinct matching suggestions (product names, categories, brands, cities).
 */
router.get(
  "/autocomplete",
  validate(searchValidator.searchQuery),
  searchController.autocompleteSearch
);

/**
 * GET /api/v1/orders/search/highlight?q=mouse
 * Returns matched documents annotated with highlight metadata
 * (start/end character offsets for each match) for client-side rendering.
 */
router.get(
  "/highlight",
  validate(searchValidator.searchQuery),
  searchController.highlightSearch
);

module.exports = router;
