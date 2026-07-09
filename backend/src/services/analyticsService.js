"use strict";

/**
 * @file analyticsService.js
 * @description Analytics operations backed by the real AmazonOrder "database" collection.
 */

const AmazonOrder = require("../models/AmazonOrder");

/**
 * Aggregates total revenue (gross, net, taxes).
 */
const getTotalRevenue = async () => {
  const result = await AmazonOrder.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $toDouble: "$TotalAmount" } },
        taxCollected: { $sum: { $toDouble: "$Tax" } },
        shippingFees: { $sum: { $toDouble: "$ShippingCost" } },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: { $round: ["$totalRevenue", 2] },
        taxCollected: { $round: ["$taxCollected", 2] },
        shippingFees: { $round: ["$shippingFees", 2] },
      },
    },
  ]);
  return result[0] || { totalRevenue: 0, taxCollected: 0, shippingFees: 0 };
};

/**
 * Monthly revenue breakdown.
 */
const buildMatchStage = (startDate, endDate) => {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.OrderDate = {};
    if (startDate) matchStage.OrderDate.$gte = startDate;
    if (endDate) matchStage.OrderDate.$lte = endDate;
  }
  return Object.keys(matchStage).length ? { $match: matchStage } : null;
};

/**
 * Monthly revenue breakdown.
 */
