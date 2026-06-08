"use strict";



const Order = require("../models/order.model");
const ApiError = require("../utils/ApiError");
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
 * @param {Object} filter  - Mongoose filter object
 * @param {{ page, limit, skip }} pagination
 * @param {Object} [projection] - Optional field projection
 * @returns {Promise<{ results: Array, pagination: Object }>}
 */
const runSearch = async (filter, { page, limit, skip }, projection = {}) => {
  const [results, total] = await Promise.all([
    Order.find(filter, projection).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  if (total === 0) {
    throw new ApiError("No results found for the given query.", 404);
  }

  return {
    results,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Global Keyword Search
// GET /api/v1/orders/search?q=laptop
// Searches: customer name, product name, category, brand, tracking ID, city
// ─────────────────────────────────────────────────────────────────────────────

const globalSearch = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "global");

  const filter = {
    $or: [
      // Customer fields (direct or nested)
      { customerName: regex },
      { "customer.name": regex },
      // Product / Item fields
      { "orderItems.name": regex },
      { "orderItems.productName": regex },
      // Category
      { "orderItems.category": regex },
      { category: regex },
      // Brand
      { "orderItems.brand": regex },
      { brand: regex },
      // Tracking
      { trackingId: regex },
      { trackingNumber: regex },
      // Location
      { "shippingAddress.city": regex },
      { "shippingAddress.state": regex },
      { city: regex },
      { state: regex },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Customer Name Search
// GET /api/v1/orders/search/customer?q=john
// ─────────────────────────────────────────────────────────────────────────────

const searchByCustomer = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "customer");

  const filter = {
    $or: [
      { customerName: regex },
      { "customer.name": regex },
      { "user.name": regex },
      { buyerName: regex },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Product Name Search
// GET /api/v1/orders/search/product?q=iphone
// ─────────────────────────────────────────────────────────────────────────────

const searchByProduct = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "product");

  const filter = {
    $or: [
      { "orderItems.name": regex },
      { "orderItems.productName": regex },
      { productName: regex },
      { "products.name": regex },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Category Search
// GET /api/v1/orders/search/category?q=electronics
// ─────────────────────────────────────────────────────────────────────────────

const searchByCategory = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "category");

  const filter = {
    $or: [
      { "orderItems.category": regex },
      { category: regex },
      { "products.category": regex },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Brand Search
// GET /api/v1/orders/search/brand?q=samsung
// ─────────────────────────────────────────────────────────────────────────────

const searchByBrand = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "brand");

  const filter = {
    $or: [
      { "orderItems.brand": regex },
      { brand: regex },
      { "products.brand": regex },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Order Status Search
// GET /api/v1/orders/search/status?q=delivered
// ─────────────────────────────────────────────────────────────────────────────

const searchByStatus = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "status");

  const filter = {
    $or: [
      { status: regex },
      { orderStatus: regex },
      { currentStatus: regex },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Payment Method Search
// GET /api/v1/orders/search/payment?q=upi
// ─────────────────────────────────────────────────────────────────────────────

const searchByPayment = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "payment");

  const filter = {
    $or: [
      { paymentMethod: regex },
      { "payment.method": regex },
      { "paymentInfo.method": regex },
      { "paymentDetails.method": regex },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Location Search (city, state, country)
// GET /api/v1/orders/search/location?q=delhi
// ─────────────────────────────────────────────────────────────────────────────

const searchByLocation = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "location");

  const filter = {
    $or: [
      { "shippingAddress.city": regex },
      { "shippingAddress.state": regex },
      { "shippingAddress.country": regex },
      { city: regex },
      { state: regex },
      { country: regex },
      { "address.city": regex },
      { "address.state": regex },
      { "address.country": regex },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Date Search — YYYY | YYYY-MM | YYYY-MM-DD
// GET /api/v1/orders/search/date?q=2025-01
// ─────────────────────────────────────────────────────────────────────────────

const searchByDate = async (query) => {
  const { q } = query;
  const paging = getPagination(query);
  recordSearch(q, "date");

  const { start, end } = parseDateRange(q);

  const filter = {
    $or: [
      { createdAt: { $gte: start, $lt: end } },
      { orderDate: { $gte: start, $lt: end } },
      { placedAt: { $gte: start, $lt: end } },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. Tracking ID Search
// GET /api/v1/orders/search/tracking?q=TRK123
// ─────────────────────────────────────────────────────────────────────────────

const searchByTracking = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "tracking");

  const filter = {
    $or: [
      { trackingId: regex },
      { trackingNumber: regex },
      { "shipping.trackingId": regex },
      { "shipping.trackingNumber": regex },
      { "shipment.trackingId": regex },
      { "shipment.trackingNumber": regex },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. Fuzzy Search — tolerates misspellings
// GET /api/v1/orders/search/fuzzy?q=headfone
// ─────────────────────────────────────────────────────────────────────────────

const fuzzySearch = async (query) => {
  const { q } = query;
  const regex = buildFuzzyRegex(q);
  const paging = getPagination(query);
  recordSearch(q, "fuzzy");

  const filter = {
    $or: [
      { customerName: regex },
      { "orderItems.name": regex },
      { "orderItems.productName": regex },
      { "orderItems.category": regex },
      { "orderItems.brand": regex },
      { productName: regex },
      { category: regex },
      { brand: regex },
    ],
  };

  return runSearch(filter, paging);
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. Autocomplete Search — prefix matching, returns unique suggestions
// GET /api/v1/orders/search/autocomplete?q=iph
// ─────────────────────────────────────────────────────────────────────────────

const autocompleteSearch = async (query) => {
  const { q } = query;
  const regex = buildPrefixRegex(q);
  const limit = Math.min(parseInt(query.limit, 10) || 10, 50);

  // Fetch distinct values from each searchable string field
  const [productNames, categories, brands, customerNames, statuses, cities] =
    await Promise.all([
      Order.distinct("orderItems.name", { "orderItems.name": regex }),
      Order.distinct("orderItems.category", { "orderItems.category": regex }),
      Order.distinct("orderItems.brand", { "orderItems.brand": regex }),
      Order.distinct("customerName", { customerName: regex }),
      Order.distinct("status", { status: regex }),
      Order.distinct("shippingAddress.city", { "shippingAddress.city": regex }),
    ]);

  // Deduplicate, filter nulls, and cap to requested limit
  const suggestions = [
    ...new Set(
      [
        ...productNames,
        ...categories,
        ...brands,
        ...customerNames,
        ...statuses,
        ...cities,
      ].filter(Boolean)
    ),
  ].slice(0, limit);

  return { suggestions, total: suggestions.length, q };
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. Highlight Search — results annotated with match positions
// GET /api/v1/orders/search/highlight?q=mouse
// ─────────────────────────────────────────────────────────────────────────────

const highlightSearch = async (query) => {
  const { q } = query;
  const regex = buildRegex(q);
  const { page, limit, skip } = getPagination(query);
  recordSearch(q, "highlight");

  const filter = {
    $or: [
      { "orderItems.name": regex },
      { "orderItems.productName": regex },
      { customerName: regex },
      { "orderItems.category": regex },
      { "orderItems.brand": regex },
      { productName: regex },
    ],
  };

  const [rawResults, total] = await Promise.all([
    Order.find(filter).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  if (total === 0) {
    throw new ApiError("No results found for the given query.", 404);
  }

  // Attach _highlight metadata to each document
  const results = rawResults.map((order) => {
    const _highlight = {};

    if (order.customerName) {
      _highlight.customerName = buildHighlight(order.customerName, q);
    }

    if (Array.isArray(order.orderItems)) {
      _highlight.orderItems = order.orderItems.map((item) => ({
        name: buildHighlight(item.name || item.productName || "", q),
        category: buildHighlight(item.category || "", q),
        brand: buildHighlight(item.brand || "", q),
      }));
    }

    return { ...order, _highlight };
  });

  return {
    results,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 14. Recent Searches
// GET /api/v1/orders/search/recent
// ─────────────────────────────────────────────────────────────────────────────

const getRecentSearchHistory = (query) => {
  const limit = Math.min(parseInt(query.limit, 10) || 10, 50);
  const searches = getRecentSearches(limit);
  return { searches, total: searches.length };
};

// ─────────────────────────────────────────────────────────────────────────────
// 15. Popular Searches
// GET /api/v1/orders/search/popular
// ─────────────────────────────────────────────────────────────────────────────

const getPopularSearchHistory = (query) => {
  const limit = Math.min(parseInt(query.limit, 10) || 10, 50);
  const searches = getPopularSearches(limit);
  return { searches, total: searches.length };
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

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
