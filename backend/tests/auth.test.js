const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const { createTestUser, loginAsUser, getAuthHeader } = require("./helpers");

describe("Auth Routes", () => {
  let user;
  let token;

  beforeEach(async () => {
    const collections = await mongoose.connection.db.listCollections({ name: "users" }).toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.collection("users").deleteMany({});
    }
  });

  describe("POST /api/v1/auth/register", () => {
    test("should register a new user with name field", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "John Doe",
          email: `john_${Date.now()}@example.com`,
          password: "John@1234",
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user).toHaveProperty("firstName", "John");
      expect(res.body.data.user).toHaveProperty("lastName", "Doe");
    });

    test("should register a new user with firstName/lastName", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "Jane",
          lastName: "Smith",
          email: `jane_${Date.now()}@example.com`,
          password: "Jane@1234",
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
    });

    test("should fail with duplicate email", async () => {
      const email = `dup_${Date.now()}@example.com`;
      await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "First User", email, password: "Test@1234" });
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Second User", email, password: "Test@1234" });
      expect(res.status).toBe(409);
    });

    test("should fail with weak password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Weak Password",
          email: `weak_${Date.now()}@example.com`,
          password: "short",
        });
      expect(res.status).toBe(400);
    });

    test("should fail without email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "No Email", password: "Test@1234" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Login User",
          email: "loginuser@example.com",
          password: "Login@1234",
        });
    });

    test("should login successfully with valid credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "loginuser@example.com", password: "Login@1234" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
    });

    test("should fail with wrong password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "loginuser@example.com", password: "WrongPass1!" });
      expect(res.status).toBe(401);
    });

    test("should fail with non-existent email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nonexistent@example.com", password: "Login@1234" });
      expect(res.status).toBe(401);
    });

    test("should fail with missing fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "loginuser@example.com" });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/auth/profile", () => {
    beforeEach(async () => {
      user = await createTestUser({ email: `profile_${Date.now()}@example.com` });
      token = await loginAsUser(request, app, {
        email: user.email,
        password: "Test@1234",
      });
    });

    test("should return profile when authenticated", async () => {
      const res = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", getAuthHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.data.user).toHaveProperty("email", user.email);
    });

    test("should fail without token", async () => {
      const res = await request(app).get("/api/v1/auth/profile");
      expect(res.status).toBe(401);
    });

    test("should fail with invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    beforeEach(async () => {
      user = await createTestUser({ email: `logout_${Date.now()}@example.com` });
      token = await loginAsUser(request, app, {
        email: user.email,
        password: "Test@1234",
      });
    });

    test("should logout successfully when authenticated", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", getAuthHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should fail without token", async () => {
      const res = await request(app).post("/api/v1/auth/logout");
      expect(res.status).toBe(401);
    });
  });
});
