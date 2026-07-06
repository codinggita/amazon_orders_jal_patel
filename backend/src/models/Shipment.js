/**
 * @file Shipment.js
 * @description Mongoose schema and model for Shipments.
 *
 * ENGINEERING DECISION — Separation from Order:
 * In an Amazon-style system, one order containing 5 items might be split
 * into 2 separate shipments from different fulfillment centers.
 * Keeping Shipment as its own collection lets us:
 *  - Track each shipment independently
 *  - Support partial fulfillment (ship items 1-3 now, item 4 later)
 *  - Store carrier-specific tracking data without bloating the Order document
 *
 * PHASE 7 ADDITIONS:
 *  - trackingEvents[]   → Chronological carrier scan history (like real FedEx tracking)
 *  - shippingLabel      → Generated label metadata (number, URL, issued timestamp)
 *  - isReturned         → Soft flag for returned shipments (separate from status)
 *  - returnedAt         → Timestamp of return
 *  - returnReason       → Human-supplied reason for return
 *  - scheduledDeliveryDate → Rescheduled delivery target (PATCH reschedule)
 *  - deliveryNotes      → Special instructions (e.g., "Leave at door")
 *  - pre-save hook      → Auto-appends a tracking event on every status change
 */

"use strict";

const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Each entry records a carrier scan / status checkpoint.
 * Mirrors real-world tracking pages (FedEx, UPS, etc.)
 * _id: false — no need for a separate ObjectId per event.
 */
const trackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        "preparing",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "exception",
        "returned",
      ],
    },
    location: { type: String, default: "Fulfillment Center" },
    description: { type: String, default: null },
    occurredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Shipping label metadata generated when a label is created.
 * In a real system, labelUrl would be a signed S3 URL to the PDF.
 */
const shippingLabelSchema = new mongoose.Schema(
  {
    labelNumber: { type: String, required: true },
    labelUrl: { type: String, required: true },
    carrier: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Shipment Schema
// ─────────────────────────────────────────────────────────────────────────────

const shipmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true, // Critical: most queries filter by order
    },
    carrier: {
      type: String,
      enum: ["fedex", "ups", "usps", "dhl", "amazon_logistics"],
      required: true,
    },
    trackingNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values (label not yet created)
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
        "returned",
      ],
      default: "preparing",
      index: true, // Powers GET /pending, /delivered, /returned efficiently
    },

    // ── Partial Fulfillment Support ─────────────────────────────────────────
    // Which order items this shipment covers (one order → multiple shipments)
    shippedItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    // ── Delivery Dates ──────────────────────────────────────────────────────
    estimatedDeliveryDate: { type: Date, default: null },
    actualDeliveryDate: { type: Date, default: null },

    /**
     * PHASE 7: Reschedule support.
     * When a customer reschedules, this is set instead of modifying estimatedDeliveryDate
     * (preserving the original estimate for analytics).
     */
    scheduledDeliveryDate: { type: Date, default: null },

    // ── Phase 7: Tracking Event Timeline ───────────────────────────────────
    /**
     * Auto-populated by the pre-save hook on every status change.
     * Seeded with "preparing" on creation.
     */
    trackingEvents: {
      type: [trackingEventSchema],
      default: [],
    },

    // ── Phase 7: Shipping Label ─────────────────────────────────────────────
    shippingLabel: {
      type: shippingLabelSchema,
      default: null,
    },

    // ── Phase 7: Return Tracking ────────────────────────────────────────────
    isReturned: { type: Boolean, default: false, index: true },
    returnedAt: { type: Date, default: null },
    returnReason: { type: String, default: null, trim: true },

    // ── Phase 7: Delivery Notes ─────────────────────────────────────────────
    deliveryNotes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Compound Indexes for Phase 7 Query Optimization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * WHY COMPOUND INDEX on (status, createdAt):
 * GET /shipping/pending, /delivered, /returned all filter by status and sort
 * by createdAt. Without this index, MongoDB does a full collection scan.
 * With it: index-only scan → O(log n) → extremely fast even at 1M+ records.
 */
shipmentSchema.index({ status: 1, createdAt: -1 });

/**
 * WHY COMPOUND INDEX on (order, status):
 * GET /shipping/tracking/:orderId fetches by order ID and may filter by status.
 */
shipmentSchema.index({ order: 1, status: 1 });

// ─────────────────────────────────────────────────────────────────────────────
// Pre-Save Hook — Auto Tracking Event Logging
// ─────────────────────────────────────────────────────────────────────────────

/**
 * WHY A PRE-SAVE HOOK:
 * Every time a shipment's status changes, we want to record it automatically
 * in the trackingEvents array — exactly like real carrier systems.
 * Controllers never manually push to trackingEvents. This hook is the
 * single source of truth for all status transitions.
 */
shipmentSchema.pre("save", function (next) {
  if (this.isNew) {
    // Seed the initial "preparing" event on creation
    this.trackingEvents = [
      {
        status: "preparing",
        location: "Amazon Fulfillment Center",
        description: "Shipment created and awaiting pickup.",
        occurredAt: new Date(),
      },
    ];
  } else if (this.isModified("status")) {
    // Append a new event whenever status changes
    this.trackingEvents.push({
      status: this.status,
      location: "In Transit",
      description: `Status updated to: ${this.status.replace(/_/g, " ")}.`,
      occurredAt: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model("Shipment", shipmentSchema);
