/**
 * @file shippingService.js
 * Rewritten completely to query flat dataset of AmazonOrder.
 */
"use strict";

const AmazonOrder = require("../models/AmazonOrder");
const ApiError = require("../utils/ApiError");

const getTrackingByOrder = async (orderId) => {
  const order = await AmazonOrder.findOne({ OrderID: orderId }).lean() || await AmazonOrder.findById(orderId).lean();
  if (!order) throw new ApiError("Order not found.", 404);

  // Return a mocked tracking structure referencing flat fields
  return {
    shipmentId: order._id,
    orderId: order.OrderID || order._id,
    orderStatus: order.OrderStatus,
    shippingAddress: { city: order.City, state: order.State, country: order.Country },
    carrier: { code: "amazon_logistics", name: "Amazon Logistics" },
    trackingNumber: "AMZ-" + (order.OrderID || order._id),
    trackingUrl: null,
    status: order.OrderStatus?.toLowerCase() || 'pending',
    createdAt: order.OrderDate,
    updatedAt: new Date().toISOString(),
  };
};

const updateShipmentStatus = async (orderId, newStatus) => {
  const filter = orderId.includes("-") || orderId.length < 20 ? { OrderID: orderId } : { _id: orderId };
  await AmazonOrder.updateOne(filter, { $set: { OrderStatus: newStatus } });
  return await AmazonOrder.findOne(filter).lean();
};

const getPendingShipments = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  // Use OrderStatus matching pending logic
  const [results, totalResults] = await Promise.all([
    AmazonOrder.find({ OrderStatus: /^(pending|processing|dispatched)$/i }).skip(skip).limit(limit).lean(),
    AmazonOrder.countDocuments({ OrderStatus: /^(pending|processing|dispatched)$/i }),
  ]);

  return {
    results: results.map(o => ({ _id: o.OrderID || o._id, shippingAddress: { fullName: o.CustomerName, city: o.City, country: o.Country }, status: o.OrderStatus })),
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

const getDeliveredShipments = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [results, totalResults] = await Promise.all([
    AmazonOrder.find({ OrderStatus: /^delivered$/i }).skip(skip).limit(limit).lean(),
    AmazonOrder.countDocuments({ OrderStatus: /^delivered$/i }),
  ]);

  return {
    results: results.map(o => ({ _id: o.OrderID || o._id, shippingAddress: { fullName: o.CustomerName, city: o.City, country: o.Country }, status: o.OrderStatus })),
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

const getReturnedShipments = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [results, totalResults] = await Promise.all([
    AmazonOrder.find({ OrderStatus: /^returned$/i }).skip(skip).limit(limit).lean(),
    AmazonOrder.countDocuments({ OrderStatus: /^returned$/i }),
  ]);

  return {
    results: results.map(o => ({ _id: o.OrderID || o._id, shippingAddress: { fullName: o.CustomerName, city: o.City, country: o.Country }, status: o.OrderStatus })),
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

const createShippingLabel = async (orderId, carrier, shippingType = "standard") => {
  throw new ApiError("Label creation not supported in read-only bulk flat dataset", 400);
};

const getDeliveryEstimate = async (orderId) => {
  return { carriers: [] };
};

const getCarriers = () => {
  return { total: 0, carriers: [] };
};

const changeShippingAddress = async (orderId, newAddress) => {
  throw new ApiError("Cannot modify location data in immutable flat dataset", 400);
};

const rescheduleDelivery = async () => {
  throw new ApiError("Cannot reschedule in immutable flat dataset", 400);
};

module.exports = {
  getTrackingByOrder,
  updateShipmentStatus,
  getPendingShipments,
  getDeliveredShipments,
  getReturnedShipments,
  createShippingLabel,
  getDeliveryEstimate,
  getCarriers,
  changeShippingAddress,
  rescheduleDelivery,
};
