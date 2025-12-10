const mongoose = require("mongoose");

const timeRangeSchema = new mongoose.Schema({
  from: { type: String, required: true }, // "09:00"
  to: { type: String, required: true },   // "17:30"
}, { _id: false });

const dateRangeSchema = new mongoose.Schema({
  start_date: Date, // inclusive
  end_date: Date,   // inclusive (optional for single)
  dates: [Date],    // for single_dates type
  time_ranges: {
    type: [timeRangeSchema],
    default: [],
  },
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

  // type: 'weekly' | 'date_range' | 'single_dates'
  type: { type: String, enum: ["weekly", "date_range", "single_dates"], required: true },

  // for weekly: days contains ["mon","tue"...]
  days: [{ type: String }],

  // timeRanges per day for weekly or for date-specific store under time_ranges
  time_ranges: { // either applied for weekly days or for specific dates via date_ranges below
    type: [timeRangeSchema],
    default: [],
  },

  // for date_range / single_dates
  date_ranges: {
    type: [dateRangeSchema],
    default: [],
  },

  slot_duration_minutes: { type: Number, default: 30 }, // e.g., 30

  valid_from: Date,
  valid_to: Date,

  active: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

availabilitySchema.index({ user_id: 1 });

module.exports = mongoose.model("Availability", availabilitySchema);
