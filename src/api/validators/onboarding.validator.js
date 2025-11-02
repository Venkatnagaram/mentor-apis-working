const { body } = require("express-validator");

exports.register = [
  body("email").isEmail().withMessage("Valid email required"),
  body("phone").isMobilePhone().withMessage("Valid phone number required"),
  body("country_code").notEmpty().withMessage("Country code is required"),
  body("role").isIn(["mentor", "mentee"]).withMessage("Role must be either mentor or mentee"),
];

exports.verifyOtp = [
  body("email").isEmail().withMessage("Email required"),
  body("otp").isLength({ min: 4, max: 6 }).withMessage("Invalid OTP"),
];

exports.updateUser = [];

exports.step1 = [
  body("full_name").notEmpty().withMessage("Full name is required"),
  body("date_of_birth").isISO8601().withMessage("Valid date of birth required"),
  body("gender").isIn(["Male", "Female", "Other"]).withMessage("Gender must be Male, Female, or Other"),
  body("city").notEmpty().withMessage("City is required"),
  body("state").notEmpty().withMessage("State is required"),
];

exports.step2 = [
  body("country").notEmpty().withMessage("Country is required"),
  body("timezone").notEmpty().withMessage("Timezone is required"),
  body("languages").isArray({ min: 1 }).withMessage("At least one language is required"),
  body("hobby").notEmpty().withMessage("Hobby is required"),
  body("bio").notEmpty().isLength({ max: 140 }).withMessage("Bio is required (max 140 characters)"),
];

exports.step3 = [
  body("working_status").notEmpty().withMessage("Working status is required"),
  body("job_title").notEmpty().withMessage("Job title is required"),
  body("company_name").notEmpty().withMessage("Company name is required"),
  body("industry").notEmpty().withMessage("Industry is required"),
];

exports.step4 = [];

exports.step5 = [
  body("giving_receiving_feedback").isIn(["Fair", "Good", "Excellent", "Outstanding"]).withMessage("Invalid rating for giving/receiving feedback"),
  body("listening_skills").isIn(["Fair", "Good", "Excellent", "Outstanding"]).withMessage("Invalid rating for listening skills"),
  body("presentation_skills").isIn(["Fair", "Good", "Excellent", "Outstanding"]).withMessage("Invalid rating for presentation skills"),
  body("networking").isIn(["Fair", "Good", "Excellent", "Outstanding"]).withMessage("Invalid rating for networking"),
  body("teamwork").isIn(["Fair", "Good", "Excellent", "Outstanding"]).withMessage("Invalid rating for teamwork"),
];
