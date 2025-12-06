const Message = require("../models/Message");

class MessageRepository {
  async createMessage(data) {
    const message = new Message(data);
    await message.save();
    return message.toObject();
  }

  async findMessageById(messageId) {
    return await Message.findById(messageId)
      .populate('sender_id', '_id personal_info_step1 profile_photo role')
      .populate('receiver_id', '_id personal_info_step1 profile_photo role')
      .lean();
  }

  async getMessagesByConnection(connectionId, limit = 50, skip = 0) {
    return await Message.find({ connection_id: connectionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('sender_id', '_id personal_info_step1 profile_photo role')
      .populate('receiver_id', '_id personal_info_step1 profile_photo role')
      .lean();
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

  async getUnreadCountByConnection(connectionId, userId) {
    return await Message.countDocuments({
      connection_id: connectionId,
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

  async flagMessage(messageId, reason) {
    return await Message.findByIdAndUpdate(
      messageId,
      { is_flagged: true, flagged_reason: reason },
      { new: true }
    ).lean();
  }

  async getConversationList(userId) {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender_id: userId }, { receiver_id: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$connection_id',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver_id', userId] },
                    { $eq: ['$is_read', false] },
                  ],
                },
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
