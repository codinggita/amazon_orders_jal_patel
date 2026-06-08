/**
 * @file shippingService.js
 * @description Phase 7 — Business logic layer for Shipping & Delivery Management.
 *
 * SERVICE LAYER RESPONSIBILITIES:
 *  - All MongoDB queries live here (not in controllers)
 *  - All business rule enforcement (e.g., "can't change address after pickup")
 *  - All cross-collection operations (Order + Shipment coordination)
 *  - Calls shippingUtils for pure computation (dates, label generation, etc.)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  API → Service Function Mapping                                    │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  GET  /shipping/tracking/:orderId      → getTrackingByOrder        │
 * │  PATCH /shipping/update-status/:orderId → updateShipmentStatus     │
 * │  GET  /shipping/pending                → getPendingShipments       │
 * │  GET  /shipping/delivered              → getDeliveredShipments     │
 * │  GET  /shipping/returned               → getReturnedShipments      │
 * │  POST  /shipping/create-label          → createShippingLabel       │
 * │  GET  /shipping/estimate/:orderId      → getDeliveryEstimate       │
 * │  GET  /shipping/carriers               → getCarriers               │
 * │  PATCH /shipping/change-address/:orderId → changeShippingAddress   │
 * │  POST  /shipping/reschedule/:orderId   → rescheduleDelivery        │
 * └─────────────────────────────────────────────────────────────────────┘
 */

"use strict";

const Shipment = require("../models/Shipment");
const Order = require("../models/order.model");
const ApiError = require("../utils/ApiError");
const {
  generateTrackingNumber,
  generateLabelNumber,
  generateLabelUrl,
  calculateEstimatedDelivery,
  getDeliveryWindow,
  getAllCarriers,
  getCarrierByCode,
} = require("../utils/shippingUtils");

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds a shipment by orderId and throws 404 if not found.
 * Used internally across multiple service functions.
 *
 * @param {string} orderId
 * @returns {Promise<import('mongoose').Document>} The shipment document.
 */
