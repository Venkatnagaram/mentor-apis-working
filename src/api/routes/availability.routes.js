const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availability.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { body, param } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");

// create
router.post(
  "/",
  verifyToken,
  body("type").isIn(["weekly","date_range","single_dates"]),
  validateRequest,
  availabilityController.createAvailability
);

// update
router.put("/:id", verifyToken, param("id").isMongoId(), validateRequest, availabilityController.updateAvailability);

// delete
router.delete("/:id", verifyToken, param("id").isMongoId(), validateRequest, availabilityController.deleteAvailability);

// list for current user
router.get("/", verifyToken, availabilityController.getUserAvailabilities);

// get generated slots for user (public or protected)
router.get("/slots/:userId", verifyToken, availabilityController.getAvailableSlots);

// book meeting
router.post("/book", verifyToken, availabilityController.bookMeeting);

module.exports = router;
