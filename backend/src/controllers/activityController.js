"use strict";

const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const activityService = require("../services/activityService");

const getActivityLogs = catchAsync(async (req, res) => {
  const result = await activityService.getActivityLogs(req.query);
  sendSuccess(res, 200, "Activity logs retrieved successfully", result);
});

module.exports = {
  getActivityLogs,
};
