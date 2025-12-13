const meetingService = require("../services/meeting.service");
const { successResponse } = require("../../utils/responseHelper");

exports.getUserMeetings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, view, start_date, end_date } = req.query;

    const filters = {
      status: status || "scheduled",
      view,
      start_date,
      end_date,
    };

    const meetings = await meetingService.getMeetingsByUser(userId, filters);

    return successResponse(res, "Meetings retrieved successfully", meetings);
  } catch (error) {
    console.error("Error in getUserMeetings controller:", error);
    next(error);
  }
};

exports.cancelMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.id;

    const updatedMeeting = await meetingService.cancelMeeting(meetingId, userId);

    return successResponse(res, "Meeting cancelled successfully", updatedMeeting);
  } catch (error) {
    console.error("Error in cancelMeeting controller:", error);
    next(error);
  }
};
