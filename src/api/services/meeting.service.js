const Meeting = require("../models/Meeting");
const Connection = require("../models/Connection");
const User = require("../models/User");
const mongoose = require("mongoose");
const {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} = require("date-fns");

class MeetingService {
  async checkMeetingConflict(mentorId, menteeId, startAt, endAt) {
    const start = new Date(startAt);
    const end = new Date(endAt);

    const overlapping = await Meeting.findOne({
      $or: [
        {
          mentor_id: mentorId,
          start_at: { $lt: end },
          end_at: { $gt: start },
          status: "scheduled",
        },
        {
          mentee_id: menteeId,
          start_at: { $lt: end },
          end_at: { $gt: start },
          status: "scheduled",
        },
      ],
    }).lean();

    return overlapping !== null;
  }

  async createMeeting(data) {
    const { connection_id, mentor_id, mentee_id, start_at, end_at, duration_minutes } = data;

    if (new Date(start_at) <= new Date()) {
      throw new Error("Cannot book meetings in the past");
    }

    if (new Date(end_at) <= new Date(start_at)) {
      throw new Error("End time must be after start time");
    }

    const mentor = await User.findById(mentor_id).lean();
    const mentee = await User.findById(mentee_id).lean();

    if (!mentor || !mentee) {
      throw new Error("Mentor or mentee not found");
    }

    if (mentor.role !== "mentor") {
      throw new Error("Specified mentor_id must belong to a user with mentor role");
    }

    if (mentee.role !== "mentee") {
      throw new Error("Specified mentee_id must belong to a user with mentee role");
    }

    if (connection_id) {
      const connection = await Connection.findById(connection_id).lean();

      if (!connection) {
        throw new Error("Connection not found");
      }

      if (connection.status !== "accepted") {
        throw new Error("Can only book meetings for accepted connections");
      }

      if (
        connection.mentor_id.toString() !== mentor_id ||
        connection.mentee_id.toString() !== mentee_id
      ) {
        throw new Error("Mentor and mentee must match the connection");
      }
    }

    const hasConflict = await this.checkMeetingConflict(
      mentor_id,
      mentee_id,
      start_at,
      end_at
    );

    if (hasConflict) {
      throw new Error("Selected slot conflicts with an existing meeting");
    }

    const meeting = new Meeting({
      connection_id: connection_id ? new mongoose.Types.ObjectId(connection_id) : undefined,
      mentor_id: new mongoose.Types.ObjectId(mentor_id),
      mentee_id: new mongoose.Types.ObjectId(mentee_id),
      start_at: new Date(start_at),
      end_at: new Date(end_at),
      duration_minutes,
    });

    await meeting.save();
    return meeting.toObject();
  }

  async getMeetingsByUser(userId, filters = {}) {
    try {
      const { status = "scheduled", view, start_date, end_date } = filters;

      const query = {
        $or: [{ mentor_id: userId }, { mentee_id: userId }],
        status,
      };

      let dateRange = {};
      if (view === "current_week") {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        dateRange = {
          start_at: {
            $gte: weekStart,
            $lte: weekEnd,
          },
        };
      } else if (view === "weekly" && start_date) {
        const weekStart = startOfWeek(new Date(start_date), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(new Date(start_date), { weekStartsOn: 1 });
        dateRange = {
          start_at: {
            $gte: weekStart,
            $lte: weekEnd,
          },
        };
      } else if (view === "monthly" && start_date) {
        const monthStart = startOfMonth(new Date(start_date));
        const monthEnd = endOfMonth(new Date(start_date));
        dateRange = {
          start_at: {
            $gte: monthStart,
            $lte: monthEnd,
          },
        };
      } else if (view === "custom" && start_date && end_date) {
        dateRange = {
          start_at: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
        };
      }

      if (Object.keys(dateRange).length > 0) {
        Object.assign(query, dateRange);
      }

      const meetings = await Meeting.find(query)
        .populate("mentor_id", "name email profile_picture")
        .populate("mentee_id", "name email profile_picture")
        .populate({
          path: "connection_id",
          select: "status",
        })
        .sort({ start_at: 1 })
        .lean();

      return meetings;
    } catch (error) {
      console.error("Error in getMeetingsByUser:", error);
      throw error;
    }
  }

  async cancelMeeting(meetingId, userId) {
    const meeting = await Meeting.findById(meetingId).lean();

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    if (
      meeting.mentor_id.toString() !== userId &&
      meeting.mentee_id.toString() !== userId
    ) {
      throw new Error("Unauthorized to cancel this meeting");
    }

    if (meeting.status !== "scheduled") {
      throw new Error("Can only cancel scheduled meetings");
    }

    return await Meeting.findByIdAndUpdate(
      meetingId,
      { status: "cancelled", updatedAt: new Date() },
      { new: true }
    ).lean();
  }
}

module.exports = new MeetingService();
