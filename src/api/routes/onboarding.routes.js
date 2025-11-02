const express = require("express");
const router = express.Router();

const onboardingController = require("../controllers/onboarding.controller");
const onboardingValidator = require("../validators/onboarding.validator");
const validateRequest = require("../middlewares/validateRequest");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post(
  "/register",
  onboardingValidator.register,
  validateRequest,
  onboardingController.register
);

router.post(
  "/verify-otp",
  onboardingValidator.verifyOtp,
  validateRequest,
  onboardingController.verifyOtp
);

router.put(
  "/update-user",
  verifyToken,
  onboardingValidator.updateUser,
  validateRequest,
  onboardingController.updateUser
);

router.post(
  "/complete-mentor",
  verifyToken,
  onboardingController.completeMentorOnboarding
);

router.post(
  "/complete-mentee",
  verifyToken,
  onboardingController.completeMenteeOnboarding
);

router.get(
  "/status",
  verifyToken,
  onboardingController.checkOnboardingStatus
);

module.exports = router;
