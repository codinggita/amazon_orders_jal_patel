/**
 * @file Shipment.js
 * @description Mongoose schema and model for Shipments.
 *
 * ENGINEERING DECISION:
 * Separated from the Order model. Why? In an Amazon-style system,
 * one order containing 5 items might be split into 2 separate shipments
 * coming from different fulfillment centers.
 */

"use strict";

const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    carrier: {
      type: String,
      enum: ["fedex", "ups", "usps", "dhl", "amazon_logistics"],
      required: true,
    },
    trackingNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "preparing",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "exception",
      ],
      default: "preparing",
    },
    // For partial fulfillment (which items in the order this shipment covers)
    shippedItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
    estimatedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
