/**
 * @file authController.js
 * @description Controller for Authentication APIs.
 */

"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/ApiResponse");
const authService = require("../services/authService");

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);
  sendSuccess(res, 201, "User registered successfully", result);
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  sendSuccess(res, 200, "Logged in successfully", result);
});

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
const getProfile = catchAsync(async (req, res) => {
  // req.user is set by the `protect` middleware
  sendSuccess(res, 200, "Profile retrieved successfully", { user: req.user });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 * 
 * NOTE: With standard stateless JWTs, logout is typically handled client-side
 * by deleting the token from local storage or memory. 
 * This endpoint is provided for consistency and future-proofing (e.g., if we 
 * move to cookie-based JWTs or a token blacklist).
 */
const logout = catchAsync(async (req, res) => {
  sendSuccess(res, 200, "Logged out successfully");
});

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
