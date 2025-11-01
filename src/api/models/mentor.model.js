
const mongoose = require("mongoose");

const MentorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Mentor’s domain or specialization areas
    expertiseAreas: [{ type: String, trim: true }],

    // Years of professional experience
    experienceYears: { type: Number, default: 0 },

    // Mentorship-related info
    availability: {
      days: [String], // e.g. ["Monday", "Wednesday"]
      timeSlots: [String], // e.g. ["10:00 AM - 12:00 PM"]
    },

    bio: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    website: { type: String, trim: true },

    rating: {
      average: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },

    // Mentorship preferences
    menteeCountLimit: { type: Number, default: 5 },
    activeMentees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Track onboarding or admin approval status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Index for fast lookup by user or status
MentorSchema.index({ user: 1 });
MentorSchema.index({ status: 1 });

module.exports = mongoose.model("Mentor", MentorSchema);
