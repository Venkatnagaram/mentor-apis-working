const { body } = require("express-validator");

exports.register = [
  body("email").isEmail().withMessage("Valid email required"),
  body("phone").isMobilePhone().withMessage("Valid phone number required"),
  body("role").isIn(["mentor", "mentee"]).withMessage("Role must be either mentor or mentee"),
];

exports.verifyOtp = [
  body("email").isEmail().withMessage("Email required"),
  body("otp").isLength({ min: 4, max: 6 }).withMessage("Invalid OTP"),
];

exports.updateUser = [
  body("userId").optional().isMongoId().withMessage("Valid user ID required"),
];
