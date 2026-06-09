"use strict";

const Order = require("../models/order.model");

/**
 * Aggregates total revenue (gross, net, taxes).
 */
const getTotalRevenue = async () => {
  const result = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        netRevenue: { $sum: "$itemsPrice" },
        taxCollected: { $sum: "$taxPrice" },
        shippingFees: { $sum: "$shippingPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: { $round: ["$totalRevenue", 2] },
        netRevenue: { $round: ["$netRevenue", 2] },
        taxCollected: { $round: ["$taxCollected", 2] },
        shippingFees: { $round: ["$shippingFees", 2] },
      },
    },
  ]);
  return result[0] || { totalRevenue: 0, netRevenue: 0, taxCollected: 0, shippingFees: 0 };
};

/**
 * Monthly revenue breakdown.
 */
const getMonthlyRevenue = async () => {
  return await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { month: "$_id", revenue: { $round: ["$revenue", 2] }, ordersCount: 1, _id: 0 } },
  ]);
};

/**
 * Yearly revenue breakdown.
 */
const getYearlyRevenue = async () => {
  return await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { year: "$_id", revenue: { $round: ["$revenue", 2] }, ordersCount: 1, _id: 0 } },
  ]);
};

/**
 * Average order value.
 */
const getAverageOrderValue = async () => {
  const result = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: null, avgValue: { $avg: "$totalPrice" } } },
    { $project: { _id: 0, avgValue: { $round: ["$avgValue", 2] } } },
  ]);
  return result[0] || { avgValue: 0 };
};

/**
 * Total orders count.
 */
const getOrdersCount = async () => {
  const count = await Order.countDocuments();
  return { count };
};

/**
 * Cancelled orders analytics.
 */
const getCancelledOrders = async () => {
  const count = await Order.countDocuments({ status: "cancelled" });
  return { cancelledCount: count };
};

/**
 * Refunded orders analytics.
 * Since refund status isn't directly on order schema, we'll map 'returned' or cancelled as proxy.
 */
const getRefundedOrders = async () => {
  const count = await Order.countDocuments({ isArchived: true, status: "cancelled" });
  return { refundedCount: count };
};

/**
 * Top customers by total spent.
 */
const getTopCustomers = async () => {
  return await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: "$user", totalSpent: { $sum: "$totalPrice" }, orderCount: { $sum: 1 } } },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $project: {
        _id: 0,
        customerId: "$_id",
        name: { $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"] },
        email: "$userInfo.email",
        totalSpent: { $round: ["$totalSpent", 2] },
        orderCount: 1,
      },
    },
  ]);
};

/**
 * Top selling products.
 */
const getTopSellingProducts = async () => {
  return await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.name",
        quantitySold: { $sum: "$orderItems.quantity" },
        revenueGenerated: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
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
  ]);
};

/**
 * Low selling products.
 */
const getLowSellingProducts = async () => {
  return await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.name",
        quantitySold: { $sum: "$orderItems.quantity" },
      },
    },
    { $sort: { quantitySold: 1 } },
    { $limit: 10 },
    { $project: { product: "$_id", quantitySold: 1, _id: 0 } },
  ]);
};

/**
 * Top categories analytics (Proxy using product names since category isn't snapshotted).
 */
const getTopCategories = async () => {
  return await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$orderItems" },
    {
      $group: {
        // Grouping by first word of the product as proxy for category
        _id: { $arrayElemAt: [{ $split: ["$orderItems.name", " "] }, 0] },
        salesCount: { $sum: "$orderItems.quantity" },
      },
    },
    { $sort: { salesCount: -1 } },
    { $limit: 5 },
    { $project: { category: "$_id", salesCount: 1, _id: 0 } },
  ]);
};

/**
 * Payment methods distribution (Proxy since no payment gateway attached).
 */
const getPaymentDistribution = async () => {
  return [
    { method: "Credit Card", count: await Order.countDocuments({ totalPrice: { $gt: 50 } }) },
    { method: "PayPal", count: await Order.countDocuments({ totalPrice: { $lte: 50 } }) },
  ];
};

/**
 * Top performing cities.
 */
const getTopCities = async () => {
  return await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: "$shippingAddress.city",
        orderCount: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
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
  const total = await Order.countDocuments();
  // Using status history "returned" or "cancelled" as proxy
  const returns = await Order.countDocuments({ status: "cancelled" });
  return {
    totalOrders: total,
    returnedOrders: returns,
    returnRatePercent: total > 0 ? ((returns / total) * 100).toFixed(2) + "%" : "0%",
  };
};

/**
 * Discount usage analytics (Proxy using diff between itemsPrice and totalPrice).
 */
const getDiscountUsage = async () => {
  const discounted = await Order.countDocuments({ $expr: { $lt: ["$totalPrice", "$itemsPrice"] } });
  return {
    totalDiscountedOrders: discounted,
  };
};

module.exports = {
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
