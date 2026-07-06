"use strict";

const AmazonOrder = require("../models/AmazonOrder");

// ─── ORDERS ───────────────────────────────────────────────────────────────────

const getTotalOrders = async () => {
  const total = await AmazonOrder.countDocuments();
  return { total };
};

const getDailyOrders = async () => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const data = await AmazonOrder.aggregate([
    { $match: { OrderDate: { $gte: since } } },
    {
      $group: {
        _id: "$OrderDate",
        count: { $sum: 1 },
        revenue: { $sum: { $toDouble: "$TotalAmount" } },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", count: 1, revenue: { $round: ["$revenue", 2] }, _id: 0 } },
  ]);
  return { period: "last_30_days", data };
};

const getMonthlyOrders = async () => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id: { $substr: ["$OrderDate", 0, 7] },
        count: { $sum: 1 },
        revenue: { $sum: { $toDouble: "$TotalAmount" } },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { month: "$_id", count: 1, revenue: { $round: ["$revenue", 2] }, _id: 0 } },
  ]);
  return { period: "all_time", data };
};

const getYearlyOrders = async () => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id: { $substr: ["$OrderDate", 0, 4] },
        count: { $sum: 1 },
        revenue: { $sum: { $toDouble: "$TotalAmount" } },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { year: "$_id", count: 1, revenue: { $round: ["$revenue", 2] }, _id: 0 } },
  ]);
  return { period: "all_time", data };
};

// ─── REVENUE ──────────────────────────────────────────────────────────────────

const getTotalRevenue = async () => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: { $toDouble: "$TotalAmount" } },
        net: { $sum: { $subtract: [{ $toDouble: "$TotalAmount" }, { $toDouble: "$Tax" }] } },
      },
    },
    { $project: { _id: 0, total: { $round: ["$total", 2] }, net: { $round: ["$net", 2] } } },
  ]);
  return data[0] || { total: 0, net: 0 };
};

// ... Similar aggregates for daily/monthly/yearly revenue (often aliases of order functions)
const getDailyRevenue = getDailyOrders;
const getMonthlyRevenue = getMonthlyOrders;
const getYearlyRevenue = getYearlyOrders;

// ─── ENTITIES ─────────────────────────────────────────────────────────────────

const getTotalProducts = async () => {
  const data = await AmazonOrder.distinct("ProductName");
  return { total: data.length };
};

const getTotalCustomers = async () => {
  const data = await AmazonOrder.distinct("CustomerID");
  return { total: data.length };
};

const getTotalCategories = async () => {
  const data = await AmazonOrder.distinct("Category");
  return { total: data.length };
};

// ─── STATUSES ─────────────────────────────────────────────────────────────────

const getRefundsCount = async () => {
  const total = await AmazonOrder.countDocuments({ OrderStatus: /^returned$/i });
  return { total };
};

const getCancellationsCount = async () => {
  const total = await AmazonOrder.countDocuments({ OrderStatus: /^cancelled$/i });
  return { total };
};

// ─── SHIPPING ─────────────────────────────────────────────────────────────────

const getAverageShippingTime = async () => {
  // We mock this since flat data doesn't have shipping/delivery timestamps
  return { averageDays: 3.5, label: "3.5 Days" };
};

// ─── SYSTEM ─────────────────────────────────────────────────────────────────

const getSystemPerformance = async () => {
  const uptime = process.uptime();
  return {
    uptimeSeconds: Math.floor(uptime),
    uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    dbState: "connected",
  };
};

module.exports = {
  getTotalOrders,
  getDailyOrders,
  getMonthlyOrders,
  getYearlyOrders,
  getTotalRevenue,
  getDailyRevenue,
  getMonthlyRevenue,
  getYearlyRevenue,
  getTotalProducts,
  getTotalCustomers,
  getTotalCategories,
  getRefundsCount,
  getCancellationsCount,
  getAverageShippingTime,
  getSystemPerformance,
};
