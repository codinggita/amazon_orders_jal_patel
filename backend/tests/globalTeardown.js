const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const os = require("os");

module.exports = async () => {
  await mongoose.disconnect();

  const configPath = path.join(os.tmpdir(), "amazon-orders-test-config.json");
  try {
    fs.unlinkSync(configPath);
  } catch (e) {}
};
