const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth.routes");
const onboardingRoutes = require("./onboarding.routes");
const userRoutes = require("./user.routes");
const connectionRoutes = require("./connection.routes");
const messageRoutes = require("./message.routes");
const availabilityRoutes = require("./availability.routes");

// Mount routes with prefixes
router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/users", userRoutes);
router.use("/connections", connectionRoutes);
router.use("/messages", messageRoutes);
router.use("/availability", availabilityRoutes);

module.exports = router;
