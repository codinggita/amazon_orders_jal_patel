"use strict";

const express = require("express");
const orderSortController = require("../controllers/orderSortController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect); // Ensure user is authenticated

// Explicit endpoints for specific sort types
router.get("/highest-value", orderSortController.sortByHighestValue);
router.get("/lowest-value", orderSortController.sortByLowestValue);
router.get("/latest", orderSortController.sortByLatest);
router.get("/oldest", orderSortController.sortByOldest);
router.get("/most-items", orderSortController.sortByMostItems);
router.get("/least-items", orderSortController.sortByLeastItems);
router.get("/discount", orderSortController.sortByDiscountAmount);

module.exports = router;
