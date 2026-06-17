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

describe("Analytics Routes", () => {
  let adminToken;

  beforeAll(async () => {
    const adminUser = await createAdminUser();
    adminUser.email = `admin_analytics_${Date.now()}@example.com`;
    await adminUser.save();
    adminToken = await loginAsUser(request, app, {
      email: adminUser.email,
      password: "Admin@1234",
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.collection("orders").deleteMany({});
  });

  test("GET /api/v1/analytics/revenue/total", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/revenue/total")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/analytics/revenue/monthly", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/revenue/monthly")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/analytics/revenue/yearly", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/revenue/yearly")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/analytics/orders/average-value", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/orders/average-value")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/analytics/orders/count", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/orders/count")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/analytics/orders/cancelled", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/orders/cancelled")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/analytics/customers/top", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/customers/top")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/analytics/products/top-selling", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/products/top-selling")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/analytics/payments/distribution", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/payments/distribution")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/analytics/returns/rate", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/returns/rate")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/analytics/discounts/usage", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/discounts/usage")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });
});

describe("Dashboard Routes", () => {
  let adminToken;

  beforeAll(async () => {
    const adminUser = await createAdminUser();
    adminUser.email = `admin_dash_${Date.now()}@example.com`;
    await adminUser.save();
    adminToken = await loginAsUser(request, app, {
      email: adminUser.email,
      password: "Admin@1234",
    });
  });

  test("GET /api/v1/dashboard/overview", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/overview")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/dashboard/revenue", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/revenue")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/dashboard/orders", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/orders")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/dashboard/customers", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/customers")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/dashboard/products", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/products")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });
});

describe("Stats Routes", () => {
  let adminToken;

  beforeAll(async () => {
    const adminUser = await createAdminUser();
    adminUser.email = `admin_stats_${Date.now()}@example.com`;
    await adminUser.save();
    adminToken = await loginAsUser(request, app, {
      email: adminUser.email,
      password: "Admin@1234",
    });
  });

  test("GET /api/v1/stats/orders/total", async () => {
    const res = await request(app)
      .get("/api/v1/stats/orders/total")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/stats/orders/daily", async () => {
    const res = await request(app)
      .get("/api/v1/stats/orders/daily")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/stats/orders/monthly", async () => {
    const res = await request(app)
      .get("/api/v1/stats/orders/monthly")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/stats/revenue/total", async () => {
    const res = await request(app)
      .get("/api/v1/stats/revenue/total")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/stats/revenue/monthly", async () => {
    const res = await request(app)
      .get("/api/v1/stats/revenue/monthly")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/stats/products/count", async () => {
    const res = await request(app)
      .get("/api/v1/stats/products/count")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/stats/customers/count", async () => {
    const res = await request(app)
      .get("/api/v1/stats/customers/count")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/stats/shipping/average-time", async () => {
    const res = await request(app)
      .get("/api/v1/stats/shipping/average-time")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/stats/system/performance", async () => {
    const res = await request(app)
      .get("/api/v1/stats/system/performance")
      .set("Authorization", getAuthHeader(adminToken));
    expect(res.status).toBe(200);
  });
});
