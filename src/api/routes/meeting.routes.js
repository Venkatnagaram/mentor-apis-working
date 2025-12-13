const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meeting.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  cancelMeetingValidation,
  getMeetingsValidation,
} = require("../validators/meeting.validator");

router.get(
  "/",
  verifyToken,
  getMeetingsValidation,
  validateRequest,
  meetingController.getUserMeetings
);

router.delete(
  "/:meetingId",
  verifyToken,
  cancelMeetingValidation,
  validateRequest,
  meetingController.cancelMeeting
);

module.exports = router;
