const AvailabilityRepo = require("../repositories/availability.repository");
const SlotService = require("../services/slot.service");
const MeetingService = require("../services/meeting.service");
const { successResponse, errorResponse } = require("../../utils/responseHelper");

exports.createAvailability = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = { ...req.body, user_id: userId };
    const created = await AvailabilityRepo.create(body);
    return successResponse(res, "Availability created", created, 201);
  } catch (err) {
    next(err);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const existing = await AvailabilityRepo.findById(id);
    if (!existing) {
      return errorResponse(res, "Availability not found", 404);
    }
    if (existing.user_id.toString() !== userId) {
      return errorResponse(res, "Unauthorized to update this availability", 403);
    }

    const updated = await AvailabilityRepo.update(id, req.body);
    return successResponse(res, "Availability updated", updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteAvailability = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const existing = await AvailabilityRepo.findById(id);
    if (!existing) {
      return errorResponse(res, "Availability not found", 404);
    }
    if (existing.user_id.toString() !== userId) {
      return errorResponse(res, "Unauthorized to delete this availability", 403);
    }

    await AvailabilityRepo.delete(id);
    return successResponse(res, "Availability deleted");
  } catch (err) {
    next(err);
  }
};

exports.getUserAvailabilities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const list = await AvailabilityRepo.findByUser(userId);
    return successResponse(res, "Availabilities retrieved successfully", list);
  } catch (err) {
    next(err);
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const start = req.query.start || (new Date()).toISOString();
    const end = req.query.end || (new Date(Date.now() + 7*24*3600*1000)).toISOString();
    const slots = await SlotService.generateAvailableSlotsForUser(userId, start, end);
    return successResponse(res, "Available slots retrieved successfully", { slots });
  } catch (err) {
    next(err);
  }
};

exports.bookMeeting = async (req, res, next) => {
  try {
    const { connection_id, mentor_id, mentee_id, start_at, end_at, duration_minutes } = req.body;

    if (!mentor_id || !mentee_id || !start_at || !end_at || !duration_minutes) {
      return errorResponse(res, "Missing required fields", 400);
    }

    const meeting = await MeetingService.createMeeting({
      connection_id,
      mentor_id,
      mentee_id,
      start_at,
      end_at,
      duration_minutes,
    });

    return successResponse(res, "Meeting scheduled successfully", meeting, 201);
  } catch (err) {
    if (err.message.includes("conflict") || err.message.includes("past") || err.message.includes("after")) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
};
