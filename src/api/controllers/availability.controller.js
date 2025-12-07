// controllers/availability.controller.js
const AvailabilityRepo = require("../repositories/availability.repository");
const SlotService = require("../services/slot.service");
const Meeting = require("../models/Meeting");

exports.createAvailability = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = { ...req.body, user_id: userId };
    const created = await AvailabilityRepo.create(body);
    res.status(201).json({ success: true, message: "Availability created", data: created });
  } catch (err) { next(err); }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updated = await AvailabilityRepo.update(id, req.body);
    res.json({ success: true, message: "Availability updated", data: updated });
  } catch (err) { next(err); }
};

exports.deleteAvailability = async (req, res, next) => {
  try {
    const id = req.params.id;
    await AvailabilityRepo.delete(id);
    res.json({ success: true, message: "Availability deleted" });
  } catch (err) { next(err); }
};

exports.getUserAvailabilities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const list = await AvailabilityRepo.findByUser(userId);
    res.json({ success: true, message: "Availabilities", data: list });
  } catch (err) { next(err); }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const start = req.query.start || (new Date()).toISOString();
    const end = req.query.end || (new Date(Date.now() + 7*24*3600*1000)).toISOString(); // default next 7 days
    const slots = await SlotService.generateAvailableSlotsForUser(userId, start, end);
    res.json({ success: true, message: "Slots", data: { slots }});
  } catch (err) { next(err); }
};

exports.bookMeeting = async (req, res, next) => {
  try {
    const { connection_id, mentor_id, mentee_id, start_at, end_at, duration_minutes } = req.body;
    // basic conflict check: any meeting overlapping for mentor or mentee?
    const overlapping = await Meeting.findOne({
      $or: [{ mentor_id }, { mentee_id }],
      $or: [
        { start_at: { $lt: new Date(end_at) }, end_at: { $gt: new Date(start_at) } }
      ],
      status: "scheduled",
    }).lean();

    if (overlapping) {
      return res.status(409).json({ success: false, message: "Selected slot already booked" });
    }

    const meeting = new Meeting({
      connection_id, mentor_id, mentee_id,
      start_at: new Date(start_at), end_at: new Date(end_at),
      duration_minutes,
    });
    await meeting.save();

    res.status(201).json({ success: true, message: "Meeting scheduled", data: meeting });
  } catch (err) { next(err); }
};