const _findShipmentByOrderOrFail = async (orderId) => {
  // First verify the order exists — gives a cleaner error message
  const orderExists = await Order.exists({ _id: orderId });
  if (!orderExists) throw new ApiError("Order not found.", 404);

  const shipment = await Shipment.findOne({ order: orderId });
  if (!shipment) {
    throw new ApiError(
      "No shipment found for this order. A label may not have been created yet.",
      404
    );
  }
  return shipment;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Get Tracking Info by Order ID
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the full tracking detail for an order's shipment.
 *
 * REQUEST LIFECYCLE:
 *   Client → protect → validate → controller → this service → MongoDB
 *
 * QUERY LOGIC:
 *   findOne({ order: orderId }) — uses the compound index (order, status).
 *   Populates the linked Order's shipping address for display.
 *
 * EDGE CASES:
 *   - Order not found → 404 ("Order not found")
 *   - Shipment not found → 404 ("No shipment found for this order")
 *   - Multiple shipments per order: `findOne` returns the most recent by default.
 *     In a production system with partial fulfillment, this would return an array.
 *
 * @param {string} orderId
 * @returns {Promise<Object>} Tracking payload
 */
const getTrackingByOrder = async (orderId) => {
  const shipment = await Shipment.findOne({ order: orderId }).populate(
    "order",
    "shippingAddress status totalPrice"
  );

  if (!shipment) {
    // Check if order itself exists for a precise error message
    const orderExists = await Order.exists({ _id: orderId });
    if (!orderExists) throw new ApiError("Order not found.", 404);
    throw new ApiError("No shipment record found for this order.", 404);
  }

  // Build carrier tracking URL if tracking number exists
  const carrierConfig = getCarrierByCode(shipment.carrier);
  const trackingUrl =
    shipment.trackingNumber && carrierConfig
      ? `${carrierConfig.trackingUrlBase}${shipment.trackingNumber}`
      : null;

  return {
    shipmentId: shipment._id,
    orderId: shipment.order._id || orderId,
    orderStatus: shipment.order.status,
    shippingAddress: shipment.order.shippingAddress,
    carrier: {
      code: shipment.carrier,
      name: carrierConfig ? carrierConfig.name : shipment.carrier,
    },
    trackingNumber: shipment.trackingNumber || null,
    trackingUrl,
    status: shipment.status,
    isReturned: shipment.isReturned,
    estimatedDeliveryDate: shipment.estimatedDeliveryDate,
    scheduledDeliveryDate: shipment.scheduledDeliveryDate,
    actualDeliveryDate: shipment.actualDeliveryDate,
    deliveryNotes: shipment.deliveryNotes,
    trackingEvents: shipment.trackingEvents,
    shippingLabel: shipment.shippingLabel
      ? {
          labelNumber: shipment.shippingLabel.labelNumber,
          labelUrl: shipment.shippingLabel.labelUrl,
          issuedAt: shipment.shippingLabel.issuedAt,
        }
      : null,
    createdAt: shipment.createdAt,
    updatedAt: shipment.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Update Shipment Status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates a shipment's status and optionally records location + description.
 *
 * BUSINESS RULES:
 *  1. Cannot set to "preparing" once past that stage (no backwards transitions
 *     except admin override — enforced at route level with restrictTo).
 *  2. When status becomes "delivered": set actualDeliveryDate = now.
 *  3. When status becomes "returned": set isReturned = true, returnedAt = now.
 *  4. The pre-save hook auto-appends a trackingEvent entry.
 *
 * QUERY LOGIC:
 *   Uses `shipment.save()` (not findByIdAndUpdate) so the pre-save hook fires.
 *
 * EDGE CASES:
 *  - Same status → still updates (idempotent, returns current state)
 *  - Invalid status string → caught by Joi validator before reaching service
 *
 * @param {string} orderId
 * @param {string} newStatus
 * @param {string} [location]
 * @param {string} [description]
 * @returns {Promise<Object>} Updated shipment
 */
const updateShipmentStatus = async (orderId, newStatus, location, description) => {
  const shipment = await _findShipmentByOrderOrFail(orderId);

  shipment.status = newStatus; // Triggers pre-save hook → appends trackingEvent

  // Auto-set delivery timestamps based on terminal status
  if (newStatus === "delivered") {
    shipment.actualDeliveryDate = new Date();
  }
  if (newStatus === "returned") {
    shipment.isReturned = true;
    shipment.returnedAt = new Date();
  }

  await shipment.save();

  // If caller provided custom location/description, patch the last event
  if ((location || description) && shipment.trackingEvents.length > 0) {
    const lastEvent = shipment.trackingEvents[shipment.trackingEvents.length - 1];
    if (location) lastEvent.location = location;
    if (description) lastEvent.description = description;
    await shipment.save();
  }

  return shipment;
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Get Pending Shipments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all shipments in an "active" (not yet delivered or returned) state.
 * Pending = preparing | picked_up | in_transit | out_for_delivery | exception
 *
 * QUERY LOGIC:
 *   Uses $in operator on indexed `status` field.
 *   Sorted by createdAt ASC (oldest unshipped orders first — FIFO fulfillment).
 *   The compound index (status, createdAt) makes this extremely fast.
 *
 * PAGINATION:
 *   Accepts page/limit for admin dashboards with potentially thousands of records.
 *
 * @param {Object} query - { page, limit }
 * @returns {Promise<Object>}
 */
const getPendingShipments = async ({ page = 1, limit = 20 } = {}) => {
  const PENDING_STATUSES = ["preparing", "picked_up", "in_transit", "out_for_delivery", "exception"];

  const skip = (page - 1) * limit;

  const [shipments, totalResults] = await Promise.all([
    Shipment.find({ status: { $in: PENDING_STATUSES } })
      .populate("order", "user totalPrice status shippingAddress")
      .sort({ createdAt: 1 }) // Oldest first — prioritize fulfillment
      .skip(skip)
      .limit(limit)
      .lean(), // .lean() for read-only — 2-3x faster (plain JS objects)
    Shipment.countDocuments({ status: { $in: PENDING_STATUSES } }),
  ]);

  return {
    results: shipments,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Get Delivered Shipments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all shipments with status "delivered".
 *
 * QUERY LOGIC:
 *   Filters by status: "delivered" (indexed).
 *   Sorted by actualDeliveryDate DESC (most recently delivered first).
 *
 * @param {Object} query - { page, limit }
 * @returns {Promise<Object>}
 */
const getDeliveredShipments = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [shipments, totalResults] = await Promise.all([
    Shipment.find({ status: "delivered" })
      .populate("order", "user totalPrice shippingAddress")
      .sort({ actualDeliveryDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Shipment.countDocuments({ status: "delivered" }),
  ]);

  return {
    results: shipments,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Get Returned Shipments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all shipments that have been returned.
 *
 * QUERY LOGIC:
 *   Filters by isReturned: true (indexed boolean).
 *   This is intentionally separate from status: "returned" to catch
 *   any edge case where isReturned was manually set without a status change.
 *
 * @param {Object} query - { page, limit }
 * @returns {Promise<Object>}
 */
const getReturnedShipments = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [shipments, totalResults] = await Promise.all([
    Shipment.find({ isReturned: true })
      .populate("order", "user totalPrice shippingAddress")
      .sort({ returnedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Shipment.countDocuments({ isReturned: true }),
  ]);

  return {
    results: shipments,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Create Shipping Label
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates (or finds and updates) a shipment record and generates a shipping label.
 *
 * UPSERT PATTERN:
 *   If a Shipment already exists for the order → add label to it.
 *   If not → create a brand new Shipment with the label.
 *   This prevents duplicate shipments from double-submits.
 *
 * BUSINESS RULES:
 *  - Order must exist and must NOT be cancelled or archived
 *  - A label can be regenerated if the old one was lost (overwrites)
 *  - Generates a tracking number if one doesn't exist yet
 *
 * QUERY LOGIC:
 *   Order.findById → existence + status check
 *   Shipment.findOne → check for existing shipment
 *   shipment.save() → triggers pre-save hook (seeds trackingEvents on create)
 *
 * @param {string} orderId
 * @param {string} carrier
 * @param {"standard"|"express"|"overnight"} shippingType
 * @returns {Promise<Object>}
 */
const createShippingLabel = async (orderId, carrier, shippingType = "standard") => {
  // 1. Verify order exists and is in a valid state for label creation
  const order = await Order.findById(orderId).select("status isArchived shippingAddress");
  if (!order) throw new ApiError("Order not found.", 404);
  if (order.status === "cancelled") {
    throw new ApiError("Cannot create a shipping label for a cancelled order.", 422);
  }
  if (order.isArchived) {
    throw new ApiError("Cannot create a shipping label for an archived order.", 422);
  }

  // 2. Validate carrier
  const carrierConfig = getCarrierByCode(carrier);
  if (!carrierConfig) {
    throw new ApiError(
      `Invalid carrier: '${carrier}'. Valid options: fedex, ups, usps, dhl, amazon_logistics.`,
      400
    );
  }

  // 3. Calculate estimated delivery
  const estimation = calculateEstimatedDelivery(carrier, shippingType);

  // 4. Generate label artifacts
  const labelNumber = generateLabelNumber();
  const labelUrl = generateLabelUrl(labelNumber, carrier);

  // 5. Upsert: find existing shipment or create new
  let shipment = await Shipment.findOne({ order: orderId });
  const isNew = !shipment;

  if (isNew) {
    shipment = new Shipment({
      order: orderId,
      carrier,
      trackingNumber: generateTrackingNumber(carrier),
      estimatedDeliveryDate: estimation.estimatedDate,
    });
  } else {
    // Update carrier/estimation on existing shipment if re-labelling
    shipment.carrier = carrier;
    if (!shipment.trackingNumber) {
      shipment.trackingNumber = generateTrackingNumber(carrier);
    }
    shipment.estimatedDeliveryDate = estimation.estimatedDate;
  }

  // 6. Attach label metadata
  shipment.shippingLabel = {
    labelNumber,
    labelUrl,
    carrier: carrierConfig.name,
    issuedAt: new Date(),
  };

  await shipment.save();

  return {
    shipmentId: shipment._id,
    orderId,
    isNewShipment: isNew,
    carrier: carrierConfig.name,
    carrierCode: carrier,
    trackingNumber: shipment.trackingNumber,
    shippingType,
    estimatedDeliveryDate: estimation.estimatedDate,
    transitDays: estimation.transitDays,
    shippingCost: estimation.baseRate,
    shippingCostFormatted: `$${estimation.baseRate.toFixed(2)}`,
    label: {
      labelNumber,
      labelUrl,
      issuedAt: shipment.shippingLabel.issuedAt,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Get Delivery Estimate
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns delivery time estimates for ALL carriers and shipping types for an order.
 * This powers a "Choose Your Shipping" UI section.
 *
 * QUERY LOGIC:
 *   Only fetches order existence — no Shipment record needed.
 *   Pure computation via shippingUtils after DB check.
 *
 * EDGE CASES:
 *   - Cancelled order → still returns estimates (user might want to re-order)
 *   - Estimates are computed from "now" — time-sensitive but acceptable
 *
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
const getDeliveryEstimate = async (orderId) => {
  const order = await Order.findById(orderId).select("status shippingAddress");
  if (!order) throw new ApiError("Order not found.", 404);

  const carrierCodes = ["fedex", "ups", "usps", "dhl", "amazon_logistics"];
  const shippingTypes = ["standard", "express", "overnight"];

  const estimates = carrierCodes.map((code) => {
    const carrierConfig = getCarrierByCode(code);
    const options = shippingTypes.map((type) => {
      const est = calculateEstimatedDelivery(code, type);
      const window = getDeliveryWindow(est.estimatedDate);
      return {
        shippingType: type,
        transitDays: est.transitDays,
        estimatedDate: est.estimatedDate,
        deliveryWindow: window.fullLabel,
        cost: est.baseRate,
        costFormatted: `$${est.baseRate.toFixed(2)}`,
      };
    });

    return {
      carrier: carrierConfig.name,
      carrierCode: code,
      features: carrierConfig.features,
      options,
    };
  });

  return {
    orderId,
    orderStatus: order.status,
    deliveryAddress: order.shippingAddress,
    estimatesGeneratedAt: new Date().toISOString(),
    carriers: estimates,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Get All Carriers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns metadata for all supported shipping carriers.
 * No DB query — pure config lookup.
 *
 * USE CASE:
 *   Populates carrier selection dropdowns in admin or customer UI.
 *
 * @returns {Object}
 */
const getCarriers = () => {
  const carriers = getAllCarriers();
  return {
    total: carriers.length,
    carriers,
    retrievedAt: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Change Shipping Address
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates the shipping address on an Order document.
 *
 * WHY WE UPDATE THE ORDER (not the Shipment):
 * The shipping address is on the Order — it was the original delivery intent.
 * If the carrier hasn't picked up yet, the address can be corrected.
 * After pickup, the carrier has the package — a digital address change is meaningless.
 *
 * BUSINESS RULES:
 *  1. Order must not be cancelled, delivered, or archived.
 *  2. Shipment (if exists) must be in "preparing" status.
 *     Once "picked_up" → 422 Unprocessable Entity.
 *  3. If no shipment exists yet, address change is always allowed.
 *
 * QUERY LOGIC:
 *   Order.findById → status check
 *   Shipment.findOne → pickup status check
 *   order.save() → saves updated shippingAddress
 *
 * @param {string} orderId
 * @param {Object} newAddress - { street, city, state, postalCode, country }
 * @returns {Promise<Object>}
 */
const changeShippingAddress = async (orderId, newAddress) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found.", 404);

  // Terminal states — address change is meaningless
  const blockedStatuses = ["cancelled", "delivered"];
  if (blockedStatuses.includes(order.status)) {
    throw new ApiError(
      `Cannot change address for an order with status '${order.status}'.`,
      422
    );
  }
  if (order.isArchived) {
    throw new ApiError("Cannot change address for an archived order.", 422);
  }

  // Check if shipment has already been picked up
  const shipment = await Shipment.findOne({ order: orderId }).select("status");
  if (shipment && shipment.status !== "preparing") {
    throw new ApiError(
      `Address cannot be changed once the shipment has been '${shipment.status}'. Contact the carrier directly.`,
      422
    );
  }

  // Apply address update
  const previousAddress = { ...order.shippingAddress.toObject() };
  order.shippingAddress = newAddress;
  await order.save();

  return {
    orderId,
    previousAddress,
    updatedAddress: order.shippingAddress,
    updatedAt: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. Reschedule Delivery
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reschedules the delivery of a shipment to a new target date.
 *
 * DESIGN DECISION:
 * We set `scheduledDeliveryDate` (not overwrite `estimatedDeliveryDate`).
 * This preserves the original carrier estimate for analytics and SLA tracking.
 * The frontend shows scheduledDeliveryDate when present, estimatedDeliveryDate as fallback.
 *
 * BUSINESS RULES:
 *  1. Shipment must exist for the order.
 *  2. Cannot reschedule if already delivered or returned.
 *  3. New scheduled date must be in the future (validated by Joi).
 *  4. Optionally records delivery notes (e.g., "Ring bell, not doorbell").
 *
 * @param {string} orderId
 * @param {string} scheduledDeliveryDate - ISO 8601 date string
 * @param {string} [deliveryNotes]
 * @returns {Promise<Object>}
 */
const rescheduleDelivery = async (orderId, scheduledDeliveryDate, deliveryNotes) => {
  const shipment = await _findShipmentByOrderOrFail(orderId);

  // Cannot reschedule terminal states
  const terminalStatuses = ["delivered", "returned"];
  if (terminalStatuses.includes(shipment.status)) {
    throw new ApiError(
      `Cannot reschedule a shipment that is already '${shipment.status}'.`,
      422
    );
  }

  const newDate = new Date(scheduledDeliveryDate);
  if (newDate <= new Date()) {
    throw new ApiError("Scheduled delivery date must be in the future.", 400);
  }

  shipment.scheduledDeliveryDate = newDate;
  if (deliveryNotes !== undefined) {
    shipment.deliveryNotes = deliveryNotes;
  }

  // Append a tracking event for the reschedule
  shipment.trackingEvents.push({
    status: shipment.status,
    location: "Customer Request",
    description: `Delivery rescheduled to ${newDate.toDateString()}.${deliveryNotes ? " Notes: " + deliveryNotes : ""}`,
    occurredAt: new Date(),
  });

  await shipment.save();

  const window = getDeliveryWindow(newDate);

  return {
    shipmentId: shipment._id,
    orderId,
    previousEstimatedDate: shipment.estimatedDeliveryDate,
    newScheduledDate: shipment.scheduledDeliveryDate,
    deliveryWindow: window.fullLabel,
    deliveryNotes: shipment.deliveryNotes,
    status: shipment.status,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  getTrackingByOrder,
  updateShipmentStatus,
  getPendingShipments,
  getDeliveredShipments,
  getReturnedShipments,
  createShippingLabel,
  getDeliveryEstimate,
  getCarriers,
  changeShippingAddress,
  rescheduleDelivery,
};
