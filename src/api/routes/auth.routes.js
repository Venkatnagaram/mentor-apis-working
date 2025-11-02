const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/me", verifyToken, authController.me);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
