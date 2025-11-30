const { body, param } = require("express-validator");

exports.sendMessageValidator = [
  body("connection_id")
    .notEmpty()
    .withMessage("Connection ID is required")
    .isMongoId()
    .withMessage("Invalid connection ID format"),
  body("message_text")
    .notEmpty()
    .withMessage("Message text is required")
    .isString()
    .withMessage("Message text must be a string")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message text must be between 1 and 2000 characters"),
];

exports.connectionIdValidator = [
  param("connection_id")
    .notEmpty()
    .withMessage("Connection ID is required")
    .isMongoId()
    .withMessage("Invalid connection ID format"),
];

exports.messageIdValidator = [
  param("message_id")
    .notEmpty()
    .withMessage("Message ID is required")
    .isMongoId()
    .withMessage("Invalid message ID format"),
];

exports.validateMessageValidator = [
  body("message_text")
    .notEmpty()
    .withMessage("Message text is required")
    .isString()
    .withMessage("Message text must be a string")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message text must be between 1 and 2000 characters"),
];
