/**
 * @file cleanDb.js
 * @description Wipes ALL demo/seed data from every collection in the database.
 *
 * RUN:  node scripts/cleanDb.js
 */

"use strict";

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
const path     = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import every model so Mongoose registers the schemas
const User         = require("../src/models/User");
const Order        = require("../src/models/order.model");
const Product      = require("../src/models/Product");
const Category     = require("../src/models/Category");
const Notification = require("../src/models/Notification");
const Payment      = require("../src/models/Payment");
const Shipment     = require("../src/models/Shipment");

const COLLECTIONS = [
  { name: "Users",         model: User         },
  { name: "Orders",        model: Order        },
  { name: "Products",      model: Product      },
  { name: "Categories",    model: Category     },
  { name: "Notifications", model: Notification },
  { name: "Payments",      model: Payment      },
  { name: "Shipments",     model: Shipment     },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected →", mongoose.connection.host);
    console.log("─────────────────────────────────────────────────");
    console.log("🧹  Wiping all collections...\n");

    for (const col of COLLECTIONS) {
      const result = await col.model.deleteMany({});
      console.log(`   ✔  ${col.name.padEnd(15)} — ${result.deletedCount} document(s) removed`);
    }

    console.log("\n💥  All demo / seed data has been purged.");
    console.log("    The database is now clean.");
    console.log("─────────────────────────────────────────────────");
    process.exit(0);
  } catch (err) {
    console.error("❌  Error:", err.message);
    process.exit(1);
  }
};

run();
