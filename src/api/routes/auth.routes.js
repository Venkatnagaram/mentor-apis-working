const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// 🔹 Step 1: Email/Phone & OTP
router.post("/check-email-phone", authController.checkEmailPhone);
router.post("/verify-otp", authController.verifyOtp);

// 🔹 Step 2: Onboarding forms (protected routes)
router.post("/personal-info", verifyToken, authController.updatePersonalInfo);
router.post("/professional-info", verifyToken, authController.updateProfessionalInfo);
router.post("/complete", verifyToken, authController.completeOnboarding);

// 🔹 Authentication routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", verifyToken, authController.me);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
