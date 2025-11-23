const connectionRepo = require("../repositories/connection.repository");
const userRepo = require("../repositories/user.repository");

exports.sendConnectionRequest = async (menteeId, mentorId, requestMessage) => {
  const mentee = await userRepo.findById(menteeId);
  if (!mentee) throw new Error("Mentee not found");
  if (mentee.role !== "mentee") throw new Error("Only mentees can send connection requests");

  const mentor = await userRepo.findById(mentorId);
  if (!mentor) throw new Error("Mentor not found");
  if (mentor.role !== "mentor") throw new Error("Can only send requests to mentors");

  if (menteeId === mentorId) throw new Error("Cannot send connection request to yourself");

  const existingConnection = await connectionRepo.findConnectionByIds(menteeId, mentorId);
  if (existingConnection) {
    if (existingConnection.status === "pending") {
      throw new Error("Connection request already sent");
    } else if (existingConnection.status === "accepted") {
      throw new Error("Already connected with this mentor");
    } else if (existingConnection.status === "rejected") {
      throw new Error("Previous request was rejected. Cannot send another request.");
    }
  }

  const connectionData = {
    mentee_id: menteeId,
    mentor_id: mentorId,
    status: "pending",
    request_message: requestMessage || "",
    requested_at: new Date(),
  };

  const connection = await connectionRepo.createConnectionRequest(connectionData);
  return connection;
};

exports.respondToConnectionRequest = async (mentorId, connectionId, action, replyMessage) => {
  const connection = await connectionRepo.findConnectionById(connectionId);
  if (!connection) throw new Error("Connection request not found");

  if (connection.mentor_id._id.toString() !== mentorId.toString()) {
    throw new Error("Unauthorized to respond to this connection request");
  }

  if (connection.status !== "pending") {
    throw new Error("Connection request already responded to");
  }

  if (!["accept", "reject"].includes(action)) {
    throw new Error("Invalid action. Must be 'accept' or 'reject'");
  }

  const updateData = {
    status: action === "accept" ? "accepted" : "rejected",
    reply_message: replyMessage || "",
    responded_at: new Date(),
  };

  const updatedConnection = await connectionRepo.updateConnection(connectionId, updateData);
  return updatedConnection;
};

exports.getPendingRequests = async (mentorId) => {
  const requests = await connectionRepo.getPendingRequestsForMentor(mentorId);

  return requests.map(request => ({
    _id: request._id,
    mentee_id: {
      _id: request.mentee_id._id,
      role: request.mentee_id.role,
      city: request.mentee_id.personal_info_step1?.city,
      state: request.mentee_id.personal_info_step1?.state,
      country: request.mentee_id.personal_info_step2?.country,
      job_title: request.mentee_id.company_info?.job_title,
    },
    mentor_id: request.mentor_id,
    status: request.status,
    request_message: request.request_message,
    requested_at: request.requested_at,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    __v: request.__v,
  }));
};

exports.getSentRequests = async (menteeId) => {
  const requests = await connectionRepo.getSentRequestsForMentee(menteeId);
  return requests;
};

exports.getConnections = async (userId, role) => {
  const connections = await connectionRepo.getAcceptedConnectionsForUser(userId, role);
  return connections;
};

exports.getConnectionById = async (userId, connectionId) => {
  const connection = await connectionRepo.findConnectionById(connectionId);
  if (!connection) throw new Error("Connection not found");

  const userIdStr = userId.toString();
  const menteeIdStr = connection.mentee_id._id.toString();
  const mentorIdStr = connection.mentor_id._id.toString();

  if (userIdStr !== menteeIdStr && userIdStr !== mentorIdStr) {
    throw new Error("Unauthorized to view this connection");
  }

  return connection;
};

exports.cancelConnectionRequest = async (menteeId, connectionId) => {
  const connection = await connectionRepo.findConnectionById(connectionId);
  if (!connection) throw new Error("Connection request not found");

  if (connection.mentee_id._id.toString() !== menteeId.toString()) {
    throw new Error("Unauthorized to cancel this connection request");
  }

  if (connection.status !== "pending") {
    throw new Error("Can only cancel pending connection requests");
  }

  await connectionRepo.deleteConnection(connectionId);
  return { message: "Connection request cancelled successfully" };
};
