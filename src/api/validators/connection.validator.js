const { body, param } = require("express-validator");

exports.sendConnectionRequestValidator = [
  body("mentor_id")
    .notEmpty()
    .withMessage("Mentor ID is required")
    .isMongoId()
    .withMessage("Invalid mentor ID format"),
  body("request_message")
    .optional()
    .isString()
    .withMessage("Request message must be a string")
    .isLength({ max: 500 })
    .withMessage("Request message cannot exceed 500 characters"),
];

exports.respondToRequestValidator = [
  param("connection_id")
    .notEmpty()
    .withMessage("Connection ID is required")
    .isMongoId()
    .withMessage("Invalid connection ID format"),
  body("action")
    .notEmpty()
    .withMessage("Action is required")
    .isIn(["accept", "reject"])
    .withMessage("Action must be either 'accept' or 'reject'"),
  body("reply_message")
    .optional()
    .isString()
    .withMessage("Reply message must be a string")
    .isLength({ max: 500 })
    .withMessage("Reply message cannot exceed 500 characters"),
];

exports.connectionIdValidator = [
  param("connection_id")
    .notEmpty()
    .withMessage("Connection ID is required")
    .isMongoId()
    .withMessage("Invalid connection ID format"),
];
