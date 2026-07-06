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

describe("Admin Routes", () => {
  let adminToken, customerToken;
  let targetUser;

  beforeAll(async () => {
    const adminUser = await createAdminUser();
    adminUser.email = `admin_test_${Date.now()}@example.com`;
    await adminUser.save();

    targetUser = await createTestUser({ email: `target_${Date.now()}@example.com` });

    const customerUser = await createTestUser({ email: `cust_admin_${Date.now()}@example.com` });

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
    await mongoose.connection.db.collection("orders").deleteMany({});
  });

  describe("GET /api/v1/admin/users", () => {
    test("should allow admin to list users", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("results");
    });

    test("should deny customer from listing users", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", getAuthHeader(customerToken));
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/admin/users/:id", () => {
    test("should allow admin to get user details", async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${targetUser._id}`)
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /api/v1/admin/users/:id/ban", () => {
    test("should allow admin to ban a user", async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${targetUser._id}/ban`)
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });
  });

  describe("PATCH /api/v1/admin/users/:id/unban", () => {
    test("should allow admin to unban a user", async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${targetUser._id}/unban`)
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(true);
    });
  });

  describe("PATCH /api/v1/admin/users/:id/role", () => {
    test("should allow admin to change user role", async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${targetUser._id}/role`)
        .set("Authorization", getAuthHeader(adminToken))
        .send({ role: "vendor" });
      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe("vendor");
    });
  });

  describe("GET /api/v1/admin/orders", () => {
    test("should allow admin to get all orders", async () => {
      await createTestOrder(targetUser._id);
      const res = await request(app)
        .get("/api/v1/admin/orders")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/admin/reports/sales", () => {
    test("should return sales report", async () => {
      const res = await request(app)
        .get("/api/v1/admin/reports/sales")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/admin/reports/revenue", () => {
    test("should return revenue report", async () => {
      const res = await request(app)
        .get("/api/v1/admin/reports/revenue")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/admin/system/health", () => {
    test("should return system health", async () => {
      const res = await request(app)
        .get("/api/v1/admin/system/health")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/admin/system/logs", () => {
    test("should return system audit logs", async () => {
      const res = await request(app)
        .get("/api/v1/admin/system/logs")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/v1/admin/cache/clear", () => {
    test("should allow admin to clear cache", async () => {
      const res = await request(app)
        .delete("/api/v1/admin/cache/clear")
        .set("Authorization", getAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/v1/admin/system/maintenance", () => {
    test("should allow admin to toggle maintenance", async () => {
      const res = await request(app)
        .post("/api/v1/admin/system/maintenance")
        .set("Authorization", getAuthHeader(adminToken))
        .send({ enabled: true, message: "Scheduled maintenance" });
      expect(res.status).toBe(200);
    });
  });
});
