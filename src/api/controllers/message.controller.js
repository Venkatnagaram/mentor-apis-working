const messageService = require("../services/message.service");
const { successResponse, errorResponse } = require("../../utils/responseHelper");

exports.sendMessage = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const { connection_id, message_text } = req.body;

    const message = await messageService.sendMessage(
      req.user.id,
      connection_id,
      message_text
    );

    return successResponse(res, "Message sent successfully", message, 201);
  } catch (err) {
    if (err.message.includes("Connection not found")) {
      return errorResponse(res, err.message, 404);
    }
    if (err.message.includes("Cannot send messages") || err.message.includes("not part of")) {
      return errorResponse(res, err.message, 403);
    }
    if (err.message.includes("Message blocked")) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
};

exports.getConversationMessages = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const { connection_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await messageService.getConversationMessages(
      req.user.id,
      connection_id,
      page,
      limit
    );

    return successResponse(res, "Messages retrieved successfully", {
      page,
      limit,
      messages,
    });
  } catch (err) {
    if (err.message.includes("Connection not found")) {
      return errorResponse(res, err.message, 404);
    }
    if (err.message.includes("not part of")) {
      return errorResponse(res, err.message, 403);
    }
    next(err);
  }
};

exports.markMessagesAsRead = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const { connection_id } = req.params;

    const result = await messageService.markMessagesAsRead(req.user.id, connection_id);

    return successResponse(res, "Messages marked as read", result);
  } catch (err) {
    if (err.message.includes("Connection not found")) {
      return errorResponse(res, err.message, 404);
    }
    if (err.message.includes("not part of")) {
      return errorResponse(res, err.message, 403);
    }
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const count = await messageService.getUnreadCount(req.user.id);
    const messages = await messageService.getUnreadMessagesList(req.user.id);

    return successResponse(res, "Unread messages retrieved successfully", {
      unread_count: count,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

exports.getConversationList = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const conversations = await messageService.getConversationList(req.user.id);

    return successResponse(res, "Conversation list retrieved successfully", {
      count: conversations.length,
      conversations,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const { message_id } = req.params;

    await messageService.deleteMessage(req.user.id, message_id);

    return successResponse(res, "Message deleted successfully");
  } catch (err) {
    if (err.message.includes("Message not found")) {
      return errorResponse(res, err.message, 404);
    }
    if (err.message.includes("only delete your own")) {
      return errorResponse(res, err.message, 403);
    }
    next(err);
  }
};

exports.validateMessage = async (req, res, next) => {
  try {
    const { message_text } = req.body;

    if (!message_text) {
      return errorResponse(res, "Message text is required", 400);
    }

    const validation = await messageService.validateMessageContent(message_text);

    return successResponse(res, "Message validation completed", validation);
  } catch (err) {
    next(err);
  }
};
