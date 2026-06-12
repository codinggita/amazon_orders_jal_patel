"use strict";

const express = require("express");
const recommendationController = require("../controllers/recommendationController");
const recommendationValidator = require("../validators/recommendationValidator");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get(
  "/products/:customerId",
  validate(recommendationValidator.getProductRecommendations),
  recommendationController.getProductRecommendations
);

router.get(
  "/orders/:orderId",
  validate(recommendationValidator.getOrderRecommendations),
  recommendationController.getOrderRecommendations
);

module.exports = router;
