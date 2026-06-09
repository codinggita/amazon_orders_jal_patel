"use strict";

const express = require("express");
const orderFilterController = require("../controllers/orderFilterController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect); // Ensure user is authenticated

// The exact endpoints requested by the user
router.get("/status", orderFilterController.filterByStatus);
router.get("/payment", orderFilterController.filterByPayment);
router.get("/category", orderFilterController.filterByCategory);
router.get("/brand", orderFilterController.filterByBrand);
router.get("/price", orderFilterController.filterByPrice);
router.get("/date", orderFilterController.filterByDate);
router.get("/country", orderFilterController.filterByCountry);
router.get("/state", orderFilterController.filterByState);
router.get("/city", orderFilterController.filterByCity);
router.get("/high-value", orderFilterController.filterByHighValue);
router.get("/discounted", orderFilterController.filterByDiscounted);
router.get("/cancelled", orderFilterController.filterByCancelled);
router.get("/refunded", orderFilterController.filterByRefunded);
router.get("/shipped", orderFilterController.filterByShipped);
router.get("/delivered", orderFilterController.filterByDelivered);

module.exports = router;
