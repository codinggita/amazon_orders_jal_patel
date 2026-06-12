"use strict";

const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

const toObjectId = (id) => new mongoose.Types.ObjectId(id);
const toObjectIds = (ids) => ids.map(toObjectId);

const getProductRecommendations = async (customerId, limit = 10) => {
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const customerOrders = await Order.find({
    user: customerId,
    status: { $ne: "cancelled" },
  })
    .select("orderItems")
    .lean();

  const purchasedProductIds = [
    ...new Set(
      customerOrders.flatMap((o) =>
        o.orderItems.map((item) => item.product.toString())
      )
    ),
  ];

  if (purchasedProductIds.length === 0) {
    const topProducts = await Product.find({ isActive: true })
      .sort({ ratingsAverage: -1, ratingsQuantity: -1 })
      .limit(parsedLimit)
      .populate("category", "name slug")
      .select("name price images ratingsAverage ratingsQuantity category")
      .lean();

    return topProducts.map((p) => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || null,
      category: p.category?.name || null,
      rating: p.ratingsAverage,
      reason: "Top rated product",
    }));
  }

  const purchasedProducts = await Product.find({
    _id: { $in: purchasedProductIds },
    isActive: true,
  })
    .select("category")
    .lean();

  const categoryIds = [
    ...new Set(
      purchasedProducts
        .filter((p) => p.category)
        .map((p) => p.category.toString())
    ),
  ];

  const excludeIds = toObjectIds(purchasedProductIds);
  const matchCategory =
    categoryIds.length > 0
      ? { category: { $in: toObjectIds(categoryIds) } }
      : {};

  const recommendations = await Product.aggregate([
    {
      $match: {
        _id: { $nin: excludeIds },
        isActive: true,
        ...matchCategory,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { ratingsAverage: -1, ratingsQuantity: -1 } },
    { $limit: parsedLimit },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        images: 1,
        ratingsAverage: 1,
        ratingsQuantity: 1,
        "categoryInfo.name": 1,
      },
    },
  ]);

  if (recommendations.length < parsedLimit) {
    const existingIds = recommendations.map((r) => r._id.toString());
    const allExcludeIds = [...new Set([...purchasedProductIds, ...existingIds])];

    const fallback = await Product.aggregate([
      {
        $match: {
          _id: { $nin: toObjectIds(allExcludeIds) },
          isActive: true,
        },
      },
      { $sort: { ratingsQuantity: -1 } },
      { $limit: parsedLimit - recommendations.length },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          images: 1,
          ratingsAverage: 1,
          ratingsQuantity: 1,
          "categoryInfo.name": 1,
        },
      },
    ]);

    recommendations.push(...fallback);
  }

  return recommendations.map((p) => ({
    productId: p._id,
    name: p.name,
    price: p.price,
    image: p.images?.[0] || null,
    category: p.categoryInfo?.name || null,
    rating: p.ratingsAverage,
    reason:
      categoryIds.length > 0
        ? "Based on your purchase history"
        : "Popular product",
  }));
};

const getOrderRecommendations = async (orderId, limit = 10) => {
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const order = await Order.findById(orderId).select("orderItems").lean();
  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  const orderProductIds = order.orderItems
    .filter((item) => item.product)
    .map((item) => item.product.toString());

  if (orderProductIds.length === 0) {
    throw new ApiError("No products found in this order", 400);
  }

  const orderObjectIds = toObjectIds(orderProductIds);

  const relatedOrders = await Order.aggregate([
    { $match: { _id: { $ne: order._id }, status: { $ne: "cancelled" } } },
    { $unwind: "$orderItems" },
    {
      $match: {
        "orderItems.product": { $in: orderObjectIds },
      },
    },
    {
      $group: {
        _id: "$_id",
        allProducts: { $addToSet: "$orderItems.product" },
      },
    },
    { $limit: parsedLimit * 3 },
  ]);

  const recommendedProductIds = [
    ...new Set(
      relatedOrders.flatMap((o) =>
        o.allProducts
          .map((id) => id.toString())
          .filter((id) => !orderProductIds.includes(id))
      )
    ),
  ];

  if (recommendedProductIds.length === 0) {
    const categoryIds = await Product.distinct("category", {
      _id: { $in: orderObjectIds },
      isActive: true,
    });

    const similarProducts = await Product.aggregate([
      {
        $match: {
          _id: { $nin: orderObjectIds },
          isActive: true,
          ...(categoryIds.length > 0 ? { category: { $in: categoryIds } } : {}),
        },
      },
      { $sort: { ratingsAverage: -1 } },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          images: 1,
          ratingsAverage: 1,
          "categoryInfo.name": 1,
        },
      },
    ]);

    return similarProducts.map((p) => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || null,
      category: p.categoryInfo?.name || null,
      rating: p.ratingsAverage,
      reason: "Similar category products",
    }));
  }

  const products = await Product.find({
    _id: { $in: toObjectIds(recommendedProductIds) },
    isActive: true,
  })
    .populate("category", "name slug")
    .select("name price images ratingsAverage category")
    .lean();

  const productFrequency = {};
  relatedOrders.forEach((o) => {
    o.allProducts.forEach((pid) => {
      const id = pid.toString();
      if (!orderProductIds.includes(id)) {
        productFrequency[id] = (productFrequency[id] || 0) + 1;
      }
    });
  });

  products.sort(
    (a, b) =>
      (productFrequency[b._id.toString()] || 0) -
      (productFrequency[a._id.toString()] || 0)
  );

  return products.slice(0, parsedLimit).map((p) => ({
    productId: p._id,
    name: p.name,
    price: p.price,
    image: p.images?.[0] || null,
    category: p.category?.name || null,
    rating: p.ratingsAverage,
    reason: "Frequently bought together",
  }));
};

module.exports = {
  getProductRecommendations,
  getOrderRecommendations,
};
