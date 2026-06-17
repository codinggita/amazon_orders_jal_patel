const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const {
  createTestUser,
  createAdminUser,
  createTestOrder,
  createTestNotification,
  loginAsUser,
  getAuthHeader,
} = require("./helpers");

describe("Notification Routes", () => {
  let customerToken, notification;
  let user;

  beforeAll(async () => {
    user = await createTestUser({ email: `notif_${Date.now()}@example.com` });
    customerToken = await loginAsUser(request, app, {
      email: user.email,
      password: "Test@1234",
    });
    notification = await createTestNotification(user._id);
  });

  afterAll(async () => {
    await mongoose.connection.db.collection("notifications").deleteMany({});
    await mongoose.connection.db.collection("users").deleteMany({});
  });

  test("GET /api/v1/notifications - should get user notifications", async () => {
    const res = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("notifications");
  });

  test("PATCH /api/v1/notifications/read/:id - should mark as read", async () => {
    const res = await request(app)
      .patch(`/api/v1/notifications/read/${notification._id}`)
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("DELETE /api/v1/notifications/:id - should delete notification", async () => {
    const notif = await createTestNotification(user._id);
    const res = await request(app)
      .delete(`/api/v1/notifications/${notif._id}`)
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });
});

describe("Recommendation Routes", () => {
  let customerToken;
  let user;

  beforeAll(async () => {
    user = await createTestUser({ email: `reco_${Date.now()}@example.com` });
    customerToken = await loginAsUser(request, app, {
      email: user.email,
      password: "Test@1234",
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.collection("orders").deleteMany({});
  });

  test("GET /api/v1/recommendations/products/:customerId", async () => {
    const res = await request(app)
      .get(`/api/v1/recommendations/products/${user._id}`)
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/recommendations/orders/:orderId", async () => {
    const order = await createTestOrder(user._id);
    const res = await request(app)
      .get(`/api/v1/recommendations/orders/${order._id}`)
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });
});

describe("Trending Routes", () => {
  let customerToken;

  beforeAll(async () => {
    const user = await createTestUser({ email: `trend_${Date.now()}@example.com` });
    customerToken = await loginAsUser(request, app, {
      email: user.email,
      password: "Test@1234",
    });
  });

  test("GET /api/v1/trending/products", async () => {
    const res = await request(app)
      .get("/api/v1/trending/products")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/trending/categories", async () => {
    const res = await request(app)
      .get("/api/v1/trending/categories")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });
});

describe("Activity Routes", () => {
  let adminToken, customerToken;

  beforeAll(async () => {
    const adminUser = await createAdminUser();
    adminUser.email = `admin_act_${Date.now()}@example.com`;
    await adminUser.save();
    const customerUser = await createTestUser({ email: `cust_act_${Date.now()}@example.com` });
    adminToken = await loginAsUser(request, app, {
      email: adminUser.email,
      password: "Admin@1234",
    });
    customerToken = await loginAsUser(request, app, {
      email: customerUser.email,
      password: "Test@1234",
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.collection("users").deleteMany({});
  });

  test("GET /api/v1/activity/logs - should allow admin", async () => {
    const res = await request(app)
      .get("/api/v1/activity/logs")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/activity/logs - should deny customer", async () => {
    const res = await request(app)
      .get("/api/v1/activity/logs")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(403);
  });
});

describe("Error Simulation Routes", () => {
  test("GET /api/v1/errors/not-found", async () => {
    const res = await request(app).get("/api/v1/errors/not-found");
    expect(res.status).toBe(404);
  });

  test("GET /api/v1/errors/server-error", async () => {
    const res = await request(app).get("/api/v1/errors/server-error");
    expect(res.status).toBe(500);
  });

  test("GET /api/v1/errors/validation", async () => {
    const res = await request(app).get("/api/v1/errors/validation");
    expect(res.status).toBe(400);
  });

  test("GET /api/v1/errors/database", async () => {
    const res = await request(app).get("/api/v1/errors/database");
    expect(res.status).toBe(500);
  });

  test("GET /api/v1/errors/rate-limit", async () => {
    const res = await request(app).get("/api/v1/errors/rate-limit");
    expect(res.status).toBe(429);
  });

  test("GET /api/v1/errors/token-expired", async () => {
    const res = await request(app).get("/api/v1/errors/token-expired");
    expect(res.status).toBe(401);
  });

  test("GET /api/v1/errors/payment-failed", async () => {
    const res = await request(app).get("/api/v1/errors/payment-failed");
    expect(res.status).toBe(402);
  });

  test("GET /api/v1/errors/shipping-failed", async () => {
    const res = await request(app).get("/api/v1/errors/shipping-failed");
    expect(res.status).toBe(500);
  });

  test("GET /api/v1/errors/upload-error", async () => {
    const res = await request(app).get("/api/v1/errors/upload-error");
    expect(res.status).toBe(500);
  });

  test("GET /api/v1/errors/cache-error", async () => {
    const res = await request(app).get("/api/v1/errors/cache-error");
    expect(res.status).toBe(500);
  });
});

describe("Validate Routes", () => {
  test("POST /api/v1/validate/order - should validate order payload", async () => {
    const res = await request(app)
      .post("/api/v1/validate/order")
      .send({
        user: new mongoose.Types.ObjectId().toString(),
        orderItems: [{ product: new mongoose.Types.ObjectId().toString(), name: "P", price: 10, quantity: 1 }],
        shippingAddress: { street: "S", city: "C", state: "S", postalCode: "Z", country: "US" },
        itemsPrice: 10, taxPrice: 0, shippingPrice: 0, totalPrice: 10,
      });
    expect(res.status).toBe(200);
  });

  test("POST /api/v1/validate/order - should fail with invalid payload", async () => {
    const res = await request(app)
      .post("/api/v1/validate/order")
      .send({});
    expect(res.status).toBe(400);
  });

  test("POST /api/v1/validate/payment", async () => {
    const res = await request(app)
      .post("/api/v1/validate/payment")
      .send({
        order: new mongoose.Types.ObjectId().toString(),
        paymentMethod: "credit_card",
        amount: 100,
        transactionId: "TXN_TEST",
      });
    expect(res.status).toBe(200);
  });

  test("POST /api/v1/validate/address", async () => {
    const res = await request(app)
      .post("/api/v1/validate/address")
      .send({ street: "S", city: "C", state: "S", postalCode: "Z", country: "US" });
    expect(res.status).toBe(200);
  });

  test("POST /api/v1/validate/auth/register", async () => {
    const res = await request(app)
      .post("/api/v1/validate/auth/register")
      .send({ firstName: "John", lastName: "Doe", email: "john@example.com", password: "John@1234" });
    expect(res.status).toBe(200);
  });

  test("POST /api/v1/validate/auth/login", async () => {
    const res = await request(app)
      .post("/api/v1/validate/auth/login")
      .send({ email: "john@example.com", password: "John@1234" });
    expect(res.status).toBe(200);
  });

  test("POST /api/v1/validate/product", async () => {
    const res = await request(app)
      .post("/api/v1/validate/product")
      .send({
        name: "Test Product",
        sku: "SKU123",
        description: "A test product",
        price: 29.99,
        category: new mongoose.Types.ObjectId().toString(),
        stock: 100,
      });
    expect(res.status).toBe(200);
  });

  test("POST /api/v1/validate/refund", async () => {
    const res = await request(app)
      .post("/api/v1/validate/refund")
      .send({
        order: new mongoose.Types.ObjectId().toString(),
        amount: 50,
        reason: "Customer requested refund",
      });
    expect(res.status).toBe(200);
  });

  test("POST /api/v1/validate/coupon", async () => {
    const res = await request(app)
      .post("/api/v1/validate/coupon")
      .send({ code: "SAVE10", discountPercentage: 10, expiresAt: new Date(Date.now() + 30*24*60*60*1000).toISOString() });
    expect(res.status).toBe(200);
  });
});
