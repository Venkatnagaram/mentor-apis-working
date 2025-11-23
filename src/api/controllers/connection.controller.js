const connectionService = require("../services/connection.service");
const { successResponse, errorResponse } = require("../../utils/responseHelper");

exports.sendConnectionRequest = async (req, res) => {
  try {
    const menteeId = req.user.id;
    const { mentor_id, request_message } = req.body;

    const connection = await connectionService.sendConnectionRequest(
      menteeId,
      mentor_id,
      request_message
    );

    return successResponse(res, "Connection request sent successfully", connection, 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.respondToConnectionRequest = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { connection_id } = req.params;
    const { action, reply_message } = req.body;

    const connection = await connectionService.respondToConnectionRequest(
      mentorId,
      connection_id,
      action,
      reply_message
    );

    const message = action === "accept"
      ? "Connection request accepted successfully"
      : "Connection request rejected";

    return successResponse(res, message, connection);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const requests = await connectionService.getPendingRequests(mentorId);

    return successResponse(res, "Pending requests retrieved successfully", {
      count: requests.length,
      requests,
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const menteeId = req.user.id;
    const requests = await connectionService.getSentRequests(menteeId);

    return successResponse(res, "Sent requests retrieved successfully", {
      count: requests.length,
      requests,
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const connections = await connectionService.getConnections(userId, role);

    return successResponse(res, "Connections retrieved successfully", {
      count: connections.length,
      connections,
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getConnectionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connection_id } = req.params;

    const connection = await connectionService.getConnectionById(userId, connection_id);

    return successResponse(res, "Connection retrieved successfully", connection);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.cancelConnectionRequest = async (req, res) => {
  try {
    const menteeId = req.user.id;
    const { connection_id } = req.params;

    const result = await connectionService.cancelConnectionRequest(menteeId, connection_id);

    return successResponse(res, result.message);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
