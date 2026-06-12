"use strict";

const Order = require("../models/order.model");
const Product = require("../models/Product");
const Category = require("../models/Category");

const getTrendingProducts = async (period = 30, limit = 20) => {
  const parsedPeriod = Math.min(Math.max(parseInt(period, 10) || 30, 1), 365);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

  const since = new Date();
  since.setDate(since.getDate() - parsedPeriod);

  const previousPeriodStart = new Date(since);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - parsedPeriod);

  const trending = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
        status: { $ne: "cancelled" },
      },
    },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        name: { $first: "$orderItems.name" },
        totalSold: { $sum: "$orderItems.quantity" },
        revenue: {
          $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
        },
        orderCount: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        totalSold: 1,
        revenue: { $round: ["$revenue", 2] },
        orderCount: { $size: "$orderCount" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: parsedLimit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        name: 1,
        totalSold: 1,
        revenue: 1,
        orderCount: 1,
        price: "$product.price",
        image: { $arrayElemAt: ["$product.images", 0] },
        currentStock: "$product.stock",
      },
    },
  ]);

  const productIds = trending.map((p) => p._id);

  let previousSales = [];
  if (productIds.length > 0) {
    previousSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriodStart, $lt: since },
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.product": { $in: productIds },
        },
      },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" },
        },
      },
    ]);
  }

  const previousMap = {};
  previousSales.forEach((p) => {
    previousMap[p._id.toString()] = p.totalSold;
  });

  return trending.map((p) => {
    const productId = p._id.toString();
    const prevSold = previousMap[productId] || 0;
    const growthRate =
      prevSold > 0
        ? Math.round(((p.totalSold - prevSold) / prevSold) * 10000) / 100
        : p.totalSold > 0
          ? 100
          : 0;

    return {
      productId,
      name: p.name,
      price: p.price,
      image: p.image || null,
      totalSold: p.totalSold,
      revenue: p.revenue,
      orderCount: p.orderCount,
      currentStock: p.currentStock,
      previousPeriodSales: prevSold,
      growthRate,
      trending: growthRate > 50 ? "hot" : growthRate > 0 ? "rising" : "stable",
    };
  });
};

const getTrendingCategories = async (period = 30, limit = 10) => {
  const parsedPeriod = Math.min(Math.max(parseInt(period, 10) || 30, 1), 365);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 20);

  const since = new Date();
  since.setDate(since.getDate() - parsedPeriod);

  const previousPeriodStart = new Date(since);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - parsedPeriod);

  const trending = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
        status: { $ne: "cancelled" },
      },
    },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "productInfo.category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$categoryInfo._id",
        categoryName: { $first: "$categoryInfo.name" },
        categorySlug: { $first: "$categoryInfo.slug" },
        totalSold: { $sum: "$orderItems.quantity" },
        revenue: {
          $sum: {
            $multiply: ["$orderItems.price", "$orderItems.quantity"],
          },
        },
        orderCount: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        _id: 1,
        categoryName: 1,
        categorySlug: 1,
        totalSold: 1,
        revenue: { $round: ["$revenue", 2] },
        orderCount: { $size: "$orderCount" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: parsedLimit },
  ]);

  const categoryIds = trending
    .filter((c) => c._id)
    .map((c) => c._id);

  let previousSales = [];
  if (categoryIds.length > 0) {
    previousSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriodStart, $lt: since },
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          "productInfo.category": { $in: categoryIds },
        },
      },
      {
        $group: {
          _id: "$productInfo.category",
          totalSold: { $sum: "$orderItems.quantity" },
        },
      },
    ]);
  }

  const previousMap = {};
  previousSales.forEach((p) => {
    previousMap[p._id.toString()] = p.totalSold;
  });

  return trending.map((c) => {
    const categoryId = c._id ? c._id.toString() : "unknown";
    const prevSold = previousMap[categoryId] || 0;
    const growthRate =
      prevSold > 0
        ? Math.round(((c.totalSold - prevSold) / prevSold) * 10000) / 100
        : c.totalSold > 0
          ? 100
          : 0;

    return {
      categoryId,
      name: c.categoryName || "Uncategorized",
      slug: c.categorySlug,
      totalSold: c.totalSold,
      revenue: c.revenue,
      orderCount: c.orderCount,
      previousPeriodSales: prevSold,
      growthRate,
      trending: growthRate > 50 ? "hot" : growthRate > 0 ? "rising" : "stable",
    };
  });
};

module.exports = {
  getTrendingProducts,
  getTrendingCategories,
};
