"use strict";

const Notification = require("../models/Notification");
const ApiError = require("../utils/ApiError");

const getNotifications = async (userId, query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { user: userId };
  if (query.unreadOnly === "true" || query.unreadOnly === true) {
    filter.isRead = false;
  }
  if (query.type) {
    filter.type = query.type;
  }

  const [results, totalResults] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalResults / limit);
  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
    unreadCount,
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    throw new ApiError("Notification not found", 404);
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    throw new ApiError("Notification not found", 404);
  }

  return notification;
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
};
