const express = require("express");
const router = express.Router();
const mentorController = require("../controllers/mentor.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/profile", verifyToken, mentorController.createMentorProfile);
router.get("/profile/me", verifyToken, mentorController.getMyMentorProfile);
router.get("/profile/:id", mentorController.getMentorProfile);
router.put("/profile", verifyToken, mentorController.updateMentorProfile);
router.delete("/profile", verifyToken, mentorController.deleteMentorProfile);
router.get("/", mentorController.getAllMentors);

module.exports = router;
