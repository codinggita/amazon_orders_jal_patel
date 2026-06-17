"use strict";

const express = require("express");
const errorController = require("../controllers/errorController");

const router = express.Router();

router.get("/not-found", errorController.notFound);
router.get("/server-error", errorController.serverError);
router.get("/database", errorController.databaseError);
router.get("/validation", errorController.validationError);
router.get("/rate-limit", errorController.rateLimitError);
router.get("/token-expired", errorController.tokenExpiredError);
router.get("/payment-failed", errorController.paymentFailedError);
router.get("/shipping-failed", errorController.shippingFailedError);
router.get("/upload-error", errorController.uploadError);
router.get("/cache-error", errorController.cacheError);

module.exports = router;
