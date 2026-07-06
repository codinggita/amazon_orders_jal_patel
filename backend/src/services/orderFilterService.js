"use strict";

const Order = require("../models/order.model");

const filterByStatus = async (statusType) => {
  // Convert standard casing (e.g. "Pending" -> "pending")
  return await Order.find({ status: statusType.toLowerCase() }).populate("user", "name email");
};

const filterByPayment = async (method) => {
  // Payment gateway not integrated yet in DB, simulating behavior via totalPrice heuristics or returning all for now.
  // We'll mock this or query if we add a payment field later. For now, empty array or dummy lookup.
  return []; 
};

const filterByCategory = async (categoryName) => {
  // Category isn't snapshotted directly, so we use a regex on the product name as a proxy
  return await Order.find({ "orderItems.name": { $regex: categoryName, $options: "i" } });
};

const filterByBrand = async (brandName) => {
  // Brand isn't snapshotted directly, regex proxy
  return await Order.find({ "orderItems.name": { $regex: brandName, $options: "i" } });
};

const filterByPrice = async (min, max) => {
  return await Order.find({
    totalPrice: { $gte: Number(min) || 0, $lte: Number(max) || Infinity }
  });
};

const filterByDate = async (start, end) => {
  const query = {};
  if (start) query.$gte = new Date(start);
  if (end) query.$lte = new Date(end);
  return await Order.find({ createdAt: query });
};

const filterByCountry = async (countryName) => {
  return await Order.find({ "shippingAddress.country": { $regex: countryName, $options: "i" } });
};

const filterByState = async (stateName) => {
  return await Order.find({ "shippingAddress.state": { $regex: stateName, $options: "i" } });
};

const filterByCity = async (cityName) => {
  return await Order.find({ "shippingAddress.city": { $regex: cityName, $options: "i" } });
};

const filterByHighValue = async (amount) => {
  return await Order.find({ totalPrice: { $gte: Number(amount) || 1000 } });
};

const filterByDiscounted = async () => {
  // Orders where the total price is less than the raw items price (discount applied)
  return await Order.find({ $expr: { $lt: ["$totalPrice", "$itemsPrice"] } });
};

const filterByCancelled = async () => {
  return await Order.find({ status: "cancelled" });
};

const filterByRefunded = async () => {
  // Using cancelled + archived as proxy for refunded in this schema
  return await Order.find({ status: "cancelled", isArchived: true });
};

const filterByShipped = async () => {
  return await Order.find({ status: "shipped" });
};

const filterByDelivered = async () => {
  return await Order.find({ status: "delivered" });
};

module.exports = {
  filterByStatus,
  filterByPayment,
  filterByCategory,
  filterByBrand,
  filterByPrice,
  filterByDate,
  filterByCountry,
  filterByState,
  filterByCity,
  filterByHighValue,
  filterByDiscounted,
  filterByCancelled,
  filterByRefunded,
  filterByShipped,
  filterByDelivered,
};
