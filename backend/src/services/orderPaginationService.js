"use strict";

const AmazonOrder = require("../models/AmazonOrder");

const getPagedOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [results, totalResults] = await Promise.all([
    AmazonOrder.find().skip(skip).limit(Number(limit)).sort({ OrderDate: -1 }).lean(),
    AmazonOrder.countDocuments()
  ]);
  return { results, page: Number(page), limit: Number(limit), totalPages: Math.ceil(totalResults / limit), totalResults };
};

const getInfiniteScrollOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const results = await AmazonOrder.find().skip(skip).limit(Number(limit)).sort({ OrderDate: -1 }).lean();
  return { results, nextPage: results.length === Number(limit) ? Number(page) + 1 : null };
};

const getRecentOrders = async (page = 1, limit = 5) => {
  const skip = (page - 1) * limit;
  return await AmazonOrder.find().skip(skip).limit(Number(limit)).sort({ OrderDate: -1 }).lean();
};

const getCancelledOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await AmazonOrder.find({ OrderStatus: /^cancelled$/i }).skip(skip).limit(Number(limit)).sort({ OrderDate: -1 }).lean();
};

const getRefundedOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await AmazonOrder.find({ OrderStatus: /^returned$/i }).skip(skip).limit(Number(limit)).sort({ OrderDate: -1 }).lean();
};

const getCustomerOrders = async (customerId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await AmazonOrder.find({ CustomerID: customerId }).skip(skip).limit(Number(limit)).sort({ OrderDate: -1 }).lean();
};

const getProductOrders = async (productId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await AmazonOrder.find({ ProductName: productId }).skip(skip).limit(Number(limit)).sort({ OrderDate: -1 }).lean(); // productId acting as string name in flat dataset
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
