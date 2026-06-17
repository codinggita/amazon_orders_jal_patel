const { MongoMemoryServer } = require("mongodb-memory-server");
const path = require("path");
const fs = require("fs");
const os = require("os");

module.exports = async () => {
  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: "amazon_test",
    },
  });

  const uri = mongod.getUri();

  const config = {
    MONGO_URI: uri,
    JWT_SECRET: "test-jwt-secret-for-testing-purposes-only",
  };

  const configPath = path.join(os.tmpdir(), "amazon-orders-test-config.json");
  fs.writeFileSync(configPath, JSON.stringify(config));

  global.__MONGOD__ = mongod;
};
