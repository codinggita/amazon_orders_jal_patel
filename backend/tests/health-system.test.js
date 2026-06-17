const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

describe("Health Routes", () => {
  test("GET /api/v1/health - should return API status", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Amazon Orders API is operational.");
    expect(res.body.data).toHaveProperty("environment");
    expect(res.body.data).toHaveProperty("apiVersion", "v1");
    expect(res.body.data).toHaveProperty("uptime");
    expect(res.body.data.database).toHaveProperty("status");
  });
});

describe("System Routes", () => {
  test("GET /api/v1/system/version - should return version", async () => {
    const res = await request(app).get("/api/v1/system/version");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/v1/system/uptime - should return uptime", async () => {
    const res = await request(app).get("/api/v1/system/uptime");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/v1/system/ping - should return pong", async () => {
    const res = await request(app).get("/api/v1/system/ping");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/v1/system/status/database - should return DB status", async () => {
    const res = await request(app).get("/api/v1/system/status/database");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/v1/system/status/cache - should return cache status", async () => {
    const res = await request(app).get("/api/v1/system/status/cache");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/v1/system/status/storage - should return storage status", async () => {
    const res = await request(app).get("/api/v1/system/status/storage");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/v1/system/config - should return 401 without auth", async () => {
    const res = await request(app).get("/api/v1/system/config");
    expect(res.status).toBe(401);
  });
});
