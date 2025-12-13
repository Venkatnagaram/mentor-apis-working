const AvailabilityRepo = require("../repositories/availability.repository");
const SlotService = require("../services/slot.service");
const MeetingService = require("../services/meeting.service");
const { successResponse, errorResponse } = require("../../utils/responseHelper");
const { convertRequestToUTC, convertResponseFromUTC } = require("../../utils/timezone");

exports.createAvailability = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const timezone = req.timezone;

    const convertedBody = convertRequestToUTC(req.body, timezone);
    const body = { ...convertedBody, user_id: userId };

    const created = await AvailabilityRepo.create(body);
    const response = convertResponseFromUTC(created, timezone);

    return successResponse(res, "Availability created", response, 201);
  } catch (err) {
    next(err);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const timezone = req.timezone;

    const existing = await AvailabilityRepo.findById(id);
    if (!existing) {
      return errorResponse(res, "Availability not found", 404);
    }
    if (existing.user_id.toString() !== userId) {
      return errorResponse(res, "Unauthorized to update this availability", 403);
    }

    const convertedBody = convertRequestToUTC(req.body, timezone);
    const updated = await AvailabilityRepo.update(id, convertedBody);
    const response = convertResponseFromUTC(updated, timezone);

    return successResponse(res, "Availability updated", response);
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
    const timezone = req.timezone;

    const list = await AvailabilityRepo.findByUser(userId);
    const response = convertResponseFromUTC(list, timezone);

    return successResponse(res, "Availabilities retrieved successfully", response);
  } catch (err) {
    next(err);
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const timezone = req.timezone;

    const startInput = req.query.start || (new Date()).toISOString();
    const endInput = req.query.end || (new Date(Date.now() + 7*24*3600*1000)).toISOString();

    const convertedQuery = convertRequestToUTC({ start: startInput, end: endInput }, timezone);
    const start = convertedQuery.start;
    const end = convertedQuery.end;

    const grouped = req.query.grouped === 'true';
    const debug = req.query.debug === 'true';
    const includeStatus = req.query.include_status === 'true';

    if (debug) {
      const avList = await AvailabilityRepo.findByUser(userId);
      const debugResponse = convertResponseFromUTC({
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
      }, timezone);

      return successResponse(res, "Debug info", debugResponse);
    }

    if (includeStatus) {
      const slots = await SlotService.generateAllSlotsWithStatus(userId, start, end);
      const response = convertResponseFromUTC({ slots }, timezone);
      return successResponse(res, "All slots with status retrieved successfully", response);
    } else if (grouped) {
      const availabilities = await SlotService.generateGroupedSlotsForUser(userId, start, end);
      const response = convertResponseFromUTC({ availabilities }, timezone);
      return successResponse(res, "Available slots retrieved successfully", response);
    } else {
      const slots = await SlotService.generateAvailableSlotsForUser(userId, start, end);
      const response = convertResponseFromUTC({ slots }, timezone);
      return successResponse(res, "Available slots retrieved successfully", response);
    }
  } catch (err) {
    next(err);
  }
};

exports.bookMeeting = async (req, res, next) => {
  try {
    const timezone = req.timezone;
    let { connection_id, mentor_id, mentee_id, start_at, end_at, duration_minutes } = req.body;

    if (!start_at || !end_at || !duration_minutes) {
      return errorResponse(res, "Missing required fields: start_at, end_at, duration_minutes", 400);
    }

    const convertedTimes = convertRequestToUTC({ start_at, end_at }, timezone);
    start_at = convertedTimes.start_at;
    end_at = convertedTimes.end_at;

    if (connection_id) {
      const Connection = require("../models/Connection");
      const connection = await Connection.findById(connection_id).lean();

      if (!connection) {
        return errorResponse(res, "Connection not found", 404);
      }

      if (connection.status !== "accepted") {
        return errorResponse(res, "Can only book meetings for accepted connections", 400);
      }

      mentor_id = connection.mentor_id.toString();
      mentee_id = connection.mentee_id.toString();
    } else {
      if (!mentor_id || !mentee_id) {
        return errorResponse(res, "Either connection_id or both mentor_id and mentee_id are required", 400);
      }
    }

    const bookingStart = new Date(start_at);
    const bookingEnd = new Date(end_at);

    const dayStart = new Date(bookingStart);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(bookingStart);
    dayEnd.setHours(23, 59, 59, 999);

    const availableSlots = await SlotService.generateAvailableSlotsForUser(
      mentor_id,
      dayStart,
      dayEnd
    );

    const slotExists = availableSlots.some(slot => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return slotStart.getTime() === bookingStart.getTime() &&
             slotEnd.getTime() === bookingEnd.getTime();
    });

    if (!slotExists) {
      const debugInfo = {
        mentor_id,
        requested_start: start_at,
        requested_end: end_at,
        available_slots_count: availableSlots.length,
        sample_slots: availableSlots.slice(0, 5).map(s => ({ start: s.start, end: s.end }))
      };
      return errorResponse(res, `Selected slot is not available for this mentor. Debug: ${JSON.stringify(debugInfo)}`, 400);
    }

    const meeting = await MeetingService.createMeeting({
      connection_id,
      mentor_id,
      mentee_id,
      start_at,
      end_at,
      duration_minutes,
    });

    const response = convertResponseFromUTC(meeting, timezone);

    return successResponse(res, "Meeting scheduled successfully", response, 201);
  } catch (err) {
    if (err.message.includes("conflict") || err.message.includes("past") || err.message.includes("after") || err.message.includes("available")) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
};