const getMonthlyRevenue = async (startDate, endDate) => {
  const match = buildMatchStage(startDate, endDate);
  const pipeline = [
    ...(match ? [match] : []),
    {
      $group: {
        _id: { $substr: ["$OrderDate", 0, 7] }, // YYYY-MM
        revenue: { $sum: { $toDouble: "$TotalAmount" } },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { month: "$_id", revenue: { $round: ["$revenue", 2] }, ordersCount: 1, _id: 0 } },
  ];
  return await AmazonOrder.aggregate(pipeline);
};

/**
 * Yearly revenue breakdown.
 */
const getYearlyRevenue = async (startDate, endDate) => {
  const match = buildMatchStage(startDate, endDate);
  const pipeline = [
    ...(match ? [match] : []),
    {
      $group: {
        _id: { $substr: ["$OrderDate", 0, 4] }, // YYYY
        revenue: { $sum: { $toDouble: "$TotalAmount" } },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { year: "$_id", revenue: { $round: ["$revenue", 2] }, ordersCount: 1, _id: 0 } },
  ];
  return await AmazonOrder.aggregate(pipeline);
};

/**
 * Average order value.
 */
const getAverageOrderValue = async () => {
  const result = await AmazonOrder.aggregate([
    { $group: { _id: null, avgValue: { $avg: { $toDouble: "$TotalAmount" } } } },
    { $project: { _id: 0, avgValue: { $round: ["$avgValue", 2] } } },
  ]);
  return result[0] || { avgValue: 0 };
};

/**
 * Total orders count.
 */
const getOrdersCount = async () => {
  const count = await AmazonOrder.countDocuments();
  return { count };
};

/**
 * Cancelled orders analytics.
 */
const getCancelledOrders = async () => {
  const count = await AmazonOrder.countDocuments({ OrderStatus: /^cancelled$/i });
  return { cancelledCount: count };
};

/**
 * Refunded orders analytics.
 */
const getRefundedOrders = async () => {
  const count = await AmazonOrder.countDocuments({ OrderStatus: /^returned$/i });
  return { refundedCount: count };
};

/**
 * Top customers by total spent.
 */
const getTopCustomers = async () => {
  return await AmazonOrder.aggregate([
    {
      $group: {
        _id: "$CustomerID",
        name: { $first: "$CustomerName" },
        totalSpent: { $sum: { $toDouble: "$TotalAmount" } },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        customerId: "$_id",
        name: 1,
        totalSpent: { $round: ["$totalSpent", 2] },
        orderCount: 1,
      },
    },
  ]);
};

/**
 * Top selling products.
 */
const getTopSellingProducts = async (startDate, endDate) => {
  const match = buildMatchStage(startDate, endDate);
  const pipeline = [
    ...(match ? [match] : []),
    {
      $group: {
        _id: "$ProductName",
        quantitySold: { $sum: { $toInt: "$Quantity" } },
        revenueGenerated: { $sum: { $toDouble: "$TotalAmount" } },
      },
    },
    { $sort: { quantitySold: -1 } },
    { $limit: 10 },
    {
      $project: {
        product: "$_id",
        quantitySold: 1,
        revenueGenerated: { $round: ["$revenueGenerated", 2] },
        _id: 0,
      },
    },
  ];
  return await AmazonOrder.aggregate(pipeline);
};

/**
 * Low selling products.
 */
const getLowSellingProducts = async () => {
  return await AmazonOrder.aggregate([
    {
      $group: {
        _id: "$ProductName",
        quantitySold: { $sum: { $toInt: "$Quantity" } },
      },
    },
    { $sort: { quantitySold: 1 } },
    { $limit: 10 },
    { $project: { product: "$_id", quantitySold: 1, _id: 0 } },
  ]);
};

/**
 * Top categories analytics.
 */
const getTopCategories = async () => {
  return await AmazonOrder.aggregate([
    {
      $group: {
        _id: "$Category",
        salesCount: { $sum: { $toInt: "$Quantity" } },
      },
    },
    { $sort: { salesCount: -1 } },
    { $limit: 5 },
    { $project: { category: "$_id", salesCount: 1, _id: 0 } },
  ]);
};

/**
 * Payment methods distribution.
 */
const getPaymentDistribution = async () => {
  return await AmazonOrder.aggregate([
    {
      $group: {
        _id: "$PaymentMethod",
        count: { $sum: 1 },
      }
    },
    {
      $project: {
        _id: 0,
        method: "$_id",
        count: 1
      }
    }
  ]);
};

/**
 * Top performing cities.
 */
const getTopCities = async () => {
  return await AmazonOrder.aggregate([
    {
      $group: {
        _id: "$City",
        orderCount: { $sum: 1 },
        revenue: { $sum: { $toDouble: "$TotalAmount" } },
      },
    },
    { $sort: { orderCount: -1 } },
    { $limit: 10 },
    { $project: { city: "$_id", orderCount: 1, revenue: { $round: ["$revenue", 2] }, _id: 0 } },
  ]);
};

/**
 * Return rate analytics.
 */
const getReturnsRate = async () => {
  const total = await AmazonOrder.countDocuments();
  const returns = await AmazonOrder.countDocuments({ OrderStatus: /^returned$/i });
  return {
    totalOrders: total,
    returnedOrders: returns,
    returnRatePercent: total > 0 ? ((returns / total) * 100).toFixed(2) + "%" : "0%",
  };
};

/**
 * Discount usage analytics.
 */
const getDiscountUsage = async () => {
  const discounted = await AmazonOrder.countDocuments({
    $expr: { $gt: [{ $toDouble: "$Discount" }, 0] },
  });
  return {
    totalDiscountedOrders: discounted,
  };
};

/**
 * Get earliest and latest order dates.
 */
const getDateBounds = async () => {
  const result = await AmazonOrder.aggregate([
    {
      $group: {
        _id: null,
        minDate: { $min: "$OrderDate" },
        maxDate: { $max: "$OrderDate" },
      }
    }
  ]);
  return result[0] || { minDate: "2022-01-01", maxDate: "2024-12-31" };
};

module.exports = {
  getDateBounds,
  getTotalRevenue,
  getMonthlyRevenue,
  getYearlyRevenue,
  getAverageOrderValue,
  getOrdersCount,
  getCancelledOrders,
  getRefundedOrders,
  getTopCustomers,
  getTopSellingProducts,
  getLowSellingProducts,
  getTopCategories,
  getPaymentDistribution,
  getTopCities,
  getReturnsRate,
  getDiscountUsage,
};
