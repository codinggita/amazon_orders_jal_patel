"use strict";

const { getAdminLogs } = require("../utils/auditLogger");

const getActivityLogs = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 50;

  const result = getAdminLogs(page, limit);

  const action = query.action;
  if (action) {
    result.results = result.results.filter(
      (log) => log.action && log.action.toLowerCase().includes(action.toLowerCase())
    );
    result.totalResults = result.results.length;
    result.totalPages = Math.ceil(result.totalResults / limit);
  }

  return result;
};

module.exports = {
  getActivityLogs,
};
