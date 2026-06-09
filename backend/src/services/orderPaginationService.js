"use strict";

const Order = require("../models/order.model");

const getPagedOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [results, totalResults] = await Promise.all([
    Order.find().skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Order.countDocuments()
  ]);
  return { results, page: Number(page), limit: Number(limit), totalPages: Math.ceil(totalResults / limit), totalResults };
};

const getInfiniteScrollOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const results = await Order.find().skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
  return { results, nextPage: results.length === Number(limit) ? Number(page) + 1 : null };
};

const getRecentOrders = async (page = 1, limit = 5) => {
  const skip = (page - 1) * limit;
  return await Order.find().skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
};

const getCancelledOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await Order.find({ status: "cancelled" }).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
};

const getRefundedOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await Order.find({ status: "cancelled", isArchived: true }).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
};

const getCustomerOrders = async (customerId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await Order.find({ user: customerId }).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
};

const getProductOrders = async (productId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await Order.find({ "orderItems.product": productId }).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
};

module.exports = {
  getPagedOrders,
  getInfiniteScrollOrders,
  getRecentOrders,
  getCancelledOrders,
  getRefundedOrders,
  getCustomerOrders,
  getProductOrders,
};
