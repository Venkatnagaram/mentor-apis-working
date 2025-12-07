const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  connection_id: { type: mongoose.Schema.Types.ObjectId, ref: "Connection" },
  mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mentee_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  start_at: { type: Date, required: true },
  end_at: { type: Date, required: true },

  duration_minutes: { type: Number, required: true },

  status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled" },

  metadata: { type: Object },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

meetingSchema.index({ mentor_id: 1, start_at: 1 });
meetingSchema.index({ mentee_id: 1, start_at: 1 });

module.exports = mongoose.model("Meeting", meetingSchema);
