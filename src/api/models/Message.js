const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    connection_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
      index: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message_text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    read_at: {
      type: Date,
    },
    is_flagged: {
      type: Boolean,
      default: false,
    },
    flagged_reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ connection_id: 1, createdAt: -1 });
messageSchema.index({ sender_id: 1, createdAt: -1 });
messageSchema.index({ receiver_id: 1, is_read: 1 });

module.exports = mongoose.model("Message", messageSchema);
