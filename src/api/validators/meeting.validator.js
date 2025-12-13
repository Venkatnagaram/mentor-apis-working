const { param, query } = require("express-validator");

exports.cancelMeetingValidation = [
  param("meetingId").isMongoId().withMessage("Invalid meeting ID format"),
];

exports.getMeetingsValidation = [
  query("status")
    .optional()
    .isIn(["scheduled", "completed", "cancelled"])
    .withMessage("Status must be one of: scheduled, completed, cancelled"),
  query("view")
    .optional()
    .isIn(["current_week", "weekly", "monthly", "custom"])
    .withMessage("View must be one of: current_week, weekly, monthly, custom"),
  query("start_date")
    .optional()
    .isISO8601()
    .withMessage("start_date must be a valid ISO 8601 date"),
  query("end_date")
    .optional()
    .isISO8601()
    .withMessage("end_date must be a valid ISO 8601 date"),
];
