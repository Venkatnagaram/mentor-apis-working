const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get(
  "/profile",
  verifyToken,
  userController.getUserProfile
);

router.put(
  "/profile",
  verifyToken,
  userController.updateProfile
);

router.get(
  "/:userId",
  verifyToken,
  userController.getUserById
);

module.exports = router;
