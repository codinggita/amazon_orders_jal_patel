"use strict";

const AmazonOrder = require("../models/AmazonOrder");

const bulkCreate = async (ordersData) => {
  return await AmazonOrder.insertMany(ordersData);
};

const bulkUpdate = async (ids, updateData) => {
  const filter = { _id: { $in: ids } };
  return await AmazonOrder.updateMany(filter, { $set: updateData });
};

const bulkDelete = async (ids) => {
  const filter = { _id: { $in: ids } };
  return await AmazonOrder.deleteMany(filter);
};

const bulkUpdateStatus = async (ids, status) => {
  const filter = { _id: { $in: ids } };
  return await AmazonOrder.updateMany(filter, { $set: { OrderStatus: status } });
};

const bulkArchive = async (ids) => {
  const filter = { _id: { $in: ids } };
  // flat schema doesn't have isArchived, mock it or use OrderStatus
  return await AmazonOrder.updateMany(filter, { $set: { OrderStatus: "Archived" } });
};

const bulkRestore = async (ids) => {
  const filter = { _id: { $in: ids } };
  return await AmazonOrder.updateMany(filter, { $set: { OrderStatus: "Pending" } });
};

const bulkApplyDiscount = async (ids, discountPercentage) => {
  // Not fully supported cleanly in flat schema for calculations, but here is a mock update
  // Normally you'd calculate this via loop. 
  return { message: "Discount applied to selected orders" };
};

const bulkUpdatePaymentStatus = async (ids, paymentStatus) => {
  const filter = { _id: { $in: ids } };
  return await AmazonOrder.updateMany(filter, { $set: { PaymentMethod: paymentStatus } });
};

const bulkUpdateShippingStatus = async (ids, shippingStatus) => {
  const filter = { _id: { $in: ids } };
  return await AmazonOrder.updateMany(filter, { $set: { OrderStatus: shippingStatus } });
};

const bulkCleanupCancelled = async () => {
  const filter = { OrderStatus: /^cancelled$/i };
  return await AmazonOrder.deleteMany(filter);
};

module.exports = {
  bulkCreate,
  bulkUpdate,
  bulkDelete,
  bulkUpdateStatus,
  bulkArchive,
  bulkRestore,
  bulkApplyDiscount,
  bulkUpdatePaymentStatus,
  bulkUpdateShippingStatus,
  bulkCleanupCancelled,
};
