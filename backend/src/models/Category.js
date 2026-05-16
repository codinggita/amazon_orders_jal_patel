/**
 * @file Category.js
 * @description Mongoose schema and model for product Categories.
 *
 * ENGINEERING DECISION (Hierarchical Data):
 * We use the "Parent Reference" pattern. Each category points to its parent.
 * Why? Amazon has deep category trees (Electronics > Computers > Laptops).
 * Parent referencing makes it easy to find immediate subcategories, and
 * with $graphLookup, we can fetch the entire tree if needed.
 */

"use strict";

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true, // High read performance for SEO-friendly URLs
    },
    description: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // If null, it's a top-level root category
      index: true,   // Speeds up finding subcategories
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

module.exports = mongoose.model("Category", categorySchema);
