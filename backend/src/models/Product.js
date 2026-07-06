/**
 * @file Product.js
 * @description Mongoose schema and model for Products.
 *
 * ENGINEERING DECISION (Referencing & Indexing):
 * We reference the Category (1-to-many).
 * We do NOT embed reviews here. An Amazon product can have 50,000 reviews.
 * Embedding them would breach the MongoDB 16MB document size limit.
 * Instead, we store aggregate metrics (ratingsAverage, ratingsQuantity)
 * and keep the actual review text in a separate Review collection.
 *
 * We heavily index price, category, and name for sorting and filtering.
 */

"use strict";

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: "text", // Enables full-text search (e.g. $text query)
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      index: true, // Crucial for filtering/sorting (e.g., price < 50)
    },
    currency: {
      type: String,
      default: "USD",
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
      index: true,
    },
    images: {
      type: [String],
      validate: {
        validator: function (val) {
          return val.length <= 10; // Max 10 images per product
        },
        message: "A product can have a maximum of 10 images",
      },
    },
    // Denormalized aggregated review metrics
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating must be above 0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal place (e.g. 4.6666 -> 4.7)
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying active products by category sorted by price
productSchema.index({ category: 1, isActive: 1, price: 1 });

module.exports = mongoose.model("Product", productSchema);
