const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const {
  createTestUser,
  createAdminUser,
  createTestCategory,
  createTestProduct,
  createTestOrder,
  createDeliveredOrder,
  createTestPayment,
  loginAsUser,
  getAuthHeader,
} = require("./helpers");

describe("Order Routes", () => {
  let customerUser, adminUser;
  let customerToken, adminToken;

  beforeAll(async () => {
    customerUser = await createTestUser({ email: `cust_orders_${Date.now()}@example.com` });
    adminUser = await createAdminUser();
    adminUser.email = `admin_orders_${Date.now()}@example.com`;
    await adminUser.save();
    customerToken = await loginAsUser(request, app, {
      email: customerUser.email,
      password: "Test@1234",
    });
    adminToken = await loginAsUser(request, app, {
      email: adminUser.email,
      password: "Admin@1234",
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.collection("orders").deleteMany({});
    await mongoose.connection.db.collection("payments").deleteMany({});
    await mongoose.connection.db.collection("users").deleteMany({});
  });

  describe("POST /api/v1/orders - Create Order", () => {
    test("should create a new order", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", getAuthHeader(customerToken))
        .send({
          user: customerUser._id.toString(),
          orderItems: [
            {
              product: new mongoose.Types.ObjectId().toString(),
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
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("_id");
      expect(res.body.data.status).toBe("pending");
    });

    test("should fail without authentication", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .send({ user: customerUser._id.toString(), orderItems: [], shippingAddress: {}, itemsPrice: 0, taxPrice: 0, shippingPrice: 0, totalPrice: 0 });
      expect(res.status).toBe(401);
    });

    test("should fail with missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", getAuthHeader(customerToken))
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/orders - Get All Orders (Admin)", () => {
    beforeAll(async () => {
      await createTestOrder(customerUser._id);
      await createTestOrder(customerUser._id);
    });

    test("should allow admin to get all orders", async () => {
      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("results");
      expect(Array.isArray(res.body.data.results)).toBe(true);
    });

    test("should deny customer from getting all orders", async () => {
      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/orders/:orderId - Get Single Order", () => {
    let order;

    beforeAll(async () => {
      order = await createTestOrder(customerUser._id);
    });

    test("should get order by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${order._id}`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(order._id.toString());
    });

    test("should fail with invalid order ID", async () => {
      const res = await request(app)
        .get("/api/v1/orders/123")
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(400);
    });

    test("should fail with non-existent order ID", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/v1/orders/${fakeId}`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/v1/orders/:orderId - Replace Order", () => {
    let order;

    beforeAll(async () => {
      order = await createTestOrder(customerUser._id);
    });

    test("should allow admin to replace an order", async () => {
      const res = await request(app)
        .put(`/api/v1/orders/${order._id}`)
        .set("Authorization", getAuthHeader(adminToken))
        .send({
          user: customerUser._id.toString(),
          orderItems: [
            {
              product: new mongoose.Types.ObjectId().toString(),
              name: "Replaced Product",
              price: 49.99,
              quantity: 1,
            },
          ],
          shippingAddress: {
            street: "456 New St",
            city: "New City",
            state: "NS",
            postalCode: "67890",
            country: "US",
          },
          itemsPrice: 49.99,
          taxPrice: 4.00,
          shippingPrice: 5.00,
          totalPrice: 58.99,
        });
      expect(res.status).toBe(200);
      expect(res.body.data.orderItems[0].name).toBe("Replaced Product");
    });

    test("should deny customer from replacing an order", async () => {
      const res = await request(app)
        .put(`/api/v1/orders/${order._id}`)
        .set("Authorization", getAuthHeader(customerToken))
        .send({
          user: customerUser._id.toString(),
          orderItems: [{ product: new mongoose.Types.ObjectId().toString(), name: "P", price: 10, quantity: 1 }],
          shippingAddress: { street: "S", city: "C", state: "S", postalCode: "Z", country: "US" },
          itemsPrice: 10, taxPrice: 0, shippingPrice: 0, totalPrice: 10,
        });
      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/v1/orders/:orderId - Update Order", () => {
    let order;

    beforeAll(async () => {
      order = await createTestOrder(customerUser._id);
    });

    test("should allow admin to partially update an order", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${order._id}`)
        .set("Authorization", getAuthHeader(adminToken))
        .send({ status: "processing" });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("processing");
    });

    test("should deny customer from updating an order", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${order._id}`)
        .set("Authorization", getAuthHeader(customerToken))
        .send({ status: "shipped" });
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/v1/orders/:orderId - Delete Order", () => {
    let order;

    beforeAll(async () => {
      order = await createTestOrder(customerUser._id);
    });

    test("should allow admin to delete an order", async () => {
      const newOrder = await createTestOrder(customerUser._id);
      const res = await request(app)
        .delete(`/api/v1/orders/${newOrder._id}`)
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should deny customer from deleting an order", async () => {
      const res = await request(app)
        .delete(`/api/v1/orders/${order._id}`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/orders/:orderId/exists", () => {
    let order;

    beforeAll(async () => {
      order = await createTestOrder(customerUser._id);
    });

    test("should return true for existing order", async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${order._id}/exists`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(200);
      expect(res.body.data.exists).toBe(true);
    });

    test("should return false for non-existing order", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/v1/orders/${fakeId}/exists`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(200);
      expect(res.body.data.exists).toBe(false);
    });
  });

  describe("GET /api/v1/orders/:orderId/summary", () => {
    let order;

    beforeAll(async () => {
      order = await createTestOrder(customerUser._id);
    });

    test("should return order summary", async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${order._id}/summary`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("orderId");
      expect(res.body.data).toHaveProperty("status");
      expect(res.body.data).toHaveProperty("pricing");
    });
  });

  describe("GET /api/v1/orders/:orderId/items", () => {
    let order;

    beforeAll(async () => {
      order = await createTestOrder(customerUser._id);
    });

    test("should return order items", async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${order._id}/items`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("items");
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });
  });

  describe("GET /api/v1/orders/:orderId/history", () => {
    let order;

    beforeAll(async () => {
      order = await createTestOrder(customerUser._id);
    });

    test("should return order status history", async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${order._id}/history`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("statusHistory");
    });
  });

  describe("GET /api/v1/orders/:orderId/invoice", () => {
    let order;

    beforeAll(async () => {
      order = await createTestOrder(customerUser._id);
    });

    test("should return order invoice", async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${order._id}/invoice`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("invoiceNumber");
      expect(res.body.data).toHaveProperty("lineItems");
      expect(res.body.data).toHaveProperty("pricing");
    });
  });

  describe("PATCH /api/v1/orders/:orderId/archive", () => {
    test("should allow admin to archive a delivered order", async () => {
      const order = await createDeliveredOrder(customerUser._id);
      const res = await request(app)
        .patch(`/api/v1/orders/${order._id}/archive`)
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data.isArchived).toBe(true);
    });

    test("should deny customer from archiving", async () => {
      const order = await createDeliveredOrder(customerUser._id);
      const res = await request(app)
        .patch(`/api/v1/orders/${order._id}/archive`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/v1/orders/:orderId/restore", () => {
    test("should allow admin to restore an archived order", async () => {
      const order = await createDeliveredOrder(customerUser._id);
      await request(app)
        .patch(`/api/v1/orders/${order._id}/archive`)
        .set("Authorization", getAuthHeader(adminToken));
      const res = await request(app)
        .patch(`/api/v1/orders/${order._id}/restore`)
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data.isArchived).toBe(false);
    });
  });

  describe("POST /api/v1/orders/:orderId/cancel", () => {
    test("should cancel a pending order", async () => {
      const order = await createTestOrder(customerUser._id);
      const res = await request(app)
        .post(`/api/v1/orders/${order._id}/cancel`)
        .set("Authorization", getAuthHeader(customerToken))
        .send({ cancelReason: "Changed my mind about this order." });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("cancelled");
    });

    test("should fail without cancel reason", async () => {
      const order = await createTestOrder(customerUser._id);
      const res = await request(app)
        .post(`/api/v1/orders/${order._id}/cancel`)
        .set("Authorization", getAuthHeader(customerToken))
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/orders/:orderId/duplicate", () => {
    test("should duplicate an order", async () => {
      const order = await createTestOrder(customerUser._id);
      const res = await request(app)
        .post(`/api/v1/orders/${order._id}/duplicate`)
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("sourceOrderId");
      expect(res.body.data).toHaveProperty("duplicatedOrder");
    });
  });
});
