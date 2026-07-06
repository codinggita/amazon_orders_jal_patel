"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const notificationService = require("../services/notificationService");

const getNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.getNotifications(
    req.user._id,
    req.query
  );
  sendSuccess(res, 200, "Notifications retrieved successfully", result);
});

const markAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAsRead(
    req.params.id,
    req.user._id
  );
  sendSuccess(res, 200, "Notification marked as read", result);
});

const deleteNotification = catchAsync(async (req, res) => {
  const result = await notificationService.deleteNotification(
    req.params.id,
    req.user._id
  );
  sendSuccess(res, 200, "Notification deleted successfully", result);
});

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
};
