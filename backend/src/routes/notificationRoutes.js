"use strict";

const express = require("express");
const notificationController = require("../controllers/notificationController");
const notificationValidator = require("../validators/notificationValidator");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  validate(notificationValidator.getNotifications),
  notificationController.getNotifications
);

router.patch(
  "/read/:id",
  validate(notificationValidator.markAsRead),
  notificationController.markAsRead
);

router.delete(
  "/:id",
  validate(notificationValidator.deleteNotification),
  notificationController.deleteNotification
);

module.exports = router;
