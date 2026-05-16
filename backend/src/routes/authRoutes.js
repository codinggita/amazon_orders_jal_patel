/**
 * @file authRoutes.js
 * @description Express routes for Authentication API.
 */

"use strict";

const express = require("express");
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const authValidator = require("../validators/authValidator");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", validate(authValidator.register), authController.register);
router.post("/login", validate(authValidator.login), authController.login);

// Protected routes (must be logged in)
router.use(protect); // Applies the 'protect' middleware to all routes below this line
router.get("/profile", authController.getProfile);
router.post("/logout", authController.logout);

module.exports = router;
