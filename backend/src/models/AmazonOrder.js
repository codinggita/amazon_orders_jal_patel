/**
 * @file AmazonOrder.js
 * @description Mongoose model for the flat Amazon orders dataset
 * stored in the "database" collection of the Amazon_order MongoDB database.
 *
 * Each document represents a single order row with denormalized fields —
 * no nested refs. This mirrors exactly what exists in the "database"
 * collection as seen in MongoDB Compass (21,629 documents).
 *
 * Field mapping from Compass:
 *   OrderID, OrderDate, CustomerID, CustomerName, ProductID, ProductName,
 *   Category, Brand, Quantity, UnitPrice, Discount, Tax, ShippingCost,
 *   TotalAmount, PaymentMethod, OrderStatus, City, State, Country, SellerID
 */

"use strict";

const mongoose = require("mongoose");

const amazonOrderSchema = new mongoose.Schema(
  {
    OrderID:       { type: String, index: true },
    OrderDate:     { type: String, index: true },
    CustomerID:    { type: String, index: true },
    CustomerName:  { type: String },
    ProductID:     { type: String },
    ProductName:   { type: String },
    Category:      { type: String, index: true },
    Brand:         { type: String },
    Quantity:      { type: String },
    UnitPrice:     { type: String },
    Discount:      { type: String },
    Tax:           { type: String },
    ShippingCost:  { type: String },
    TotalAmount:   { type: String },
    PaymentMethod: { type: String, index: true },
    OrderStatus:   { type: String, index: true },
    City:          { type: String },
    State:         { type: String },
    Country:       { type: String, index: true },
    SellerID:      { type: String },
  },
  {
    // The collection in MongoDB is literally called "database"
    collection: "database",
    // No timestamps — the dataset already has OrderDate
    timestamps: false,
  }
);

module.exports = mongoose.model("AmazonOrder", amazonOrderSchema);
