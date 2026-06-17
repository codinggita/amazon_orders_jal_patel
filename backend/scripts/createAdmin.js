/**
 * Quick script to create/update admin users in the database.
 * Run: node scripts/createAdmin.js
 */

"use strict";

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../src/models/User");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

const admins = [
  {
    firstName: "Jal",
    lastName: "Patel",
    email: "jal.h.patel.cg@gmail.com",
    password: "Admin123@",
    role: "admin",
  },
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "Admin123@",
    role: "admin",
  },
];

const run = async () => {
  try {
    for (const adminData of admins) {
      // Remove existing user with same email to avoid duplicates
      await User.deleteOne({ email: adminData.email });
      const user = await User.create(adminData);
      console.log(`✅ Created admin: ${user.email}`);
    }

    console.log("\n🎉 Done! You can now log in with:");
    console.log("   Email   : jal.h.patel.cg@gmail.com");
    console.log("   Password: Admin123@");
    console.log("\n   OR");
    console.log("   Email   : admin@example.com");
    console.log("   Password: Admin123@");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

run();
