const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    country_code: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["mentee", "mentor"],
      default: "mentee",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    agree_terms: {
      type: Boolean,
      required: true,
      default: false,
    },
    agree_privacy: {
      type: Boolean,
      required: true,
      default: false,
    },
    onboarding_completed: {
      type: Boolean,
      default: false,
    },
    onboarding_step: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    personal_info_step1: {
      full_name: String,
      date_of_birth: Date,
      gender: String,
      city: String,
      state: String,
    },
    personal_info_step2: {
      country: String,
      timezone: String,
      languages: [String],
      hobby: String,
      bio: String,
      skills_to_learn: [String],
      skills_to_teach: [String],
      goal: String,
    },
    company_info: {
      working_status: String,
      job_title: String,
      company_name: String,
      industry: String,
    },
    profile_photo: {
      type: String,
    },
    competencies: {
      giving_receiving_feedback: String,
      listening_skills: String,
      presentation_skills: String,
      networking: String,
      teamwork: String,
    },
    otp: {
      type: String,
    },
    otp_expiry: {
      type: Date,
    },
    login_attempts: {
      type: Number,
      default: 0,
    },
    lock_until: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
