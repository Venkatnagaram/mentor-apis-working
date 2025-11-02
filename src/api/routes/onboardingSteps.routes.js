const express = require("express");
const router = express.Router();

const onboardingStepsController = require("../controllers/onboardingSteps.controller");
const onboardingStepsValidator = require("../validators/onboardingSteps.validator");
const validateRequest = require("../middlewares/validateRequest");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get(
  "/current-step",
  verifyToken,
  onboardingStepsController.getCurrentStep
);

router.post(
  "/step-1",
  verifyToken,
  onboardingStepsValidator.step1,
  validateRequest,
  onboardingStepsController.saveStep1
);

router.post(
  "/step-2",
  verifyToken,
  onboardingStepsValidator.step2,
  validateRequest,
  onboardingStepsController.saveStep2
);

router.post(
  "/step-3",
  verifyToken,
  onboardingStepsValidator.step3,
  validateRequest,
  onboardingStepsController.saveStep3
);

router.post(
  "/step-4",
  verifyToken,
  onboardingStepsValidator.step4,
  validateRequest,
  onboardingStepsController.saveStep4
);

router.post(
  "/step-5",
  verifyToken,
  onboardingStepsValidator.step5,
  validateRequest,
  onboardingStepsController.saveStep5
);

module.exports = router;
