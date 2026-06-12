"use strict";

const Order = require("../models/order.model");
const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const getOverview = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    revenueResult,
    orderCounts,
    customerCount,
    productCount,
    todayOrders,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          revenueThisMonth: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$totalPrice", 0],
            },
          },
          averageOrderValue: { $avg: "$totalPrice" },
        },
      },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments({
      createdAt: { $gte: startOfToday },
    }),
  ]);

  const revenue = revenueResult[0] || {
    totalRevenue: 0,
    revenueThisMonth: 0,
    averageOrderValue: 0,
  };

  const statusMap = {};
  orderCounts.forEach((s) => {
    statusMap[s._id] = s.count;
  });

  return {
    revenue: {
      total: Math.round(revenue.totalRevenue * 100) / 100,
      thisMonth: Math.round(revenue.revenueThisMonth * 100) / 100,
      averageOrderValue: Math.round(revenue.averageOrderValue * 100) / 100,
    },
    orders: {
      total: orderCounts.reduce((sum, s) => sum + s.count, 0),
      pending: statusMap.pending || 0,
      processing: statusMap.processing || 0,
      shipped: statusMap.shipped || 0,
      delivered: statusMap.delivered || 0,
      cancelled: statusMap.cancelled || 0,
      today: todayOrders,
    },
    customers: {
      total: customerCount,
    },
    products: {
      totalActive: productCount,
    },
  };
};

const getRevenue = async (period = "monthly") => {
  let groupFormat;
  if (period === "yearly") {
    groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
  } else if (period === "daily") {
    groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  } else {
    groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
  }

  const results = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: groupFormat,
        revenue: { $sum: "$totalPrice" },
        itemsRevenue: { $sum: "$itemsPrice" },
        taxCollected: { $sum: "$taxPrice" },
        shippingFees: { $sum: "$shippingPrice" },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        period: "$_id",
        revenue: { $round: ["$revenue", 2] },
        itemsRevenue: { $round: ["$itemsRevenue", 2] },
        taxCollected: { $round: ["$taxCollected", 2] },
        shippingFees: { $round: ["$shippingFees", 2] },
        ordersCount: 1,
      },
    },
  ]);

  return results;
};

const getOrders = async () => {
  const results = await Order.aggregate([
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalRevenue: { $sum: "$totalPrice" },
            },
          },
          { $sort: { count: -1 } },
          {
            $project: {
              _id: 0,
              status: "$_id",
              count: 1,
              totalRevenue: { $round: ["$totalRevenue", 2] },
            },
          },
        ],
        recentOrders: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              status: 1,
              totalPrice: 1,
              itemsPrice: 1,
              createdAt: 1,
              "user.firstName": 1,
              "user.lastName": 1,
              "user.email": 1,
            },
          },
        ],
        monthlyTrend: [
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              count: { $sum: 1 },
              revenue: { $sum: "$totalPrice" },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 12 },
          {
            $project: {
              _id: 0,
              month: "$_id",
              count: 1,
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
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [topCustomers, registrationTrend] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
          ordersCount: { $sum: 1 },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          customerId: "$_id",
          name: {
            $cond: [
              { $and: ["$user.firstName", "$user.lastName"] },
              { $concat: ["$user.firstName", " ", "$user.lastName"] },
              "Unknown",
            ],
          },
          email: "$user.email",
          totalSpent: { $round: ["$totalSpent", 2] },
          ordersCount: 1,
          lastOrderDate: 1,
        },
      },
    ]),
    User.aggregate([
      {
        $match: {
          role: "customer",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          count: 1,
        },
      },
    ]),
  ]);

  return {
    topCustomers,
    registrationTrend,
    totalCustomers: await User.countDocuments({ role: "customer" }),
  };
};

const getProducts = async () => {
  const [topSelling, lowStock, categoryDistribution] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.quantity" },
          revenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: 1,
          totalSold: 1,
          revenue: { $round: ["$revenue", 2] },
        },
      },
    ]),
    Product.find({ stock: { $lte: 10 }, isActive: true })
      .sort({ stock: 1 })
      .limit(10)
      .populate("category", "name slug")
      .select("name sku stock price category"),
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$category.name",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          avgPrice: { $round: ["$avgPrice", 2] },
        },
      },
    ]),
  ]);

  return {
    topSelling,
    lowStock,
    categoryDistribution,
    totalProducts: await Product.countDocuments({ isActive: true }),
  };
};

module.exports = {
  getOverview,
  getRevenue,
  getOrders,
  getCustomers,
  getProducts,
};
