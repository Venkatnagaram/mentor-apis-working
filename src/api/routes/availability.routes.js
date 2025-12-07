const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availability.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  createAvailabilityValidation,
  updateAvailabilityValidation,
  deleteAvailabilityValidation,
  getAvailableSlotsValidation,
  bookMeetingValidation,
} = require("../validators/availability.validator");

router.post(
  "/",
  verifyToken,
  createAvailabilityValidation,
  validateRequest,
  availabilityController.createAvailability
);

router.put(
  "/:id",
  verifyToken,
  updateAvailabilityValidation,
  validateRequest,
  availabilityController.updateAvailability
);

router.delete(
  "/:id",
  verifyToken,
  deleteAvailabilityValidation,
  validateRequest,
  availabilityController.deleteAvailability
);

router.get("/", verifyToken, availabilityController.getUserAvailabilities);

router.get(
  "/slots/:userId",
  verifyToken,
  getAvailableSlotsValidation,
  validateRequest,
  availabilityController.getAvailableSlots
);

router.post(
  "/book",
  verifyToken,
  bookMeetingValidation,
  validateRequest,
  availabilityController.bookMeeting
);

module.exports = router;
