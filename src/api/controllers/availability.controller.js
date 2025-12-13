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
    const grouped = req.query.grouped === 'true';
    const debug = req.query.debug === 'true';

    if (debug) {
      const avList = await AvailabilityRepo.findByUser(userId);
      return successResponse(res, "Debug info", {
        total_availabilities: avList.length,
        availabilities: avList.map(av => ({
          id: av._id,
          type: av.type,
          active: av.active,
          days: av.days,
          time_ranges: av.time_ranges,
          date_ranges: av.date_ranges,
          slot_duration_minutes: av.slot_duration_minutes,
          valid_from: av.valid_from,
          valid_to: av.valid_to,
        })),
        query_start: start,
        query_end: end,
      });
    }

    if (grouped) {
      const availabilities = await SlotService.generateGroupedSlotsForUser(userId, start, end);
      return successResponse(res, "Available slots retrieved successfully", { availabilities });
    } else {
      const slots = await SlotService.generateAvailableSlotsForUser(userId, start, end);
      return successResponse(res, "Available slots retrieved successfully", { slots });
    }
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

    // Validate that the mentor has availability for this slot
    const startDate = new Date(start_at);
    const endDate = new Date(end_at);

    // Get available slots for the mentor in the requested time range
    const availableSlots = await SlotService.generateAvailableSlotsForUser(
      mentor_id,
      startDate,
      endDate
    );

    // Check if the requested slot exists in the mentor's available slots
    const slotExists = availableSlots.some(slot => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return slotStart.getTime() === startDate.getTime() &&
             slotEnd.getTime() === endDate.getTime();
    });

    if (!slotExists) {
      return errorResponse(res, "Selected slot is not available for this mentor", 400);
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
    if (err.message.includes("conflict") || err.message.includes("past") || err.message.includes("after") || err.message.includes("available")) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
};
