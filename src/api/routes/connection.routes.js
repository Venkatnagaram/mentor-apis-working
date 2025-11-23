const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connection.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");
const connectionValidator = require("../validators/connection.validator");

router.post(
  "/request",
  verifyToken,
  connectionValidator.sendConnectionRequestValidator,
  validateRequest,
  connectionController.sendConnectionRequest
);

router.post(
  "/respond/:connection_id",
  verifyToken,
  connectionValidator.respondToRequestValidator,
  validateRequest,
  connectionController.respondToConnectionRequest
);

router.get(
  "/pending",
  verifyToken,
  connectionController.getPendingRequests
);

router.get(
  "/sent",
  verifyToken,
  connectionController.getSentRequests
);

router.get(
  "/list",
  verifyToken,
  connectionController.getConnections
);

router.get(
  "/:connection_id",
  verifyToken,
  connectionValidator.connectionIdValidator,
  validateRequest,
  connectionController.getConnectionById
);

router.delete(
  "/cancel/:connection_id",
  verifyToken,
  connectionValidator.connectionIdValidator,
  validateRequest,
  connectionController.cancelConnectionRequest
);

module.exports = router;
