const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    expertise_areas: {
      type: [String],
      default: [],
    },
    experience_years: {
      type: Number,
      default: 0,
    },
    availability: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    bio: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    rating_average: {
      type: Number,
      default: 0,
    },
    rating_total_reviews: {
      type: Number,
      default: 0,
    },
    mentee_count_limit: {
      type: Number,
      default: 5,
    },
    active_mentees: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Mentor", mentorSchema);
