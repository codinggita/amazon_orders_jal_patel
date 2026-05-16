/**
 * @file authMiddleware.js
 * @description Authentication and Authorization middleware.
 *
 * WHY THIS EXISTS:
 * Protects routes from unauthenticated users (must have valid JWT) and
 * unauthorized users (must have correct role, e.g., 'admin').
 */

"use strict";

const jwt = require("jsonwebtoken");
const config = require("../config/env");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

/**
 * Protects routes — validates JWT and attaches the user to `req.user`.
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Extract the token from the Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2. Verify the token using the secret key
  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    return next(new ApiError("Invalid or expired token. Please log in again.", 401));
  }

  // 3. Check if the user still exists (they might have been deleted after token issuance)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token no longer exists.", 401)
    );
  }

  // 4. Attach user to request object and proceed to next middleware/controller
  req.user = currentUser;
  next();
});

/**
 * Restricts route access to specific roles.
 * MUST be called AFTER `protect` middleware so `req.user` exists.
 * @param  {...string} roles - Array of allowed roles (e.g., "admin", "vendor").
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if the current user's role is in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You do not have permission to perform this action.", 403) // 403 Forbidden
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
