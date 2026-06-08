"use strict";

/**
 * @file order.service.js
 * @description Business logic layer for Orders.
 */

const Order = require("../models/order.model");
const ApiError = require("../utils/ApiError");
const QueryBuilder = require("../utils/QueryBuilder");
const { buildInvoice } = require("../utils/invoiceGenerator");
const { buildOrderHistory } = require("../utils/orderHistory");

const createOrder = async (orderBody) => {
  const order = await Order.create(orderBody);
  return order;
};

const queryOrders = async (query) => {
  const builder = new QueryBuilder(Order.find().populate("user", "firstName lastName email"), query)
    .filter()
    .search(["status"])
    .sort()
    .limitFields()
    .paginate()
    .lean();

  const orders = await builder.mongooseQuery;

  const countBuilder = new QueryBuilder(Order.find(), query).filter().search(["status"]);
  const totalResults = await countBuilder.mongooseQuery.countDocuments();

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: orders,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId).populate("user", "firstName lastName email");
  if (!order) {
    throw new ApiError("Order not found", 404);
  }
  return order;
};

const updateOrderById = async (orderId, updateBody) => {
  const order = await getOrderById(orderId);
  Object.assign(order, updateBody);
  await order.save();
  return order;
};

const deleteOrderById = async (orderId) => {
  const order = await getOrderById(orderId);
  await order.deleteOne();
  return order;
};

const replaceOrderById = async (orderId, replaceBody) => {
  const order = await Order.findOneAndReplace({ _id: orderId }, replaceBody, { new: true, runValidators: true }).populate("user", "firstName lastName email");
  if (!order) {
    throw new ApiError("Order not found", 404);
  }
  return order;
};

const _findOrderOrFail = async (orderId, populateOpts = null) => {
  let query = Order.findById(orderId);
  if (populateOpts) query = query.populate(populateOpts);
  const order = await query;
  if (!order) {
    throw new ApiError("Order not found.", 404);
  }
  return order;
};

const checkOrderExists = async (orderId) => {
  const exists = await Order.exists({ _id: orderId });
  return {
    exists: Boolean(exists),
    orderId,
  };
};

const getOrderSummary = async (orderId) => {
  const order = await Order.findById(orderId)
    .select(
      "_id status isArchived totalPrice itemsPrice taxPrice shippingPrice " +
      "cancelledAt cancelReason archivedAt createdAt updatedAt user"
    )
    .populate("user", "firstName lastName email");

  if (!order) throw new ApiError("Order not found.", 404);

  const itemCount = await Order.aggregate([
    { $match: { _id: order._id } },
    { $project: { itemCount: { $size: "$orderItems" }, totalQuantity: { $sum: "$orderItems.quantity" } } },
  ]);

  const meta = itemCount[0] || { itemCount: 0, totalQuantity: 0 };

  return {
    orderId: order._id,
    status: order.status,
    isArchived: order.isArchived,
    customer: order.user
      ? {
          id: order.user._id,
          name: `${order.user.firstName} ${order.user.lastName}`.trim(),
          email: order.user.email,
        }
      : null,
    pricing: {
      itemsPrice: order.itemsPrice,
      taxPrice: order.taxPrice,
      shippingPrice: order.shippingPrice,
      totalPrice: order.totalPrice,
    },
    itemCount: meta.itemCount,
    totalQuantity: meta.totalQuantity,
    cancelledAt: order.cancelledAt || null,
    cancelReason: order.cancelReason || null,
    archivedAt: order.archivedAt || null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const getOrderItems = async (orderId) => {
  const order = await Order.findById(orderId).select("orderItems status");
  if (!order) throw new ApiError("Order not found.", 404);

  const enrichedItems = order.orderItems.map((item) => ({
    productId: item.product,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image || null,
    lineTotal: Number((item.price * item.quantity).toFixed(2)),
  }));

  return {
    orderId,
    orderStatus: order.status,
    itemCount: enrichedItems.length,
    totalQuantity: enrichedItems.reduce((sum, i) => sum + i.quantity, 0),
    items: enrichedItems,
  };
};

const getOrderHistory = async (orderId) => {
  const order = await Order.findById(orderId).select(
    "statusHistory status createdAt updatedAt"
  );
  if (!order) throw new ApiError("Order not found.", 404);
  return buildOrderHistory(order);
};

const archiveOrder = async (orderId, actorEmail = "system") => {
  const order = await _findOrderOrFail(orderId);

  if (order.isArchived) {
    throw new ApiError("Order is already archived.", 409);
  }

  const archivableStatuses = ["delivered", "cancelled"];
  if (!archivableStatuses.includes(order.status)) {
    throw new ApiError(
      `Only orders with status 'delivered' or 'cancelled' can be archived. Current status: '${order.status}'.`,
      422
    );
  }

  order.isArchived = true;
  order.archivedAt = new Date();

  order.statusHistory.push({
    status: order.status,
    changedAt: new Date(),
    changedBy: actorEmail,
    note: "Order archived.",
  });

  await order.save();
  return order;
};

const restoreOrder = async (orderId, actorEmail = "system") => {
  const order = await _findOrderOrFail(orderId);

  if (!order.isArchived) {
    throw new ApiError("Order is not archived. Nothing to restore.", 409);
  }

  order.isArchived = false;
  order.archivedAt = null;

  order.statusHistory.push({
    status: order.status,
    changedAt: new Date(),
    changedBy: actorEmail,
    note: "Order restored from archive.",
  });

  await order.save();
  return order;
};

const cancelOrder = async (orderId, reason, actorEmail = "system") => {
  const order = await _findOrderOrFail(orderId);

  if (order.status === "cancelled") {
    throw new ApiError("Order is already cancelled.", 409);
  }

  const nonCancellable = ["shipped", "delivered"];
  if (nonCancellable.includes(order.status)) {
    throw new ApiError(
      `Orders with status '${order.status}' cannot be cancelled.`,
      422
    );
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = reason;

  await order.save();

  const lastEntry = order.statusHistory[order.statusHistory.length - 1];
  if (lastEntry && lastEntry.status === "cancelled") {
    lastEntry.changedBy = actorEmail;
    lastEntry.note = `Cancelled: ${reason}`;
    await order.save();
  }

  return order;
};

const duplicateOrder = async (orderId) => {
  const source = await _findOrderOrFail(orderId);

  const duplicatePayload = {
    user: source.user,
    orderItems: source.orderItems.map((item) => ({
      product: item.product,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    shippingAddress: {
      street: source.shippingAddress.street,
      city: source.shippingAddress.city,
      state: source.shippingAddress.state,
      postalCode: source.shippingAddress.postalCode,
      country: source.shippingAddress.country,
    },
    itemsPrice: source.itemsPrice,
    taxPrice: source.taxPrice,
    shippingPrice: source.shippingPrice,
    totalPrice: source.totalPrice,
  };

  const newOrder = await Order.create(duplicatePayload);

  return {
    sourceOrderId: source._id,
    duplicatedOrder: newOrder,
  };
};

const getOrderInvoice = async (orderId) => {
  const order = await Order.findById(orderId).populate(
    "user",
    "firstName lastName email"
  );
  if (!order) throw new ApiError("Order not found.", 404);
  return buildInvoice(order);
};

module.exports = {
  createOrder,
  queryOrders,
  getOrderById,
  updateOrderById,
  replaceOrderById,
  deleteOrderById,
  checkOrderExists,
  getOrderSummary,
  getOrderItems,
  getOrderHistory,
  archiveOrder,
  restoreOrder,
  cancelOrder,
  duplicateOrder,
  getOrderInvoice,
};
