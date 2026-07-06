"use strict";

const express = require("express");
const systemController = require("../controllers/systemController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/version", systemController.getVersion);
router.get("/uptime", systemController.getUptime);
router.get("/ping", systemController.getPing);

router.get("/status/database", systemController.getDatabaseStatus);
router.get("/status/cache", systemController.getCacheStatus);
router.get("/status/storage", systemController.getStorageStatus);

router.use(protect);
router.use(restrictTo("admin"));
router.get("/config", systemController.getConfig);

module.exports = router;
