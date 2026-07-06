"use strict";

/**
 * @file search.service.js
 * @description All search operations backed by the real AmazonOrder "database" collection.
 *
 * Field mapping (flat schema):
 *   CustomerName, CustomerID, ProductName, Category, Brand, OrderStatus,
 *   PaymentMethod, City, State, Country, OrderID, OrderDate, TotalAmount
 */

const AmazonOrder = require("../models/AmazonOrder");
const {
  buildRegex,
  buildFuzzyRegex,
  buildPrefixRegex,
  getPagination,
  buildHighlight,
  parseDateRange,
  recordSearch,
  getRecentSearches,
  getPopularSearches,
} = require("../utils/searchHelpers");

/**
 * Internal helper — runs find + count against AmazonOrder.
 */
const runSearch = async (filter, { page, limit, skip }, projection = {}) => {
  const [results, total] = await Promise.all([
    AmazonOrder.find(filter, projection).skip(skip).limit(limit).lean(),
    AmazonOrder.countDocuments(filter),
  ]);
  return {
    results,
    pagination: {
      total,
      page,
      limit,
      pages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

// ─── 1. Global Keyword Search ─────────────────────────────────────────────────
// GET /api/v1/orders/search?q=laptop
const globalSearch = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "global");

  const filter = {
    $or: [
      { CustomerName:  regex },
      { CustomerID:    regex },
      { ProductName:   regex },
      { Category:      regex },
      { Brand:         regex },
      { OrderID:       regex },
      { City:          regex },
      { State:         regex },
      { Country:       regex },
      { PaymentMethod: regex },
      { OrderStatus:   regex },
    ],
  };
  return runSearch(filter, paging);
};

// ─── 2. Customer Name Search ──────────────────────────────────────────────────
// GET /api/v1/orders/search/customer?q=john
const searchByCustomer = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "customer");

  const filter = {
    $or: [{ CustomerName: regex }, { CustomerID: regex }],
  };
  return runSearch(filter, paging);
};

// ─── 3. Product Name Search ───────────────────────────────────────────────────
// GET /api/v1/orders/search/product?q=iphone
const searchByProduct = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "product");

  return runSearch({ ProductName: regex }, paging);
};

// ─── 4. Category Search ───────────────────────────────────────────────────────
// GET /api/v1/orders/search/category?q=electronics
const searchByCategory = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "category");

  return runSearch({ Category: regex }, paging);
};

// ─── 5. Brand Search ──────────────────────────────────────────────────────────
// GET /api/v1/orders/search/brand?q=samsung
const searchByBrand = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "brand");

  return runSearch({ Brand: regex }, paging);
};

// ─── 6. Status Search ─────────────────────────────────────────────────────────
// GET /api/v1/orders/search/status?q=delivered
const searchByStatus = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "status");

  return runSearch({ OrderStatus: regex }, paging);
};

// ─── 7. Payment Method Search ─────────────────────────────────────────────────
// GET /api/v1/orders/search/payment?q=upi
const searchByPayment = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "payment");

  return runSearch({ PaymentMethod: regex }, paging);
};

// ─── 8. Location Search ───────────────────────────────────────────────────────
// GET /api/v1/orders/search/location?q=delhi
const searchByLocation = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "location");

  const filter = {
    $or: [{ City: regex }, { State: regex }, { Country: regex }],
  };
  return runSearch(filter, paging);
};

// ─── 9. Date Search ───────────────────────────────────────────────────────────
// GET /api/v1/orders/search/date?q=2025-01
const searchByDate = async (query) => {
  const { q } = query;
  const paging = getPagination(query);
  recordSearch(q, "date");

  // OrderDate is stored as a string "YYYY-MM-DD" in the flat dataset
  const regex = new RegExp(`^${q.replace(/[-]/g, "\\-")}`);
  return runSearch({ OrderDate: regex }, paging);
};

// ─── 10. Tracking ID Search ───────────────────────────────────────────────────
// GET /api/v1/orders/search/tracking?q=TRK123
// (dataset has no TrackingID field — falls back to OrderID match)
const searchByTracking = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "tracking");

  return runSearch({ OrderID: regex }, paging);
};

// ─── 11. Fuzzy Search ─────────────────────────────────────────────────────────
// GET /api/v1/orders/search/fuzzy?q=headfone
const fuzzySearch = async (query) => {
  const { q } = query;
  const regex = buildFuzzyRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "fuzzy");

  const filter = {
    $or: [
      { CustomerName: regex },
      { ProductName:  regex },
      { Category:     regex },
      { Brand:        regex },
    ],
  };
  return runSearch(filter, paging);
};

// ─── 12. Autocomplete Search ──────────────────────────────────────────────────
// GET /api/v1/orders/search/autocomplete?q=iph
const autocompleteSearch = async (query) => {
  const { q } = query;
  const regex = buildPrefixRegex(q);
  const limit = Math.min(parseInt(query.limit, 10) || 10, 50);

  const [products, categories, brands, customers, statuses, cities] =
    await Promise.all([
      AmazonOrder.distinct("ProductName",   { ProductName:   regex }),
      AmazonOrder.distinct("Category",      { Category:      regex }),
      AmazonOrder.distinct("Brand",         { Brand:         regex }),
      AmazonOrder.distinct("CustomerName",  { CustomerName:  regex }),
      AmazonOrder.distinct("OrderStatus",   { OrderStatus:   regex }),
      AmazonOrder.distinct("City",          { City:          regex }),
    ]);

  const suggestions = [
    ...new Set(
      [...products, ...categories, ...brands, ...customers, ...statuses, ...cities]
        .filter(Boolean)
    ),
  ].slice(0, limit);

  return { suggestions, total: suggestions.length, q };
};

// ─── 13. Highlight Search ─────────────────────────────────────────────────────
// GET /api/v1/orders/search/highlight?q=mouse
const highlightSearch = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const { page, limit, skip } = getPagination(query);
  recordSearch(q, "highlight");

  const filter = {
    $or: [
      { ProductName:  regex },
      { CustomerName: regex },
      { Category:     regex },
      { Brand:        regex },
    ],
  };

  const [rawResults, total] = await Promise.all([
    AmazonOrder.find(filter).skip(skip).limit(limit).lean(),
    AmazonOrder.countDocuments(filter),
  ]);

  if (total === 0) {
    return { results: [], pagination: { total: 0, page, limit, pages: 0 } };
  }

  const results = rawResults.map((order) => ({
    ...order,
    _highlight: {
      CustomerName: buildHighlight(order.CustomerName || "", q),
      ProductName:  buildHighlight(order.ProductName  || "", q),
      Category:     buildHighlight(order.Category     || "", q),
      Brand:        buildHighlight(order.Brand        || "", q),
    },
  }));

  return {
    results,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

// ─── 14. Recent Searches ──────────────────────────────────────────────────────
const getRecentSearchHistory = (query) => {
  const limit = Math.min(parseInt(query.limit, 10) || 10, 50);
  const searches = getRecentSearches(limit);
  return { searches, total: searches.length };
};

// ─── 15. Popular Searches ─────────────────────────────────────────────────────
const getPopularSearchHistory = (query) => {
  const limit = Math.min(parseInt(query.limit, 10) || 10, 50);
  const searches = getPopularSearches(limit);
  return { searches, total: searches.length };
};

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
  getRecentSearchHistory,
  getPopularSearchHistory,
};
