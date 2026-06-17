const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const {
  createTestUser,
  createAdminUser,
  createTestOrder,
  loginAsUser,
  getAuthHeader,
} = require("./helpers");

describe("Order Bulk Routes", () => {
  let adminToken, customerToken;
  let order1, order2;
  let adminUser;

  beforeAll(async () => {
    adminUser = await createAdminUser();
    adminUser.email = `admin_bulk_${Date.now()}@example.com`;
    await adminUser.save();

    const customerUser = await createTestUser({ email: `cust_bulk_${Date.now()}@example.com` });
    adminToken = await loginAsUser(request, app, {
      email: adminUser.email,
      password: "Admin@1234",
    });
    customerToken = await loginAsUser(request, app, {
      email: customerUser.email,
      password: "Test@1234",
    });

    order1 = await createTestOrder(customerUser._id);
    order2 = await createTestOrder(customerUser._id);
  });

  afterAll(async () => {
    await mongoose.connection.db.collection("orders").deleteMany({});
  });

  describe("POST /api/v1/orders/bulk/create", () => {
    test("should allow admin to bulk create orders", async () => {
      const res = await request(app)
        .post("/api/v1/orders/bulk/create")
        .set("Authorization", getAuthHeader(adminToken))
        .send({
          orders: [
            {
              user: adminUser._id.toString(),
              orderItems: [{ product: new mongoose.Types.ObjectId().toString(), name: "Bulk Item", price: 10, quantity: 1 }],
              shippingAddress: { street: "S", city: "C", state: "S", postalCode: "Z", country: "US" },
              itemsPrice: 10, taxPrice: 0, shippingPrice: 0, totalPrice: 10,
            },
          ],
        });
      expect(res.status).toBe(201);
    });

    test("should deny customer from bulk creating", async () => {
      const res = await request(app)
        .post("/api/v1/orders/bulk/create")
        .set("Authorization", getAuthHeader(customerToken))
        .send({ orders: [] });
      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/v1/orders/bulk/status", () => {
    test("should allow admin to bulk update status", async () => {
      const res = await request(app)
        .patch("/api/v1/orders/bulk/status")
        .set("Authorization", getAuthHeader(adminToken))
        .send({ orderIds: [order1._id.toString(), order2._id.toString()], status: "processing" });
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/v1/orders/bulk/delete", () => {
    test("should allow admin to bulk delete orders", async () => {
      const tempOrder = await createTestOrder(adminUser._id);
      const res = await request(app)
        .delete("/api/v1/orders/bulk/delete")
        .set("Authorization", getAuthHeader(adminToken))
        .send({ orderIds: [tempOrder._id.toString()] });
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /api/v1/orders/bulk/archive", () => {
    test("should allow admin to bulk archive orders", async () => {
      const res = await request(app)
        .patch("/api/v1/orders/bulk/archive")
        .set("Authorization", getAuthHeader(adminToken))
        .send({ orderIds: [order1._id.toString()] });
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /api/v1/orders/bulk/restore", () => {
    test("should allow admin to bulk restore orders", async () => {
      const res = await request(app)
        .patch("/api/v1/orders/bulk/restore")
        .set("Authorization", getAuthHeader(adminToken))
        .send({ orderIds: [order1._id.toString()] });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/v1/orders/bulk/apply-discount", () => {
    test("should allow admin to apply bulk discount", async () => {
      const res = await request(app)
        .post("/api/v1/orders/bulk/apply-discount")
        .set("Authorization", getAuthHeader(adminToken))
        .send({ orderIds: [order1._id.toString()], discountPercentage: 10, reason: "Sale" });
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /api/v1/orders/bulk/payment-status", () => {
    test("should allow admin to bulk update payment status", async () => {
      const res = await request(app)
        .patch("/api/v1/orders/bulk/payment-status")
        .set("Authorization", getAuthHeader(adminToken))
        .send({ orderIds: [order1._id.toString()], paymentStatus: "completed" });
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /api/v1/orders/bulk/shipping-status", () => {
    test("should allow admin to bulk update shipping status", async () => {
      const res = await request(app)
        .patch("/api/v1/orders/bulk/shipping-status")
        .set("Authorization", getAuthHeader(adminToken))
        .send({ orderIds: [order1._id.toString()], shippingStatus: "shipped", carrier: "fedex" });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/v1/orders/bulk/cleanup-cancelled", () => {
    test("should allow admin to cleanup cancelled orders", async () => {
      const res = await request(app)
        .post("/api/v1/orders/bulk/cleanup-cancelled")
        .set("Authorization", getAuthHeader(adminToken))
        .send({ olderThanDays: 1 });
      expect(res.status).toBe(200);
    });
  });
});
