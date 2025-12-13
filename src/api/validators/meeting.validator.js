const { param, query } = require("express-validator");

exports.cancelMeetingValidation = [
  param("meetingId").isMongoId().withMessage("Invalid meeting ID format"),
];

exports.getMeetingsValidation = [
  query("status")
    .optional()
    .isIn(["scheduled", "completed", "cancelled"])
    .withMessage("Status must be one of: scheduled, completed, cancelled"),
];
