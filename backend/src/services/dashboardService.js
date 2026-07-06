"use strict";

/**
 * @file dashboardService.js
 * @description Dashboard aggregation service.
 * All data is sourced from the real Amazon Orders "database" collection
 * (21,629 documents) via the AmazonOrder model.
 */

const AmazonOrder = require("../models/AmazonOrder");


const getOverview = async () => {
  const [revenueResult, statusCounts] = await Promise.all([
    AmazonOrder.aggregate([
      {
        $group: {
          _id:              null,
          totalRevenue:     { $sum: { $toDouble: "$TotalAmount" } },
          totalShipping:    { $sum: { $toDouble: "$ShippingCost" } },
          totalTax:         { $sum: { $toDouble: "$Tax" } },
          totalOrders:      { $sum: 1 },
          avgOrderValue:    { $avg: { $toDouble: "$TotalAmount" } },
        },
      },
    ]),
    AmazonOrder.aggregate([
      { $group: { _id: "$OrderStatus", count: { $sum: 1 } } },
    ]),
  ]);

  const rev = revenueResult[0] || {
    totalRevenue: 0, totalShipping: 0, totalTax: 0,
    totalOrders: 0, avgOrderValue: 0,
  };

  const statusMap = {};
  statusCounts.forEach((s) => {
    if (s._id) statusMap[s._id.toLowerCase()] = s.count;
  });

  const uniqueCustomers = await AmazonOrder.distinct("CustomerID");
  const uniqueCategories = await AmazonOrder.distinct("Category");

  return {
    revenue: {
      total:         Math.round(rev.totalRevenue  * 100) / 100,
      thisMonth:     0, // flat dataset has no live date context
      averageOrderValue: Math.round(rev.avgOrderValue * 100) / 100,
    },
    orders: {
      total:      rev.totalOrders,
      pending:    statusMap.pending     || 0,
      processing: statusMap.processing  || 0,
      shipped:    statusMap.shipped     || 0,
      delivered:  statusMap.delivered   || 0,
      cancelled:  statusMap.cancelled   || 0,
    },
    customers: {
      total: uniqueCustomers.length,
    },
    products: {
      totalActive: uniqueCategories.length,
    },
  };
};

const getRevenue = async (period = "monthly") => {
  let sliceLen;
  if (period === "yearly")       sliceLen = 4;  // "YYYY"
  else if (period === "daily")   sliceLen = 10; // "YYYY-MM-DD"
  else                           sliceLen = 7;  // "YYYY-MM"

  const results = await AmazonOrder.aggregate([
    {
      $group: {
        _id:         { $substr: ["$OrderDate", 0, sliceLen] },
        revenue:     { $sum: { $toDouble: "$TotalAmount" } },
        taxCollected: { $sum: { $toDouble: "$Tax" } },
        shippingFees: { $sum: { $toDouble: "$ShippingCost" } },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id:          0,
        period:       "$_id",
        revenue:      { $round: ["$revenue", 2] },
        taxCollected: { $round: ["$taxCollected", 2] },
        shippingFees: { $round: ["$shippingFees", 2] },
        ordersCount:  1,
      },
    },
  ]);

  return results;
};

const getOrders = async () => {
  const results = await AmazonOrder.aggregate([
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id:          "$OrderStatus",
              count:        { $sum: 1 },
              totalRevenue: { $sum: { $toDouble: "$TotalAmount" } },
            },
          },
          { $sort: { count: -1 } },
          {
            $project: {
              _id:          0,
              status:       "$_id",
              count:        1,
              totalRevenue: { $round: ["$totalRevenue", 2] },
            },
          },
        ],
        recentOrders: [
          { $sort: { OrderDate: -1 } },
          { $limit: 10 },
          {
            $project: {
              _id:           1,
              OrderID:       1,
              CustomerName:  1,
              ProductName:   1,
              OrderStatus:   1,
              TotalAmount:   1,
              OrderDate:     1,
              PaymentMethod: 1,
              Country:       1,
            },
          },
        ],
        monthlyTrend: [
          {
            $group: {
              _id:     { $substr: ["$OrderDate", 0, 7] },
              count:   { $sum: 1 },
              revenue: { $sum: { $toDouble: "$TotalAmount" } },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 24 },
          {
            $project: {
              _id:     0,
              month:   "$_id",
              count:   1,
              revenue: { $round: ["$revenue", 2] },
            },
          },
        ],
      },
    },
  ]);

  return results[0] || { byStatus: [], recentOrders: [], monthlyTrend: [] };
};

const getCustomers = async () => {
  const [topCustomers, totalCustomers] = await Promise.all([
    AmazonOrder.aggregate([
      {
        $group: {
          _id:          "$CustomerID",
          customerName: { $first: "$CustomerName" },
          totalSpent:   { $sum: { $toDouble: "$TotalAmount" } },
          ordersCount:  { $sum: 1 },
          lastOrderDate: { $max: "$OrderDate" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id:          0,
          customerId:    "$_id",
          customerName:  1,
          totalSpent:    { $round: ["$totalSpent", 2] },
          ordersCount:   1,
          lastOrderDate: 1,
        },
      },
    ]),
    AmazonOrder.distinct("CustomerID"),
  ]);

  return {
    topCustomers,
    registrationTrend: [], // not applicable to flat dataset
    totalCustomers: totalCustomers.length,
  };
};

const getProducts = async () => {
  const [topSelling, categoryDistribution] = await Promise.all([
    AmazonOrder.aggregate([
      {
        $group: {
          _id:      "$ProductName",
          totalSold: { $sum: { $toInt: "$Quantity" } },
          revenue:   { $sum: { $toDouble: "$TotalAmount" } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id:        0,
          name:       "$_id",
          totalSold:  1,
          revenue:    { $round: ["$revenue", 2] },
        },
      },
    ]),
    AmazonOrder.aggregate([
      {
        $group: {
          _id:      "$Category",
          count:    { $sum: 1 },
          avgPrice: { $avg: { $toDouble: "$UnitPrice" } },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id:      0,
          category: "$_id",
          count:    1,
          avgPrice: { $round: ["$avgPrice", 2] },
        },
      },
    ]),
  ]);

  const distinctCategories = await AmazonOrder.distinct("Category");

  return {
    topSelling,
    lowStock: [],       // flat dataset has no stock field
    categoryDistribution,
    totalProducts: distinctCategories.length,
  };
};

module.exports = {
  getOverview,
  getRevenue,
  getOrders,
  getCustomers,
  getProducts,
};
