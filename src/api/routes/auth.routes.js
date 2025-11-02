const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const authValidator = require("../validators/auth.validator");
const validateRequest = require("../middlewares/validateRequest");
const { getRateLimiter } = require("../middlewares/rateLimiter");

const authRateLimiter = getRateLimiter(5, 15 * 60 * 1000);

router.post(
  "/register",
  authRateLimiter,
  authValidator.register,
  validateRequest,
  authController.register
);

router.post(
  "/login",
  authRateLimiter,
  authValidator.login,
  validateRequest,
  authController.login
);

router.get("/me", verifyToken, authController.me);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
