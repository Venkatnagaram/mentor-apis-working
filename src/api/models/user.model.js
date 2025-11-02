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
    password: { type: String },
    otp: { type: String },
    verified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["mentor", "mentee"],
      default: "mentee",
    },
    onboardingCompleted: { type: Boolean, default: false },

    // Step 3 - Personal Info
    personalInfo: {
      fullName: String,
      dob: Date,
      gender: String,
      city: String,
      state: String,
      country: String,
      languages: [String],
      hobby: String,
      timezone: String,
    },

    // Step 4 - Professional Info
    professionalInfo: {
      workingStatus: String,
      jobTitle: String,
      organization: String,
      industry: String,
    },

    // Step 5 - Competencies
    competencies: {
      feedback: String,
      listening: String,
      presentation: String,
      networking: String,
      teamwork: String,
    },
  },
  { timestamps: true }
);

// Helpful index for fast lookup during onboarding
userSchema.index({ email: 1, phone: 1 });

module.exports = mongoose.model("User", userSchema);
