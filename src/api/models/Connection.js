const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    mentee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    request_message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reply_message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    requested_at: {
      type: Date,
      default: Date.now,
    },
    responded_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

connectionSchema.index({ mentee_id: 1, mentor_id: 1 }, { unique: true });
connectionSchema.index({ mentor_id: 1, status: 1 });
connectionSchema.index({ mentee_id: 1, status: 1 });

module.exports = mongoose.model("Connection", connectionSchema);
