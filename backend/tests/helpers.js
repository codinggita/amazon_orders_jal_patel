const mongoose = require("mongoose");
const User = require("../src/models/User");
const Order = require("../src/models/order.model");
const Shipment = require("../src/models/Shipment");
const Payment = require("../src/models/Payment");
const Notification = require("../src/models/Notification");
const Product = require("../src/models/Product");
const Category = require("../src/models/Category");

const createTestUser = async (overrides = {}) => {
  const userData = {
    firstName: "Test",
    lastName: "User",
    email: `testuser_${Date.now()}@example.com`,
    password: "Test@1234",
    role: "customer",
    ...overrides,
  };
  return User.create(userData);
};

const createAdminUser = async () => {
  return createTestUser({
    firstName: "Admin",
    lastName: "User",
    email: `admin_${Date.now()}@example.com`,
    password: "Admin@1234",
    role: "admin",
  });
};

const createTestCategory = async () => {
  const slug = `category_${Date.now()}`;
  return Category.create({
    name: `Category ${Date.now()}`,
    slug,
    description: "Test category",
  });
};

const createTestProduct = async (categoryId) => {
  const sku = `SKU_${Date.now()}`;
  return Product.create({
    name: `Product ${Date.now()}`,
    sku,
    description: "Test product description",
    price: 29.99,
    stock: 100,
    category: categoryId,
  });
};

const createTestOrder = async (userId, overrides = {}) => {
  const orderData = {
    user: userId,
    orderItems: [
      {
        product: new mongoose.Types.ObjectId(),
        name: "Test Product",
        price: 29.99,
        quantity: 2,
      },
    ],
    shippingAddress: {
      street: "123 Test St",
      city: "Test City",
      state: "TS",
      postalCode: "12345",
      country: "US",
    },
    itemsPrice: 59.98,
    taxPrice: 5.00,
    shippingPrice: 10.00,
    totalPrice: 74.98,
    ...overrides,
  };
  return Order.create(orderData);
};

const createDeliveredOrder = async (userId) => {
  const order = await createTestOrder(userId, { status: "delivered" });
  return order;
};

const createTestShipment = async (orderId) => {
  return Shipment.create({
    order: orderId,
    carrier: "fedex",
    trackingNumber: `TRK_${Date.now()}`,
    status: "in_transit",
    estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    trackingEvents: [
      {
        status: "picked_up",
        location: "Warehouse A",
        description: "Package picked up",
        occurredAt: new Date(),
      },
    ],
    shippingLabel: {
      labelNumber: `LBL_${Date.now()}`,
      labelUrl: "https://example.com/label",
      carrier: "fedex",
      issuedAt: new Date(),
    },
  });
};

const createTestPayment = async (orderId, userId) => {
  return Payment.create({
    order: orderId,
    user: userId,
    transactionId: `TXN_${Date.now()}`,
    paymentMethod: "credit_card",
    amount: 74.98,
    status: "completed",
    paidAt: new Date(),
  });
};

const createTestNotification = async (userId) => {
  return Notification.create({
    user: userId,
    type: "order_update",
    title: "Order Update",
    message: "Your order has been updated.",
  });
};

const loginAsUser = async (request, app, user) => {
  const { email, password } = user;
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });
  return res.body.data.token;
};

const getAuthHeader = (token) => `Bearer ${token}`;

module.exports = {
  createTestUser,
  createAdminUser,
  createTestCategory,
  createTestProduct,
  createTestOrder,
  createDeliveredOrder,
  createTestShipment,
  createTestPayment,
  createTestNotification,
  loginAsUser,
  getAuthHeader,
};
