const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    otpExpiry: { type: Date },
    verified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["mentor", "mentee"],
      default: "mentee",
    },
    onboardingCompleted: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

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

    professionalInfo: {
      workingStatus: String,
      jobTitle: String,
      organization: String,
      industry: String,
    },

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

userSchema.index({ email: 1, phone: 1 });
userSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) return next();
  try {
    this.otp = await bcrypt.hash(this.otp, 10);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.compareOtp = async function (enteredOtp) {
  return await bcrypt.compare(enteredOtp, this.otp);
};

module.exports = mongoose.model("User", userSchema);
