"use strict";

const express = require("express");
const activityController = require("../controllers/activityController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

router.get("/logs", activityController.getActivityLogs);

module.exports = router;
