"use strict";

const Order = require("../models/order.model");

const sortByHighestValue = async () => {
  return await Order.find().sort({ totalPrice: -1 }).limit(50);
};

const sortByLowestValue = async () => {
  return await Order.find().sort({ totalPrice: 1 }).limit(50);
};

const sortByLatest = async () => {
  return await Order.find().sort({ createdAt: -1 }).limit(50);
};

const sortByOldest = async () => {
  return await Order.find().sort({ createdAt: 1 }).limit(50);
};

const sortByMostItems = async () => {
  return await Order.aggregate([
    {
      $addFields: {
        totalItems: { $sum: "$orderItems.quantity" }
      }
    },
    { $sort: { totalItems: -1 } },
    { $limit: 50 }
  ]);
};

const sortByLeastItems = async () => {
  return await Order.aggregate([
    {
      $addFields: {
        totalItems: { $sum: "$orderItems.quantity" }
      }
    },
    { $sort: { totalItems: 1 } },
    { $limit: 50 }
  ]);
};

const sortByDiscountAmount = async () => {
  return await Order.aggregate([
    {
      $addFields: {
        discountAmount: { $subtract: ["$itemsPrice", "$totalPrice"] }
      }
    },
    { $sort: { discountAmount: -1 } },
    { $limit: 50 }
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
