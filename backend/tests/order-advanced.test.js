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

describe("Order Search Routes", () => {
  let customerToken;

  beforeAll(async () => {
    const user = await createTestUser({ email: `cust_search_${Date.now()}@example.com` });
    customerToken = await loginAsUser(request, app, {
      email: user.email,
      password: "Test@1234",
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.collection("orders").deleteMany({});
  });

  test("GET /api/v1/orders/search - global search", async () => {
    const res = await request(app)
      .get("/api/v1/orders/search?q=test")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/v1/orders/search/recent - recent searches", async () => {
    const res = await request(app)
      .get("/api/v1/orders/search/recent")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/search/popular - popular searches", async () => {
    const res = await request(app)
      .get("/api/v1/orders/search/popular")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/search/customer - search by customer", async () => {
    const res = await request(app)
      .get("/api/v1/orders/search/customer?q=test")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/search/product - search by product", async () => {
    const res = await request(app)
      .get("/api/v1/orders/search/product?q=product")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/search/status - search by status", async () => {
    const res = await request(app)
      .get("/api/v1/orders/search/status?q=delivered")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/search/date - search by date", async () => {
    const res = await request(app)
      .get("/api/v1/orders/search/date?q=2025-01")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/search/fuzzy - fuzzy search", async () => {
    const res = await request(app)
      .get("/api/v1/orders/search/fuzzy?q=test")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/search/autocomplete - autocomplete", async () => {
    const res = await request(app)
      .get("/api/v1/orders/search/autocomplete?q=tes")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/search/highlight - highlight search", async () => {
    const res = await request(app)
      .get("/api/v1/orders/search/highlight?q=test")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });
});

describe("Order Filter Routes", () => {
  let customerToken;

  beforeAll(async () => {
    const user = await createTestUser({ email: `cust_filter_${Date.now()}@example.com` });
    customerToken = await loginAsUser(request, app, {
      email: user.email,
      password: "Test@1234",
    });
    await createTestOrder(user._id, { status: "pending" });
    await createTestOrder(user._id, { status: "delivered", totalPrice: 200 });
  });

  test("GET /api/v1/orders/filter/status - filter by status", async () => {
    const res = await request(app)
      .get("/api/v1/orders/filter/status?type=pending")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/filter/date - filter by date", async () => {
    const res = await request(app)
      .get("/api/v1/orders/filter/date?start=2025-01-01&end=2025-12-31")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/filter/price - filter by price", async () => {
    const res = await request(app)
      .get("/api/v1/orders/filter/price?min=10&max=500")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/filter/high-value - high value orders", async () => {
    const res = await request(app)
      .get("/api/v1/orders/filter/high-value?amount=100")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/filter/cancelled - cancelled orders", async () => {
    const res = await request(app)
      .get("/api/v1/orders/filter/cancelled")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/filter/delivered - delivered orders", async () => {
    const res = await request(app)
      .get("/api/v1/orders/filter/delivered")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/filter/country - filter by country", async () => {
    const res = await request(app)
      .get("/api/v1/orders/filter/country?name=US")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });
});

describe("Order Sort Routes", () => {
  let customerToken;

  beforeAll(async () => {
    const user = await createTestUser({ email: `cust_sort_${Date.now()}@example.com` });
    customerToken = await loginAsUser(request, app, {
      email: user.email,
      password: "Test@1234",
    });
  });

  test("GET /api/v1/orders/sort/highest-value", async () => {
    const res = await request(app)
      .get("/api/v1/orders/sort/highest-value")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/sort/lowest-value", async () => {
    const res = await request(app)
      .get("/api/v1/orders/sort/lowest-value")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/sort/latest", async () => {
    const res = await request(app)
      .get("/api/v1/orders/sort/latest")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/sort/oldest", async () => {
    const res = await request(app)
      .get("/api/v1/orders/sort/oldest")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/sort/most-items", async () => {
    const res = await request(app)
      .get("/api/v1/orders/sort/most-items")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });
});

describe("Order Pagination Routes", () => {
  let customerToken;

  beforeAll(async () => {
    const user = await createTestUser({ email: `cust_pag_${Date.now()}@example.com` });
    customerToken = await loginAsUser(request, app, {
      email: user.email,
      password: "Test@1234",
    });
  });

  test("GET /api/v1/orders/paged - paged orders", async () => {
    const res = await request(app)
      .get("/api/v1/orders/paged?page=1&limit=10")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/infinite - infinite scroll", async () => {
    const res = await request(app)
      .get("/api/v1/orders/infinite?page=1&limit=10")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/recent - recent orders", async () => {
    const res = await request(app)
      .get("/api/v1/orders/recent?page=1&limit=10")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/orders/cancelled - paginated cancelled", async () => {
    const res = await request(app)
      .get("/api/v1/orders/cancelled?page=1&limit=10")
      .set("Authorization", getAuthHeader(customerToken));
    expect(res.status).toBe(200);
  });
});
