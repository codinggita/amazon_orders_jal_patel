"use strict";

/**
 * @file statsService.js
 * @description Statistics Service — Phase 18.
 * Provides quick-count and aggregation stats across Orders, Revenue, Products,
 * Customers, Categories, Refunds, Cancellations, Shipping, and System Performance.
 *
 * All functions use lean() + countDocuments() for maximum query speed.
 * No business-rule enforcement — purely read-only aggregation.
 */

const Order = require("../models/order.model");
const User = require("../models/User");
const Shipment = require("../models/Shipment");

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

/** Total number of orders ever placed */
const getTotalOrders = async () => {
  const total = await Order.countDocuments();
  return { total };
};

/** Orders grouped by day (last 30 days) */
const getDailyOrders = async () => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", count: 1, revenue: { $round: ["$revenue", 2] }, _id: 0 } },
  ]);
  return { period: "last_30_days", data };
};

/** Orders grouped by month (all time) */
const getMonthlyOrders = async () => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { month: "$_id", count: 1, revenue: { $round: ["$revenue", 2] }, _id: 0 } },
  ]);
  return { data };
};

/** Orders grouped by year */
const getYearlyOrders = async () => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
        count: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { year: "$_id", count: 1, revenue: { $round: ["$revenue", 2] }, _id: 0 } },
  ]);
  return { data };
};

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE
// ─────────────────────────────────────────────────────────────────────────────

/** Total revenue across all non-cancelled orders */
const getTotalRevenue = async () => {
  const result = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
        items: { $sum: "$itemsPrice" },
        tax: { $sum: "$taxPrice" },
        shipping: { $sum: "$shippingPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        total: { $round: ["$total", 2] },
        items: { $round: ["$items", 2] },
        tax: { $round: ["$tax", 2] },
        shipping: { $round: ["$shipping", 2] },
      },
    },
  ]);
  return result[0] || { total: 0, items: 0, tax: 0, shipping: 0 };
};

/** Daily revenue (last 30 days) */
const getDailyRevenue = async () => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", revenue: { $round: ["$revenue", 2] }, orders: 1, _id: 0 } },
  ]);
  return { period: "last_30_days", data };
};

/** Monthly revenue */
const getMonthlyRevenue = async () => {
  const data = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { month: "$_id", revenue: { $round: ["$revenue", 2] }, orders: 1, _id: 0 } },
  ]);
  return { data };
};

/** Yearly revenue */
const getYearlyRevenue = async () => {
  const data = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { year: "$_id", revenue: { $round: ["$revenue", 2] }, orders: 1, _id: 0 } },
  ]);
  return { data };
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS, CUSTOMERS, CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

/** Total unique product count (distinct names sold) */
const getProductsCount = async () => {
  const result = await Order.aggregate([
    { $unwind: "$orderItems" },
    { $group: { _id: "$orderItems.name" } },
    { $count: "distinctProducts" },
  ]);
  return { count: result[0]?.distinctProducts || 0 };
};

/** Total registered users (customers) */
const getCustomersCount = async () => {
  const count = await User.countDocuments({ role: { $ne: "admin" } });
  return { count };
};

/** Distinct categories sold (proxy: first word of product name) */
const getCategoriesCount = async () => {
  const result = await Order.aggregate([
    { $unwind: "$orderItems" },
    { $group: { _id: { $arrayElemAt: [{ $split: ["$orderItems.name", " "] }, 0] } } },
    { $count: "distinctCategories" },
  ]);
  return { count: result[0]?.distinctCategories || 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// REFUNDS, CANCELLATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Refund count (archived + cancelled orders as proxy) */
const getRefundsCount = async () => {
  const count = await Order.countDocuments({ isArchived: true, status: "cancelled" });
  const total = await Order.countDocuments();
  return {
    refundCount: count,
    refundRatePercent: total > 0 ? ((count / total) * 100).toFixed(2) + "%" : "0%",
  };
};

/** Cancellation count and rate */
const getCancellationsCount = async () => {
  const count = await Order.countDocuments({ status: "cancelled" });
  const total = await Order.countDocuments();
  return {
    cancellationCount: count,
    cancellationRatePercent: total > 0 ? ((count / total) * 100).toFixed(2) + "%" : "0%",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SHIPPING
// ─────────────────────────────────────────────────────────────────────────────

/** Average shipping duration (days from order creation to delivery) */
const getShippingAverageTime = async () => {
  const result = await Shipment.aggregate([
    { $match: { status: "delivered", actualDeliveryDate: { $exists: true } } },
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "orderDoc",
      },
    },
    { $unwind: "$orderDoc" },
    {
      $project: {
        daysToDeliver: {
          $divide: [
            { $subtract: ["$actualDeliveryDate", "$orderDoc.createdAt"] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgDays: { $avg: "$daysToDeliver" },
        minDays: { $min: "$daysToDeliver" },
        maxDays: { $max: "$daysToDeliver" },
        sampleSize: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        avgDays: { $round: ["$avgDays", 1] },
        minDays: { $round: ["$minDays", 1] },
        maxDays: { $round: ["$maxDays", 1] },
        sampleSize: 1,
      },
    },
  ]);
  return result[0] || { avgDays: null, minDays: null, maxDays: null, sampleSize: 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PERFORMANCE
// ─────────────────────────────────────────────────────────────────────────────

/** API performance/system snapshot */
const getSystemPerformance = async () => {
  const memUsage = process.memoryUsage();
  const uptimeSecs = process.uptime();
  const [totalOrders, totalUsers] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments(),
  ]);
  return {
    uptime: {
      seconds: Math.floor(uptimeSecs),
      formatted: `${Math.floor(uptimeSecs / 3600)}h ${Math.floor((uptimeSecs % 3600) / 60)}m ${Math.floor(uptimeSecs % 60)}s`,
    },
    memory: {
      heapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
      rssMB: (memUsage.rss / 1024 / 1024).toFixed(2),
    },
    database: {
      totalOrders,
      totalUsers,
    },
    node: {
      version: process.version,
      platform: process.platform,
    },
    timestamp: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  getTotalOrders,
  getDailyOrders,
  getMonthlyOrders,
  getYearlyOrders,
  getTotalRevenue,
  getDailyRevenue,
  getMonthlyRevenue,
  getYearlyRevenue,
  getProductsCount,
  getCustomersCount,
  getCategoriesCount,
  getRefundsCount,
  getCancellationsCount,
  getShippingAverageTime,
  getSystemPerformance,
};
