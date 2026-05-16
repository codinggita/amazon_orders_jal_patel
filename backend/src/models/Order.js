/**
 * @file Order.js
 * @description Mongoose schema and model for Orders.
 *
 * ENGINEERING DECISION (Snapshotting vs Referencing):
 * For order items, we copy (snapshot) the product name, price, and image.
 * WE DO NOT JUST REFERENCE THE PRODUCT ID.
 * Why? If a product's price changes tomorrow from $10 to $20,
 * an order placed today must forever show it was purchased at $10.
 *
 * The shipping address is also snapshotted. If a user updates their default
 * address later, it shouldn't change the address of an order that already shipped.
 */

"use strict";

const mongoose = require("mongoose");

// Sub-schema for items in the cart/order
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  // Snapshot data: captured at the time of purchase
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

// Sub-schema for the snapshot of the shipping address
const shippingAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Needed to quickly fetch "My Orders"
    },
    orderItems: {
      type: [orderItemSchema],
      validate: [
        (val) => val.length > 0,
        "Order must contain at least one item",
      ],
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    // Monetary calculations
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true, // Crucial for admin dashboard filtering
    },
    // Payments & Shipments will reference this order's _id.
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
