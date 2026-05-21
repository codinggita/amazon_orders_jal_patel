/**
 * @file authService.js
 * @description Business logic layer for Authentication.
 */

"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const config = require("../config/env");

/**
 * Generates a signed JWT token for a user.
 * @param {string} userId - The MongoDB ObjectId of the user.
 * @returns {string} The signed JWT token.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

/**
 * Registers a new user.
 * @param {Object} userBody - The validated user registration payload.
 * @returns {Promise<Object>} An object containing the new user (without password) and token.
 */
const registerUser = async (userBody) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: userBody.email });
  if (existingUser) {
    throw new ApiError("Email is already registered.", 409); // 409 Conflict
  }

  // Create the user (password hashing is handled by the pre-save hook in User model)
  const user = await User.create(userBody);

  // Remove password from the returned object
  const userResponse = user.toObject();
  delete userResponse.password;

  const token = generateToken(user._id);

  return { user: userResponse, token };
};

/**
 * Authenticates a user and returns a token.
 * @param {string} email - The user's email.
 * @param {string} password - The unhashed password.
 * @returns {Promise<Object>} An object containing the user (without password) and token.
 */
const loginUser = async (email, password) => {
  // 1. Find user by email and explicitly select the password field
  //    (because it is set to select: false in the schema)
  const user = await User.findOne({ email }).select("+password");

  // 2. Check if user exists and password is correct using our instance method
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError("Invalid email or password", 401); // 401 Unauthorized
  }

  // Remove password from the returned object
  const userResponse = user.toObject();
  delete userResponse.password;

  const token = generateToken(user._id);

  return { user: userResponse, token };
};

module.exports = {
  registerUser,
  loginUser,
};
