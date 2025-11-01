const express = require("express");
const router = express.Router();

const onboardingController = require("../controllers/onboarding.controller");
const onboardingValidator = require("../validators/onboarding.validator");
const validateRequest = require("../middlewares/validateRequest");

// ✅ Route for user registration (send OTP)
router.post(
  "/register",
  onboardingValidator.register,
  validateRequest,
  onboardingController.register
);

// ✅ Route for OTP verification
router.post(
  "/verify-otp",
  onboardingValidator.verifyOtp,
  validateRequest,
  onboardingController.verifyOtp
);

module.exports = router;
