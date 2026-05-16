/**
 * @file User.js
 * @description Mongoose schema and model for Users.
 *
 * ENGINEERING DECISION (Embedding vs Referencing):
 * We embed addresses inside the User document.
 * Why? A user typically has a small, bounded number of addresses (1-5).
 * Embedding them avoids an extra JOIN (lookup) when fetching a user's profile.
 * "Data that is accessed together should be stored together."
 */

"use strict";

const mongoose = require("mongoose");

// Sub-schema for addresses (embedded document)
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: "US" },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
      index: true, // Speeds up login lookups
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Security: Never return password in queries by default
    },
    role: {
      type: String,
      enum: ["customer", "admin", "vendor"],
      default: "customer",
    },
    phone: {
      type: String,
      trim: true,
    },
    addresses: [addressSchema], // Embedding the address sub-schema
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Virtual for full name (computed property, not stored in DB)
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);
