const meetingService = require("../services/meeting.service");
const { sendSuccess, sendError } = require("../../utils/responseHelper");

exports.getUserMeetings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const meetings = await meetingService.getMeetingsByUser(userId, status || "scheduled");

    return sendSuccess(res, meetings, "Meetings retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

exports.cancelMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.id;

    const updatedMeeting = await meetingService.cancelMeeting(meetingId, userId);

    return sendSuccess(res, updatedMeeting, "Meeting cancelled successfully");
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 :
                       error.message.includes("Unauthorized") ? 403 :
                       error.message.includes("only cancel") ? 400 : 500;
    return sendError(res, error.message, statusCode);
  }
};
