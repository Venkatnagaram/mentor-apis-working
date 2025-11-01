const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth.routes");
const onboardingRoutes = require("./onboarding.routes");

// Mount routes with prefixes
router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);

module.exports = router;
