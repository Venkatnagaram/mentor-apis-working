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
    onboarding_completed: {
      type: Boolean,
      default: false,
    },
    personal_info: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    professional_info: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    competencies: {
      type: [String],
      default: [],
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
