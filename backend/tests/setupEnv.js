const path = require("path");
const fs = require("fs");
const os = require("os");

const configPath = path.join(os.tmpdir(), "amazon-orders-test-config.json");
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  process.env.MONGO_URI = config.MONGO_URI;
  process.env.JWT_SECRET = config.JWT_SECRET;
  process.env.NODE_ENV = "test";
  process.env.PORT = "0";
}
