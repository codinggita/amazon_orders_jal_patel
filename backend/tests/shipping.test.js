const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const {
  createTestUser,
  createAdminUser,
  createTestOrder,
  createTestShipment,
  loginAsUser,
  getAuthHeader,
} = require("./helpers");

describe("Shipping Routes", () => {
  let customerToken, adminToken;
  let order, shipment;

  beforeAll(async () => {
    const customerUser = await createTestUser({ email: `cust_ship_${Date.now()}@example.com` });
    const adminUser = await createAdminUser();
    adminUser.email = `admin_ship_${Date.now()}@example.com`;
    await adminUser.save();

    customerToken = await loginAsUser(request, app, {
      email: customerUser.email,
      password: "Test@1234",
    });
    adminToken = await loginAsUser(request, app, {
      email: adminUser.email,
      password: "Admin@1234",
    });

    order = await createTestOrder(customerUser._id);
    shipment = await createTestShipment(order._id);
  });

  afterAll(async () => {
    await mongoose.connection.db.collection("orders").deleteMany({});
    await mongoose.connection.db.collection("shipments").deleteMany({});
    await mongoose.connection.db.collection("users").deleteMany({});
  });

  describe("GET /api/v1/shipping/carriers", () => {
    test("should return list of carriers", async () => {
      const res = await request(app)
        .get("/api/v1/shipping/carriers")
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("carriers");
    });
  });

  describe("GET /api/v1/shipping/tracking/:orderId", () => {
    test("should return tracking info for an order", async () => {
      const res = await request(app)
        .get(`/api/v1/shipping/tracking/${order._id}`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/shipping/pending", () => {
    test("should return pending shipments for admin", async () => {
      const res = await request(app)
        .get("/api/v1/shipping/pending")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });

    test("should deny customer from viewing pending shipments", async () => {
      const res = await request(app)
        .get("/api/v1/shipping/pending")
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/shipping/delivered", () => {
    test("should return delivered shipments for admin", async () => {
      const res = await request(app)
        .get("/api/v1/shipping/delivered")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/shipping/returned", () => {
    test("should return returned shipments for admin", async () => {
      const res = await request(app)
        .get("/api/v1/shipping/returned")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/v1/shipping/create-label", () => {
    test("should allow admin to create a shipping label", async () => {
      const res = await request(app)
        .post("/api/v1/shipping/create-label")
        .set("Authorization", getAuthHeader(adminToken))
        .send({ orderId: order._id.toString(), carrier: "fedex" });
      expect(res.status).toBe(201);
    });
  });

  describe("PATCH /api/v1/shipping/update-status/:orderId", () => {
    test("should allow admin to update shipment status", async () => {
      const res = await request(app)
        .patch(`/api/v1/shipping/update-status/${order._id}`)
        .set("Authorization", getAuthHeader(adminToken))
        .send({ status: "delivered", location: "Customer Door", description: "Delivered successfully" });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/shipping/estimate/:orderId", () => {
    test("should return delivery estimate", async () => {
      const res = await request(app)
        .get(`/api/v1/shipping/estimate/${order._id}`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /api/v1/shipping/change-address/:orderId", () => {
    test("should change shipping address", async () => {
      const res = await request(app)
        .patch(`/api/v1/shipping/change-address/${order._id}`)
        .set("Authorization", getAuthHeader(customerToken))
        .send({
          street: "456 New Address",
          city: "New City",
          state: "NC",
          postalCode: "54321",
          country: "US",
        });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/v1/shipping/reschedule/:orderId", () => {
    test("should reschedule delivery", async () => {
      const res = await request(app)
        .post(`/api/v1/shipping/reschedule/${order._id}`)
        .set("Authorization", getAuthHeader(customerToken))
        .send({ scheduledDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() });
      expect(res.status).toBe(200);
    });
  });
});
