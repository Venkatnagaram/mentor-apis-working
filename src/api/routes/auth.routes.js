const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");

const loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
];

const verifyLoginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("otp").isLength({ min: 4, max: 6 }).withMessage("Invalid OTP"),
];

router.post(
  "/login",
  loginValidator,
  validateRequest,
  authController.login
);

router.post(
  "/verify-login",
  verifyLoginValidator,
  validateRequest,
  authController.verifyLogin
);

router.get("/me", verifyToken, authController.me);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
