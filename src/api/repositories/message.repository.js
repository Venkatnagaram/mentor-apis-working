const Message = require("../models/Message");

class MessageRepository {
  async createMessage(data) {
    const message = new Message(data);
    await message.save();
    return message.toObject();
  }

  async findMessageById(messageId) {
    const message = await Message.findById(messageId)
      .populate('sender_id', '_id personal_info_step1 profile_photo role')
      .populate('receiver_id', '_id personal_info_step1 profile_photo role')
      .lean();

    if (message) {
      let senderDetails = null;
      let receiverDetails = null;

      // If populated → it's an object with _id
      if (message.sender_id && typeof message.sender_id === "object" && message.sender_id._id) {
        senderDetails = message.sender_id;
        message.sender_id = message.sender_id._id.toString();
      } else if (message.sender_id) {
        // If not populated → leave it as a string
        message.sender_id = message.sender_id.toString();
      }

      if (message.receiver_id && typeof message.receiver_id === "object" && message.receiver_id._id) {
        receiverDetails = message.receiver_id;
        message.receiver_id = message.receiver_id._id.toString();
      } else if (message.receiver_id) {
        message.receiver_id = message.receiver_id.toString();
      }

      message.sender = senderDetails;
      message.receiver = receiverDetails;
    }

    return message;
  }

  async getMessagesByConnection(connectionId, limit = 50, skip = 0) {
    const messages = await Message.find({ connection_id: connectionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('sender_id', '_id personal_info_step1 profile_photo role')
      .populate('receiver_id', '_id personal_info_step1 profile_photo role')
      .lean();

    // Transform messages to have both ID strings and populated objects
    return messages.map(message => {
      let senderDetails = null;
      let receiverDetails = null;

      // If populated → it's an object with _id
      if (message.sender_id && typeof message.sender_id === "object" && message.sender_id._id) {
        senderDetails = message.sender_id;
        message.sender_id = message.sender_id._id.toString();
      } else if (message.sender_id) {
        // If not populated → leave it as a string
        message.sender_id = message.sender_id.toString();
      }

      if (message.receiver_id && typeof message.receiver_id === "object" && message.receiver_id._id) {
        receiverDetails = message.receiver_id;
        message.receiver_id = message.receiver_id._id.toString();
      } else if (message.receiver_id) {
        message.receiver_id = message.receiver_id.toString();
      }

      return {
        ...message,
        sender: senderDetails,
        receiver: receiverDetails
      };
    });
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
