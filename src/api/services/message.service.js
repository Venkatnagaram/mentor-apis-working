const messageRepo = require("../repositories/message.repository");
const connectionRepo = require("../repositories/connection.repository");
const contentModeration = require("../../utils/contentModeration");

class MessageService {
  async sendMessage(senderId, connectionId, messageText) {
    const connection = await connectionRepo.findConnectionById(connectionId);

    if (!connection) {
      throw new Error("Connection not found");
    }

    if (connection.status !== "accepted") {
      throw new Error("Cannot send messages to non-accepted connections");
    }

    const isSenderInConnection =
      connection.mentee_id.toString() === senderId.toString() ||
      connection.mentor_id.toString() === senderId.toString();

    if (!isSenderInConnection) {
      throw new Error("You are not part of this connection");
    }

    const moderationResult = await contentModeration.moderateContent(messageText);

    if (!moderationResult.isAllowed) {
      throw new Error(`Message blocked: ${moderationResult.reasons.join(', ')}`);
    }

    const receiverId =
      connection.mentee_id.toString() === senderId.toString()
        ? connection.mentor_id
        : connection.mentee_id;

    const messageData = {
      connection_id: connectionId,
      sender_id: senderId,
      receiver_id: receiverId,
      message_text: messageText,
    };

    const message = await messageRepo.createMessage(messageData);

    return await messageRepo.findMessageById(message._id);
  }

  async getConversationMessages(userId, connectionId, page = 1, limit = 50) {
    const connection = await connectionRepo.findConnectionById(connectionId);

    if (!connection) {
      throw new Error("Connection not found");
    }

    const isUserInConnection =
      connection.mentee_id.toString() === userId.toString() ||
      connection.mentor_id.toString() === userId.toString();

    if (!isUserInConnection) {
      throw new Error("You are not part of this connection");
    }

    const skip = (page - 1) * limit;
    const messages = await messageRepo.getMessagesByConnection(connectionId, limit, skip);

    return messages.reverse();
  }

  async markMessagesAsRead(userId, connectionId) {
    const connection = await connectionRepo.findConnectionById(connectionId);

    if (!connection) {
      throw new Error("Connection not found");
    }

    const isUserInConnection =
      connection.mentee_id.toString() === userId.toString() ||
      connection.mentor_id.toString() === userId.toString();

    if (!isUserInConnection) {
      throw new Error("You are not part of this connection");
    }

    const result = await messageRepo.markMultipleAsRead(connectionId, userId);

    return {
      modifiedCount: result.modifiedCount,
    };
  }

  async getUnreadCount(userId) {
    return await messageRepo.getUnreadCount(userId);
  }

  async getConversationList(userId) {
    const conversations = await messageRepo.getConversationList(userId);

    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const connection = await connectionRepo.findConnectionById(conv._id);

        if (!connection) return null;

        const otherUserId =
          connection.mentee_id.toString() === userId.toString()
            ? connection.mentor_id
            : connection.mentee_id;

        return {
          connection_id: conv._id,
          connection_details: {
            mentor_id: connection.mentor_id,
            mentee_id: connection.mentee_id,
          },
          other_user: {
            _id: otherUserId._id,
            full_name: otherUserId.personal_info_step1?.full_name,
            profile_photo: otherUserId.profile_photo,
            role: otherUserId.role,
          },
          last_message: {
            _id: conv.lastMessage._id,
            message_text: conv.lastMessage.message_text,
            sender_id: conv.lastMessage.sender_id,
            createdAt: conv.lastMessage.createdAt,
            is_read: conv.lastMessage.is_read,
          },
          unread_count: conv.unreadCount,
        };
      })
    );

    return populatedConversations.filter((conv) => conv !== null);
  }

  async deleteMessage(userId, messageId) {
    const message = await messageRepo.findMessageById(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.sender_id._id.toString() !== userId.toString()) {
      throw new Error("You can only delete your own messages");
    }

    await messageRepo.deleteMessage(messageId, userId);

    return { success: true };
  }

  async validateMessageContent(messageText) {
    const moderationResult = await contentModeration.moderateContent(messageText);

    return {
      isValid: moderationResult.isAllowed,
      reasons: moderationResult.reasons,
      sanitized: contentModeration.sanitizeMessage(messageText),
    };
  }
}

module.exports = new MessageService();
