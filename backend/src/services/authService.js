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
/**
 * Registers a new user.
 * @param {Object} userBody - The validated user registration payload.
 * @returns {Promise<Object>} An object containing the new user (without password) and token.
 */
const registerUser = async (userBody) => {
  const mongoose = require("mongoose");
  console.log(`[AuthService] [Register] Checking database connection state: ${mongoose.connection.readyState}`);
  if (mongoose.connection.readyState !== 1) {
    console.error("[AuthService] [Register] Database is not connected.");
    throw new ApiError("Database connection is currently unavailable", 500);
  }

  // Normalize name if name is provided instead of firstName / lastName
  if (userBody.name && (!userBody.firstName || !userBody.lastName)) {
    const nameParts = userBody.name.trim().split(/\s+/);
    userBody.firstName = nameParts[0] || "User";
    userBody.lastName = nameParts.slice(1).join(" ") || "User";
    console.log(`[AuthService] [Register] Split name "${userBody.name}" into firstName: "${userBody.firstName}", lastName: "${userBody.lastName}"`);
  }

  // Check if email already exists
  console.log(`[AuthService] [Register] Checking if email is already registered: "${userBody.email}"`);
  const existingUser = await User.findOne({ email: userBody.email });
  if (existingUser) {
    console.warn(`[AuthService] [Register] Registration failed: Email "${userBody.email}" already exists.`);
    throw new ApiError("Email is already registered.", 409); // 409 Conflict
  }

  // Create the user (password hashing is handled by the pre-save hook in User model)
  console.log(`[AuthService] [Register] Saving user to database...`);
  const user = await User.create(userBody);
  console.log(`[AuthService] [Register] User registered successfully with ID: ${user._id}`);

  // Remove password from the returned object
  const userResponse = user.toObject();
  delete userResponse.password;

  console.log(`[AuthService] [Register] Generating JWT token for user ID: ${user._id}`);
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
  const mongoose = require("mongoose");
  
  // 1. Verify database connection
  console.log(`[AuthService] [Login] Checking database connection state: ${mongoose.connection.readyState}`);
  if (mongoose.connection.readyState !== 1) {
    console.error("[AuthService] [Login] Database is not connected.");
    throw new ApiError("Database connection is currently unavailable", 500);
  }

  // 2. Find user by email and explicitly select the password field
  console.log(`[AuthService] [Login] Looking up user by email: "${email}"`);
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    console.warn(`[AuthService] [Login] User lookup failed for email: "${email}"`);
    throw new ApiError("Invalid email or password", 401); // 401 Unauthorized
  }
  console.log(`[AuthService] [Login] User found: ID = ${user._id}, Role = ${user.role}, IsActive = ${user.isActive}`);

  // 3. Check if user exists and password is correct using our instance method
  console.log(`[AuthService] [Login] Comparing password for user: ${user._id}`);
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    console.warn(`[AuthService] [Login] Password comparison failed for user: ${user._id}`);
    throw new ApiError("Invalid email or password", 401); // 401 Unauthorized
  }
  console.log(`[AuthService] [Login] Password matches successfully for user: ${user._id}`);

  // Remove password from the returned object
  const userResponse = user.toObject();
  delete userResponse.password;

  // 4. Generate JWT
  console.log(`[AuthService] [Login] Generating token for user: ${user._id}`);
  let token;
  try {
    token = generateToken(user._id);
    console.log(`[AuthService] [Login] JWT token generated successfully.`);
  } catch (err) {
    console.error(`[AuthService] [Login] JWT generation failed: ${err.message}`);
    throw new ApiError("Token generation failed", 500);
  }

  return { user: userResponse, token };
};

module.exports = {
  registerUser,
  loginUser,
};
