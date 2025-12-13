const meetingService = require("../services/meeting.service");
const { successResponse } = require("../../utils/responseHelper");
const { convertRequestToUTC, convertResponseFromUTC } = require("../../utils/timezone");

exports.getUserMeetings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const timezone = req.timezone;
    const { status, view, start_date, end_date } = req.query;

    const convertedDates = start_date && end_date
      ? convertRequestToUTC({ start_date, end_date }, timezone)
      : {};

    const filters = {
      status: status || "scheduled",
      view,
      start_date: convertedDates.start_date || start_date,
      end_date: convertedDates.end_date || end_date,
    };

    const meetings = await meetingService.getMeetingsByUser(userId, filters);
    const response = convertResponseFromUTC(meetings, timezone);

    return successResponse(res, "Meetings retrieved successfully", response);
  } catch (error) {
    console.error("Error in getUserMeetings controller:", error);
    next(error);
  }
};

exports.cancelMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.id;
    const timezone = req.timezone;

    const updatedMeeting = await meetingService.cancelMeeting(meetingId, userId);
    const response = convertResponseFromUTC(updatedMeeting, timezone);

    return successResponse(res, "Meeting cancelled successfully", response);
  } catch (error) {
    console.error("Error in cancelMeeting controller:", error);
    next(error);
  }
};
