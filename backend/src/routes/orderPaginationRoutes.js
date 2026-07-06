"use strict";

const express = require("express");
const paginationController = require("../controllers/orderPaginationController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect); // Ensure user is authenticated

router.get("/paged", paginationController.getPagedOrders);
router.get("/infinite", paginationController.getInfiniteScrollOrders);
router.get("/recent", paginationController.getRecentOrders);
router.get("/cancelled", paginationController.getCancelledOrders);
router.get("/refunded", paginationController.getRefundedOrders);
router.get("/customer/:customerId", paginationController.getCustomerOrders);
router.get("/product/:productId", paginationController.getProductOrders);

module.exports = router;
