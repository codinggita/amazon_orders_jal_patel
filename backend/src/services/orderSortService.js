"use strict";

/**
 * @file orderSortService.js
 * @description Sort operations backed by the real AmazonOrder "database" collection.
 * All sort endpoints return top-50 results (or paginated where applicable).
 */

const AmazonOrder = require("../models/AmazonOrder");

const LIMIT = 50;

// ─── Highest Value Orders First ───────────────────────────────────────────────
// GET /api/v1/orders/sort/highest-value
const sortByHighestValue = async () => {
  return AmazonOrder.aggregate([
    { $addFields: { _amount: { $toDouble: "$TotalAmount" } } },
    { $sort: { _amount: -1 } },
    { $limit: LIMIT },
    { $project: { _amount: 0 } },
  ]);
};

// ─── Lowest Value Orders First ────────────────────────────────────────────────
// GET /api/v1/orders/sort/lowest-value
const sortByLowestValue = async () => {
  return AmazonOrder.aggregate([
    { $addFields: { _amount: { $toDouble: "$TotalAmount" } } },
    { $sort: { _amount: 1 } },
    { $limit: LIMIT },
    { $project: { _amount: 0 } },
  ]);
};

// ─── Latest Orders First ──────────────────────────────────────────────────────
// GET /api/v1/orders/sort/latest
const sortByLatest = async () => {
  return AmazonOrder.find().sort({ OrderDate: -1 }).limit(LIMIT).lean();
};

// ─── Oldest Orders First ──────────────────────────────────────────────────────
// GET /api/v1/orders/sort/oldest
const sortByOldest = async () => {
  return AmazonOrder.find().sort({ OrderDate: 1 }).limit(LIMIT).lean();
};

// ─── Orders with Most Items ───────────────────────────────────────────────────
// GET /api/v1/orders/sort/most-items
const sortByMostItems = async () => {
  return AmazonOrder.aggregate([
    { $addFields: { _qty: { $toInt: "$Quantity" } } },
    { $sort: { _qty: -1 } },
    { $limit: LIMIT },
    { $project: { _qty: 0 } },
  ]);
};

// ─── Orders with Least Items ──────────────────────────────────────────────────
// GET /api/v1/orders/sort/least-items
const sortByLeastItems = async () => {
  return AmazonOrder.aggregate([
    { $addFields: { _qty: { $toInt: "$Quantity" } } },
    { $sort: { _qty: 1 } },
    { $limit: LIMIT },
    { $project: { _qty: 0 } },
  ]);
};

// ─── Sort by Discount Amount ──────────────────────────────────────────────────
// GET /api/v1/orders/sort/discount
const sortByDiscountAmount = async () => {
  return AmazonOrder.aggregate([
    { $addFields: { _discount: { $toDouble: "$Discount" } } },
    { $sort: { _discount: -1 } },
    { $limit: LIMIT },
    { $project: { _discount: 0 } },
  ]);
};

module.exports = {
  sortByHighestValue,
  sortByLowestValue,
  sortByLatest,
  sortByOldest,
  sortByMostItems,
  sortByLeastItems,
  sortByDiscountAmount,
};
