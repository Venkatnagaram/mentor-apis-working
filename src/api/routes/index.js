const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth.routes");
const onboardingRoutes = require("./onboarding.routes");
const onboardingStepsRoutes = require("./onboardingSteps.routes");

// Mount routes with prefixes
router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/onboarding-steps", onboardingStepsRoutes);

module.exports = router;
