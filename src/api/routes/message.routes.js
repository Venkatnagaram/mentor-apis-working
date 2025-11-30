const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");
const messageValidator = require("../validators/message.validator");

router.post(
  "/send",
  verifyToken,
  messageValidator.sendMessageValidator,
  validateRequest,
  messageController.sendMessage
);

router.get(
  "/conversation/:connection_id",
  verifyToken,
  messageValidator.connectionIdValidator,
  validateRequest,
  messageController.getConversationMessages
);

router.put(
  "/read/:connection_id",
  verifyToken,
  messageValidator.connectionIdValidator,
  validateRequest,
  messageController.markMessagesAsRead
);

router.get(
  "/unread-count",
  verifyToken,
  messageController.getUnreadCount
);

router.get(
  "/conversations",
  verifyToken,
  messageController.getConversationList
);

router.delete(
  "/:message_id",
  verifyToken,
  messageValidator.messageIdValidator,
  validateRequest,
  messageController.deleteMessage
);

router.post(
  "/validate",
  messageValidator.validateMessageValidator,
  validateRequest,
  messageController.validateMessage
);

module.exports = router;
