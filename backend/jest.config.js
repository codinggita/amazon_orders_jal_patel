module.exports = {
  testEnvironment: "node",
  globalSetup: "./tests/globalSetup.js",
  globalTeardown: "./tests/globalTeardown.js",
  setupFiles: ["./tests/setupEnv.js"],
  testTimeout: 120000,
  maxWorkers: 1,
  testMatch: ["**/tests/**/*.test.js"],
};
