"use strict";

const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Product = require("../models/Product");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const validateOrderData = async (data) => {
  const errors = [];

  if (!data.orderItems || data.orderItems.length === 0) {
    errors.push("Order must contain at least one item");
  }

  if (data.orderItems) {
    for (let i = 0; i < data.orderItems.length; i++) {
      const item = data.orderItems[i];
      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        const product = await Product.findById(item.product).lean();
        if (!product) {
          errors.push(`Product at index ${i} not found`);
        } else if (!product.isActive) {
          errors.push(`Product "${product.name}" is no longer active`);
        } else if (item.quantity && product.stock < item.quantity) {
          errors.push(
            `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.stock}`
          );
        }
      }
    }
  }

  if (data.user && mongoose.Types.ObjectId.isValid(data.user)) {
    const user = await User.findById(data.user).lean();
    if (!user) {
      errors.push("User not found");
    } else if (!user.isActive) {
      errors.push("User account is deactivated");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    validatedData: errors.length === 0 ? data : undefined,
  };
};

const validateOrderUpdateData = async (orderId, data) => {
  const errors = [];

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    errors.push("Invalid order ID format");
    return { valid: false, errors };
  }

  const order = await Order.findById(orderId).lean();
  if (!order) {
    errors.push("Order not found");
    return { valid: false, errors };
  }

  if (data.status) {
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(data.status)) {
      errors.push(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    if (
      order.status === "delivered" &&
      data.status !== "cancelled"
    ) {
      errors.push("Cannot change status of a delivered order");
    }

    if (order.status === "cancelled") {
      errors.push("Cannot update a cancelled order");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    validatedData: errors.length === 0 ? { orderId, ...data } : undefined,
  };
};

const validatePaymentData = async (data) => {
  const errors = [];

  const validMethods = ["credit_card", "paypal", "stripe", "amazon_pay"];
  if (data.paymentMethod && !validMethods.includes(data.paymentMethod)) {
    errors.push(`Invalid payment method. Must be one of: ${validMethods.join(", ")}`);
  }

  if (data.amount !== undefined && (typeof data.amount !== "number" || data.amount <= 0)) {
    errors.push("Amount must be a positive number");
  }

  if (data.order && mongoose.Types.ObjectId.isValid(data.order)) {
    const order = await Order.findById(data.order).lean();
    if (!order) {
      errors.push("Associated order not found");
    }
  }

  if (data.user && mongoose.Types.ObjectId.isValid(data.user)) {
    const user = await User.findById(data.user).lean();
    if (!user) {
      errors.push("User not found");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    validatedData: errors.length === 0 ? data : undefined,
  };
};

const validateAddressData = async (data) => {
  const errors = [];

  const requiredFields = ["street", "city", "state", "postalCode", "country"];
  requiredFields.forEach((field) => {
    if (!data[field] || (typeof data[field] === "string" && data[field].trim() === "")) {
      errors.push(`${field} is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    validatedData: errors.length === 0 ? data : undefined,
  };
};

const validateAuthRegisterData = async (data) => {
  const errors = [];

  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.push("First name must be at least 2 characters");
  }

  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.push("Last name must be at least 2 characters");
  }

  if (!data.email) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    } else {
      const existingUser = await User.findOne({ email: data.email.toLowerCase() }).lean();
      if (existingUser) {
        errors.push("Email is already registered");
      }
    }
  }

  if (!data.password || data.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    validatedData: errors.length === 0 ? data : undefined,
  };
};

const validateAuthLoginData = async (data) => {
  const errors = [];

  if (!data.email) {
    errors.push("Email is required");
  }

  if (!data.password) {
    errors.push("Password is required");
  }

  if (data.email && data.password && errors.length === 0) {
    const user = await User.findOne({ email: data.email.toLowerCase() })
      .select("+password")
      .lean();
    if (!user) {
      errors.push("Invalid email or password");
    } else if (!user.isActive) {
      errors.push("Account is deactivated. Contact support.");
    } else {
      const bcrypt = require("bcryptjs");
      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        errors.push("Invalid email or password");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    validatedData: errors.length === 0 ? data : undefined,
  };
};

const validateProductData = async (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Product name must be at least 2 characters");
  }

  if (!data.sku) {
    errors.push("SKU is required");
  } else {
    const existing = await Product.findOne({ sku: data.sku.toUpperCase() }).lean();
    if (existing) {
      errors.push(`SKU "${data.sku}" already exists`);
    }
  }

  if (data.price === undefined || typeof data.price !== "number" || data.price < 0) {
    errors.push("Price must be a non-negative number");
  }

  if (data.category && mongoose.Types.ObjectId.isValid(data.category)) {
    const Category = require("../models/Category");
    const category = await Category.findById(data.category).lean();
    if (!category) {
      errors.push("Category not found");
    }
  }

  if (data.stock !== undefined && (typeof data.stock !== "number" || data.stock < 0)) {
    errors.push("Stock must be a non-negative number");
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    validatedData: errors.length === 0 ? data : undefined,
  };
};

const validateRefundData = async (data) => {
  const errors = [];

  if (!data.order || !mongoose.Types.ObjectId.isValid(data.order)) {
    errors.push("Valid order ID is required");
  } else {
    const order = await Order.findById(data.order).lean();
    if (!order) {
      errors.push("Order not found");
    } else if (order.status !== "delivered" && order.status !== "cancelled") {
      errors.push("Only delivered or cancelled orders can be refunded");
    }
  }

  if (data.amount !== undefined && (typeof data.amount !== "number" || data.amount <= 0)) {
    errors.push("Refund amount must be a positive number");
  }

  if (!data.reason || data.reason.trim().length < 5) {
    errors.push("Refund reason must be at least 5 characters");
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    validatedData: errors.length === 0 ? data : undefined,
  };
};

const validateCouponData = async (data) => {
  const errors = [];

  if (!data.code || data.code.trim().length < 3) {
    errors.push("Coupon code must be at least 3 characters");
  }

  if (data.discountPercentage !== undefined) {
    if (typeof data.discountPercentage !== "number" || data.discountPercentage <= 0 || data.discountPercentage > 100) {
      errors.push("Discount percentage must be between 1 and 100");
    }
  } else if (data.discountAmount !== undefined) {
    if (typeof data.discountAmount !== "number" || data.discountAmount <= 0) {
      errors.push("Discount amount must be a positive number");
    }
  } else {
    errors.push("Either discountPercentage or discountAmount is required");
  }

  if (data.minOrderValue !== undefined && (typeof data.minOrderValue !== "number" || data.minOrderValue < 0)) {
    errors.push("Minimum order value must be a non-negative number");
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    validatedData: errors.length === 0 ? data : undefined,
  };
};

const validateUploadData = async (data) => {
  const errors = [];
  const maxSize = 5 * 1024 * 1024;

  if (!data.fileName) {
    errors.push("File name is required");
  }

  if (data.fileSize !== undefined && data.fileSize > maxSize) {
    errors.push("File size exceeds 5 MB limit");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
  if (data.fileType && !allowedTypes.includes(data.fileType)) {
    errors.push(`File type not allowed. Allowed: ${allowedTypes.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    validatedData: errors.length === 0 ? data : undefined,
  };
};

module.exports = {
  validateOrderData,
  validateOrderUpdateData,
  validatePaymentData,
  validateAddressData,
  validateAuthRegisterData,
  validateAuthLoginData,
  validateProductData,
  validateRefundData,
  validateCouponData,
  validateUploadData,
};
