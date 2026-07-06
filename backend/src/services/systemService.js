"use strict";

const os = require("os");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const config = require("../config/env");
const packageJson = require("../../package.json");

const getVersion = async () => {
  return {
    version: packageJson.version,
    name: packageJson.name,
    description: packageJson.description,
    author: packageJson.author,
    license: packageJson.license,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
};

const getSanitizedConfig = async () => {
  const sanitized = {
    nodeEnv: config.NODE_ENV,
    port: config.PORT,
    isDev: config.isDev,
    isProd: config.isProd,
    allowedOrigins: config.ALLOWED_ORIGINS,
    jwtExpiresIn: config.JWT_EXPIRES_IN,
    dbConnected: mongoose.connection.readyState === 1,
  };
  return sanitized;
};

const getUptime = async () => {
  return {
    server: {
      uptimeSeconds: Math.floor(process.uptime()),
      uptimeFormatted: formatDuration(Math.floor(process.uptime())),
      startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    },
    system: {
      uptimeSeconds: Math.floor(os.uptime()),
      uptimeFormatted: formatDuration(Math.floor(os.uptime())),
    },
  };
};

const getPing = async () => {
  return {
    pong: true,
    timestamp: new Date().toISOString(),
    responseTimeMs: process.hrtime()[1] / 1000000,
  };
};

const getDatabaseStatus = async () => {
  const states = {
    0: { label: "disconnected", healthy: false },
    1: { label: "connected", healthy: true },
    2: { label: "connecting", healthy: false },
    3: { label: "disconnecting", healthy: false },
  };

  const state = states[mongoose.connection.readyState] || {
    label: "unknown",
    healthy: false,
  };

  return {
    status: state.label,
    healthy: state.healthy,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    models: mongoose.modelNames().length,
    readyState: mongoose.connection.readyState,
  };
};

const getCacheStatus = async () => {
  return {
    configured: false,
    provider: "none",
    healthy: null,
    message: "No cache layer configured. Redis can be added for production.",
  };
};

const getStorageStatus = async () => {
  const rootDir = path.resolve(__dirname, "..", "..");
  const logsDir = path.join(rootDir, "logs");

  let logsSize = null;
  try {
    if (fs.existsSync(logsDir)) {
      logsSize = await getDirectorySize(logsDir);
    }
  } catch {
    logsSize = null;
  }

  return {
    rootDirectory: rootDir,
    writable: isWritable(rootDir),
    logs: {
      exists: fs.existsSync(logsDir),
      sizeBytes: logsSize,
    },
  };
};

function formatDuration(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
}

function isWritable(dir) {
  try {
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

async function getDirectorySize(dir) {
  let totalSize = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile()) {
      totalSize += fs.statSync(fullPath).size;
    } else if (entry.isDirectory()) {
      totalSize += await getDirectorySize(fullPath);
    }
  }
  return totalSize;
}

module.exports = {
  getVersion,
  getSanitizedConfig,
  getUptime,
  getPing,
  getDatabaseStatus,
  getCacheStatus,
  getStorageStatus,
};
