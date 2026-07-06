/**
 * @file seeder.js
 * @description Database seeding utility for development and testing.
 *
 * RUN:
 *   node scripts/seeder.js -d  (Destroy all data)
 *   node scripts/seeder.js     (Import sample data)
 */

"use strict";

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load ENV variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Models
const User = require("../src/models/User");
const Order = require("../src/models/Order");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected for Seeding"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ── Dummy Data ──────────────────────────────────────────────────
const users = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "Admin123@",
    role: "admin",
  },
  {
    firstName: "Test",
    lastName: "User",
    email: "user@example.com",
    password: "User123@",
    role: "customer",
  },
];

const importData = async () => {
  try {
    await User.deleteMany();
    await Order.deleteMany();
    console.log("🧹 Collections cleared.");

    // Create Users
    const createdUsers = await User.create(users);
    console.log(`👤 Seeded ${createdUsers.length} users successfully.`);

    // Verify Password Hashing
    const bcrypt = require("bcryptjs");
    console.log("🛡️  Verifying password hashes in DB...");
    for (const seededUser of createdUsers) {
      const dbUser = await User.findById(seededUser._id).select("+password");
      const originalPreset = users.find((u) => u.email === dbUser.email);
      const isMatch = await bcrypt.compare(originalPreset.password, dbUser.password);
      console.log(`   - [${dbUser.email}]: ${isMatch ? "✅ Verified" : "❌ Failed Verification"}`);
    }

    const customer = createdUsers[1];

    // Create dummy order
    await Order.create([
      {
        user: customer._id,
        orderItems: [
          {
            product: new mongoose.Types.ObjectId(), // Fake product ID
            name: "Wireless Headphones",
            price: 199.99,
            quantity: 1,
          },
        ],
        shippingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "USA",
        },
        itemsPrice: 199.99,
        taxPrice: 15.0,
        shippingPrice: 0.0,
        totalPrice: 214.99,
        status: "pending",
      },
    ]);

    console.log("🌱 Data Imported Successfully!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Order.deleteMany();

    console.log("💥 Data Destroyed!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
