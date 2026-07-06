"use strict";

/**
 * @file search.controller.js
 * @description Controller for all Search API endpoints.
 *
 * CONTROLLER RESPONSIBILITIES (strictly enforced):
 *   ✅ Receive req
 *   ✅ Call service layer
 *   ✅ Return standardised response
 *   ❌ NO MongoDB queries
 *   ❌ NO business logic
 *   ❌ NO data transformation (done in service)
 *
 * All routes are wrapped in asyncHandler so errors are forwarded
 * automatically to the global error handler (error.middleware.js).
 */

const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const searchService = require("../services/search.service");

// ── 1. Global Keyword Search ─────────────────────────────────────────────────
// GET /api/v1/orders/search?q=laptop
const globalSearch = asyncHandler(async (req, res) => {
  const result = await searchService.globalSearch(req.query);
  sendSuccess(res, 200, "Search completed successfully", result);
});

// ── 2. Customer Search ───────────────────────────────────────────────────────
// GET /api/v1/orders/search/customer?q=john
const searchByCustomer = asyncHandler(async (req, res) => {
  const result = await searchService.searchByCustomer(req.query);
  sendSuccess(res, 200, "Customer search completed successfully", result);
});

// ── 3. Product Search ────────────────────────────────────────────────────────
// GET /api/v1/orders/search/product?q=iphone
const searchByProduct = asyncHandler(async (req, res) => {
  const result = await searchService.searchByProduct(req.query);
  sendSuccess(res, 200, "Product search completed successfully", result);
});

// ── 4. Category Search ───────────────────────────────────────────────────────
// GET /api/v1/orders/search/category?q=electronics
const searchByCategory = asyncHandler(async (req, res) => {
  const result = await searchService.searchByCategory(req.query);
  sendSuccess(res, 200, "Category search completed successfully", result);
});

// ── 5. Brand Search ──────────────────────────────────────────────────────────
// GET /api/v1/orders/search/brand?q=samsung
const searchByBrand = asyncHandler(async (req, res) => {
  const result = await searchService.searchByBrand(req.query);
  sendSuccess(res, 200, "Brand search completed successfully", result);
});

// ── 6. Status Search ─────────────────────────────────────────────────────────
// GET /api/v1/orders/search/status?q=delivered
const searchByStatus = asyncHandler(async (req, res) => {
  const result = await searchService.searchByStatus(req.query);
  sendSuccess(res, 200, "Status search completed successfully", result);
});

// ── 7. Payment Method Search ─────────────────────────────────────────────────
// GET /api/v1/orders/search/payment?q=upi
const searchByPayment = asyncHandler(async (req, res) => {
  const result = await searchService.searchByPayment(req.query);
  sendSuccess(res, 200, "Payment search completed successfully", result);
});

// ── 8. Location Search ───────────────────────────────────────────────────────
// GET /api/v1/orders/search/location?q=delhi
const searchByLocation = asyncHandler(async (req, res) => {
  const result = await searchService.searchByLocation(req.query);
  sendSuccess(res, 200, "Location search completed successfully", result);
});

// ── 9. Date Search ───────────────────────────────────────────────────────────
// GET /api/v1/orders/search/date?q=2025-01
const searchByDate = asyncHandler(async (req, res) => {
  const result = await searchService.searchByDate(req.query);
  sendSuccess(res, 200, "Date search completed successfully", result);
});

// ── 10. Tracking ID Search ───────────────────────────────────────────────────
// GET /api/v1/orders/search/tracking?q=TRK123
const searchByTracking = asyncHandler(async (req, res) => {
  const result = await searchService.searchByTracking(req.query);
  sendSuccess(res, 200, "Tracking search completed successfully", result);
});

// ── 11. Fuzzy Search ─────────────────────────────────────────────────────────
// GET /api/v1/orders/search/fuzzy?q=headfone
const fuzzySearch = asyncHandler(async (req, res) => {
  const result = await searchService.fuzzySearch(req.query);
  sendSuccess(res, 200, "Fuzzy search completed successfully", result);
});

// ── 12. Autocomplete Search ──────────────────────────────────────────────────
// GET /api/v1/orders/search/autocomplete?q=iph
const autocompleteSearch = asyncHandler(async (req, res) => {
  const result = await searchService.autocompleteSearch(req.query);
  sendSuccess(res, 200, "Autocomplete suggestions retrieved successfully", result);
});

// ── 13. Highlight Search ─────────────────────────────────────────────────────
// GET /api/v1/orders/search/highlight?q=mouse
const highlightSearch = asyncHandler(async (req, res) => {
  const result = await searchService.highlightSearch(req.query);
  sendSuccess(res, 200, "Highlight search completed successfully", result);
});

// ── 14. Recent Searches ──────────────────────────────────────────────────────
// GET /api/v1/orders/search/recent
const getRecentSearches = asyncHandler(async (req, res) => {
  const result = searchService.getRecentSearchHistory(req.query);
  sendSuccess(res, 200, "Recent searches retrieved successfully", result);
});

// ── 15. Popular Searches ─────────────────────────────────────────────────────
// GET /api/v1/orders/search/popular
const getPopularSearches = asyncHandler(async (req, res) => {
  const result = searchService.getPopularSearchHistory(req.query);
  sendSuccess(res, 200, "Popular searches retrieved successfully", result);
});

module.exports = {
  globalSearch,
  searchByCustomer,
  searchByProduct,
  searchByCategory,
  searchByBrand,
  searchByStatus,
  searchByPayment,
  searchByLocation,
  searchByDate,
  searchByTracking,
  fuzzySearch,
  autocompleteSearch,
  highlightSearch,
  getRecentSearches,
  getPopularSearches,
};
