const Connection = require("../models/Connection");

exports.createConnectionRequest = async (connectionData) => {
  const connection = new Connection(connectionData);
  return await connection.save();
};

exports.findConnectionByIds = async (menteeId, mentorId) => {
  return await Connection.findOne({
    mentee_id: menteeId,
    mentor_id: mentorId,
  });
};

exports.findConnectionById = async (connectionId) => {
  return await Connection.findById(connectionId)
    .populate("mentee_id", "email phone personal_info_step1 personal_info_step2 profile_photo role")
    .populate("mentor_id", "email phone personal_info_step1 personal_info_step2 profile_photo role");
};

exports.updateConnection = async (connectionId, updateData) => {
  return await Connection.findByIdAndUpdate(connectionId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("mentee_id", "email phone personal_info_step1 personal_info_step2 profile_photo role")
    .populate("mentor_id", "email phone personal_info_step1 personal_info_step2 profile_photo role");
};

exports.getPendingRequestsForMentor = async (mentorId) => {
  return await Connection.find({
    mentor_id: mentorId,
    status: "pending",
  })
    .populate("mentee_id", "personal_info_step1 personal_info_step2 company_info profile_photo role")
    .sort({ requested_at: -1 });
};

exports.getSentRequestsForMentee = async (menteeId) => {
  return await Connection.find({
    mentee_id: menteeId,
  })
    .populate("mentor_id", "email phone personal_info_step1 personal_info_step2 profile_photo role")
    .sort({ requested_at: -1 });
};

exports.getAcceptedConnectionsForUser = async (userId, role) => {
  const query = {
    status: "accepted",
  };

  if (role === "mentor") {
    query.mentor_id = userId;
  } else {
    query.mentee_id = userId;
  }

  return await Connection.find(query)
    .populate("mentee_id", "email phone personal_info_step1 personal_info_step2 profile_photo role")
    .populate("mentor_id", "email phone personal_info_step1 personal_info_step2 profile_photo role")
    .sort({ responded_at: -1 });
};

exports.deleteConnection = async (connectionId) => {
  return await Connection.findByIdAndDelete(connectionId);
};
