const Message = require("../models/Message");
const mongoose = require("mongoose");

class MessageRepository {
  async createMessage(data) {
    const message = new Message(data);
    await message.save();
    return message.toObject();
  }

  /**
   * Normalize sender/receiver output for frontend
   */
  normalizeMessage(message) {
    if (!message) return null;

    let senderDetails = null;
    let receiverDetails = null;

    // --- Normalize sender_id ---
    if (message.sender_id && typeof message.sender_id === "object" && message.sender_id._id) {
      senderDetails = message.sender_id;
      message.sender_id = message.sender_id._id.toString();
    } else {
      message.sender_id = message.sender_id?.toString();
    }

    // --- Normalize receiver_id ---
    if (message.receiver_id && typeof message.receiver_id === "object" && message.receiver_id._id) {
      receiverDetails = message.receiver_id;
      message.receiver_id = message.receiver_id._id.toString();
    } else {
      message.receiver_id = message.receiver_id?.toString();
    }

    message.sender = senderDetails;
    message.receiver = receiverDetails;

    return message;
  }

  async findMessageById(messageId) {
    const message = await Message.findById(messageId)
      .populate("sender_id", "_id personal_info_step1 profile_photo role")
      .populate("receiver_id", "_id personal_info_step1 profile_photo role")
      .lean();

    return this.normalizeMessage(message);
  }

  async getMessagesByConnection(connectionId, limit = 50, skip = 0) {
    const messages = await Message.find({ connection_id: connectionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("sender_id", "_id personal_info_step1 profile_photo role")
      .populate("receiver_id", "_id personal_info_step1 profile_photo role")
      .lean();

    return messages.map(msg => this.normalizeMessage(msg));
  }

  async markAsRead(messageId, userId) {
    return await Message.findOneAndUpdate(
      { _id: messageId, receiver_id: userId, is_read: false },
      { is_read: true, read_at: new Date() },
      { new: true }
    ).lean();
  }

  async markMultipleAsRead(connectionId, userId) {
    return await Message.updateMany(
      { connection_id: connectionId, receiver_id: userId, is_read: false },
      { is_read: true, read_at: new Date() }
    );
  }

  async getUnreadCount(userId) {
    return await Message.countDocuments({
      receiver_id: userId,
      is_read: false,
    });
  }

  async deleteMessage(messageId, userId) {
    return await Message.findOneAndDelete({
      _id: messageId,
      sender_id: userId,
    }).lean();
  }

  async getConversationList(userId) {
    // Convert userId to ObjectId for aggregation pipeline
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender_id: userObjectId }, { receiver_id: userObjectId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$connection_id",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver_id", userObjectId] }, { $eq: ["$is_read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    return messages;
  }
}

module.exports = new MessageRepository();
