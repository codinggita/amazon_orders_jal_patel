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
const bcrypt = require("bcryptjs");

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

// ─────────────────────────────────────────────────────────────
// PRE-SAVE HOOK (Password Hashing)
// ─────────────────────────────────────────────────────────────
// Runs before a user document is saved to the DB.
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified.
  // Prevents re-hashing an already hashed password on profile updates.
  if (!this.isModified("password")) return next();

  // Hash the password with a salt round of 12
  // Higher = more secure, but slower. 12 is a solid modern default.
  this.password = await bcrypt.hash(this.password, 12);
  
  next();
});

// ─────────────────────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────────────────────

/**
 * Compare an unhashed password from the user with the hashed DB password.
 * @param {string} candidatePassword - Password input by the user attempting to log in.
 * @returns {Promise<boolean>} True if passwords match.
 */
userSchema.methods.matchPassword = async function (candidatePassword) {
  // this.password is available here because we will explicitly select('+password') during login
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name (computed property, not stored in DB)
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);
