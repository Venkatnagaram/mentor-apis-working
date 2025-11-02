const { body } = require("express-validator");

exports.register = [
  body("email").isEmail().withMessage("Valid email required"),
  body("phone").isMobilePhone().withMessage("Valid phone number required"),
];

exports.login = [
  body("email").isEmail().withMessage("Valid email required"),
];

exports.verifyOtp = [
  body("email").isEmail().withMessage("Email required"),
  body("otp").isLength({ min: 4, max: 6 }).withMessage("Invalid OTP"),
];

exports.updateUser = [
  body("userId").optional().isMongoId().withMessage("Valid user ID required"),
];
