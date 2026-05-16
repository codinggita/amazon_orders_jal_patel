/**
 * @file Payment.js
 * @description Mongoose schema and model for Payments.
 *
 * ENGINEERING DECISION:
 * Payment logic is separated from the Order model.
 * Why? A single order might have multiple payment attempts (e.g., credit card
 * failed, then paid with PayPal). Separating them allows us to track the history
 * of transactions cleanly.
 */

"use strict";

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined if payment hasn't processed yet
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "stripe", "amazon_pay"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed, // Raw JSON response from Stripe/PayPal for auditing
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
