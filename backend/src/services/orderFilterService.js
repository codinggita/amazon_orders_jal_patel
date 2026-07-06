"use strict";

/**
 * @file orderFilterService.js
 * @description Filter operations backed by the real AmazonOrder "database" collection.
 *
 * All filters return paginated results: { results, total, page, limit, pages }
 * Flat field names (PascalCase) from the dataset are used throughout.
 */

const AmazonOrder = require("../models/AmazonOrder");

const DEFAULT_LIMIT = 50;

/** Small helper that runs find + count with pagination. */
const paginate = async (filter, sort = { OrderDate: -1 }, limit = DEFAULT_LIMIT, page = 1) => {
  const skip = (page - 1) * limit;
  const [results, total] = await Promise.all([
    AmazonOrder.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    AmazonOrder.countDocuments(filter),
  ]);
  return { results, total, page, limit, pages: Math.ceil(total / limit) };
};

// ─── Filter by Order Status ───────────────────────────────────────────────────
// GET /api/v1/orders/filter/status?type=Pending
const filterByStatus = async (statusType) => {
  const regex = new RegExp(`^${statusType}$`, "i");
  return paginate({ OrderStatus: regex });
};

// ─── Filter by Payment Method ─────────────────────────────────────────────────
// GET /api/v1/orders/filter/payment?method=Card
const filterByPayment = async (method) => {
  const regex = new RegExp(method, "i");
  return paginate({ PaymentMethod: regex });
};

// ─── Filter by Category ───────────────────────────────────────────────────────
// GET /api/v1/orders/filter/category?name=Electronics
const filterByCategory = async (categoryName) => {
  const regex = new RegExp(categoryName, "i");
  return paginate({ Category: regex });
};

// ─── Filter by Brand ──────────────────────────────────────────────────────────
// GET /api/v1/orders/filter/brand?name=Apple
const filterByBrand = async (brandName) => {
  const regex = new RegExp(brandName, "i");
  return paginate({ Brand: regex });
};

// ─── Filter by Price Range ────────────────────────────────────────────────────
// GET /api/v1/orders/filter/price?min=100&max=1000
const filterByPrice = async (min, max) => {
  // TotalAmount is stored as string in dataset — use $expr + $toDouble
  const filter = {
    $expr: {
      $and: [
        { $gte: [{ $toDouble: "$TotalAmount" }, Number(min) || 0] },
        { $lte: [{ $toDouble: "$TotalAmount" }, Number(max) || 999999] },
      ],
    },
  };
  return paginate(filter, { TotalAmount: -1 });
};

// ─── Filter by Date Range ─────────────────────────────────────────────────────
// GET /api/v1/orders/filter/date?start=2025-01-01&end=2025-02-01
const filterByDate = async (start, end) => {
  const filter = {};
  if (start) filter.OrderDate = { $gte: start };
  if (end)   filter.OrderDate = { ...filter.OrderDate, $lte: end };
  return paginate(filter, { OrderDate: -1 });
};

// ─── Filter by Country ────────────────────────────────────────────────────────
// GET /api/v1/orders/filter/country?name=India
const filterByCountry = async (countryName) => {
  const regex = new RegExp(countryName, "i");
  return paginate({ Country: regex });
};

// ─── Filter by State ──────────────────────────────────────────────────────────
// GET /api/v1/orders/filter/state?name=Gujarat
const filterByState = async (stateName) => {
  const regex = new RegExp(stateName, "i");
  return paginate({ State: regex });
};

// ─── Filter by City ───────────────────────────────────────────────────────────
// GET /api/v1/orders/filter/city?name=Surat
const filterByCity = async (cityName) => {
  const regex = new RegExp(cityName, "i");
  return paginate({ City: regex });
};

// ─── Filter High-Value Orders ─────────────────────────────────────────────────
// GET /api/v1/orders/filter/high-value?amount=1000
const filterByHighValue = async (amount) => {
  const threshold = Number(amount) || 1000;
  const filter = {
    $expr: { $gte: [{ $toDouble: "$TotalAmount" }, threshold] },
  };
  return paginate(filter, { TotalAmount: -1 });
};

// ─── Filter Discounted Orders ─────────────────────────────────────────────────
// GET /api/v1/orders/filter/discounted
const filterByDiscounted = async () => {
  // Orders with Discount > 0
  const filter = {
    $expr: { $gt: [{ $toDouble: "$Discount" }, 0] },
  };
  return paginate(filter, { Discount: -1 });
};

// ─── Filter Cancelled Orders ──────────────────────────────────────────────────
// GET /api/v1/orders/filter/cancelled
const filterByCancelled = async () => {
  return paginate({ OrderStatus: /^cancelled$/i });
};

// ─── Filter Refunded Orders ───────────────────────────────────────────────────
// GET /api/v1/orders/filter/refunded
const filterByRefunded = async () => {
  return paginate({ OrderStatus: /^returned$/i });
};

// ─── Filter Shipped Orders ────────────────────────────────────────────────────
// GET /api/v1/orders/filter/shipped
const filterByShipped = async () => {
  return paginate({ OrderStatus: /^shipped$/i });
};

// ─── Filter Delivered Orders ──────────────────────────────────────────────────
// GET /api/v1/orders/filter/delivered
const filterByDelivered = async () => {
  return paginate({ OrderStatus: /^delivered$/i });
};

module.exports = {
  filterByStatus,
  filterByPayment,
  filterByCategory,
  filterByBrand,
  filterByPrice,
  filterByDate,
  filterByCountry,
  filterByState,
  filterByCity,
  filterByHighValue,
  filterByDiscounted,
  filterByCancelled,
  filterByRefunded,
  filterByShipped,
  filterByDelivered,
};
