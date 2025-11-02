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
  "/complete",
  verifyToken,
  onboardingController.completeOnboarding
);

router.get(
  "/status",
  verifyToken,
  onboardingController.checkOnboardingStatus
);

router.get(
  "/current-step",
  verifyToken,
  onboardingController.getCurrentStep
);

router.post(
  "/step-1",
  verifyToken,
  onboardingValidator.step1,
  validateRequest,
  onboardingController.saveStep1
);

router.post(
  "/step-2",
  verifyToken,
  onboardingValidator.step2,
  validateRequest,
  onboardingController.saveStep2
);

router.post(
  "/step-3",
  verifyToken,
  onboardingValidator.step3,
  validateRequest,
  onboardingController.saveStep3
);

router.post(
  "/step-4",
  verifyToken,
  onboardingValidator.step4,
  validateRequest,
  onboardingController.saveStep4
);

router.post(
  "/step-5",
  verifyToken,
  onboardingValidator.step5,
  validateRequest,
  onboardingController.saveStep5
);

module.exports = router;
