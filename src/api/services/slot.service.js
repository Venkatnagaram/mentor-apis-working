const { RRule, RRuleSet } = require("rrule");
const { parse, addMinutes, format, isBefore, isAfter, set, eachMinuteOfInterval, isEqual } = require("date-fns");
const AvailabilityRepo = require("../repositories/availability.repository");
const Meeting = require("../models/Meeting");

/**
 * Helper: parse "HH:mm" and return Date object on a baseline date.
 * baselineDate is JS Date for the day we want the slot on.
 */
function timeStringToDate(baselineDate, timeStr) {
  // timeStr: "09:30"
  const [hh, mm] = timeStr.split(":").map(Number);
  return set(baselineDate, { hours: hh, minutes: mm, seconds: 0, milliseconds: 0 });
}

/**
 * Generate slots for a single time range on a given date.
 */
function generateSlotsForRange(dateObj, fromTime, toTime, slotMinutes) {
  const start = timeStringToDate(dateObj, fromTime);
  const end = timeStringToDate(dateObj, toTime);
  const slots = [];
  let cursor = start;

  while (isBefore(addMinutes(cursor, slotMinutes - 0.0001), addMinutes(end, 0))) {
    const slotStart = cursor;
    const slotEnd = addMinutes(slotStart, slotMinutes);
    if (isAfter(slotEnd, end) || isAfter(slotStart, end)) break;
    slots.push({ start: slotStart, end: slotEnd });
    cursor = slotEnd;
  }

  return slots;
}

/**
 * Main function: generate available slots for user between startDate & endDate
 * - respects weekly availabilities and date_ranges
 * - excludes already booked meetings
 */
async function generateAvailableSlotsForUser(userId, startDate, endDate, options = {}) {
  // normalize dates (start at 00:00 and end at 23:59)
  const start = new Date(startDate);
  const end = new Date(endDate);

  const avList = await AvailabilityRepo.findByUser(userId);
  if (!avList || avList.length === 0) return [];

  // fetch meetings for user (as mentor or mentee) in the range to exclude
  const meetings = await Meeting.find({
    $or: [{ mentor_id: userId }, { mentee_id: userId }],
    start_at: { $gte: start, $lte: end },
    status: "scheduled",
  }).lean();

  // store all busy intervals
  const busy = meetings.map(m => ({ start: new Date(m.start_at), end: new Date(m.end_at) }));

  const results = [];

  // iterate each day in the date range
  let currentDay = new Date(start);
  while (currentDay <= end) {
    const dateCopy = new Date(currentDay);
    const weekday = dateCopy.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase().slice(0,3);
    const dateMatches = [];

    for (const av of avList) {
      // check valid_from/to
      if (av.valid_from && dateCopy < new Date(av.valid_from)) continue;
      if (av.valid_to && dateCopy > new Date(av.valid_to)) continue;

      if (av.type === "weekly") {
        if (!av.days || !av.days.includes(weekday)) continue;
        // use av.time_ranges
        const ranges = av.time_ranges || [];
        for (const r of ranges) {
          const slots = generateSlotsForRange(dateCopy, r.from, r.to, av.slot_duration_minutes || 30);
          dateMatches.push(...slots);
        }
      } else if (av.type === "date_range") {
        for (const dr of av.date_ranges || []) {
          // if day falls within start_date..end_date
          const s = new Date(dr.start_date);
          const e = dr.end_date ? new Date(dr.end_date) : new Date(dr.start_date);
          if (dateCopy < s || dateCopy > e) continue;
          const ranges = dr.time_ranges || [];
          for (const r of ranges) {
            const slots = generateSlotsForRange(dateCopy, r.from, r.to, av.slot_duration_minutes || 30);
            dateMatches.push(...slots);
          }
        }
      } else if (av.type === "single_dates") {
        for (const dr of av.date_ranges || []) {
          const found = (dr.dates || []).some(d => {
            const a = new Date(d); return a.toDateString() === dateCopy.toDateString();
          });
          if (!found) continue;
          const ranges = dr.time_ranges || [];
          for (const r of ranges) {
            const slots = generateSlotsForRange(dateCopy, r.from, r.to, av.slot_duration_minutes || 30);
            dateMatches.push(...slots);
          }
        }
      }
    } // end availabilities loop

    // filter out slots that overlap busy meetings
    const freeSlots = dateMatches.filter(slot => {
      for (const b of busy) {
        // if overlap
        if (!(slot.end <= b.start || slot.start >= b.end)) {
          return false;
        }
      }
      return true;
    });

    // convert to plain object
    for (const s of freeSlots) {
      results.push({
        start: s.start.toISOString(),
        end: s.end.toISOString(),
      });
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  return results;
}

/**
 * Generate slots grouped by availability configuration
 * Returns slots organized by how they were created (weekly, date_range, single_dates)
 */
async function generateGroupedSlotsForUser(userId, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const avList = await AvailabilityRepo.findByUser(userId);
  if (!avList || avList.length === 0) return [];

  const meetings = await Meeting.find({
    $or: [{ mentor_id: userId }, { mentee_id: userId }],
    start_at: { $gte: start, $lte: end },
    status: "scheduled",
  }).lean();

  const busy = meetings.map(m => ({ start: new Date(m.start_at), end: new Date(m.end_at) }));

  const groupedResults = [];

  for (const av of avList) {
    const availabilitySlots = [];

    let currentDay = new Date(start);
    while (currentDay <= end) {
      const dateCopy = new Date(currentDay);
      const weekday = dateCopy.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase().slice(0,3);

      if (av.valid_from && dateCopy < new Date(av.valid_from)) {
        currentDay.setDate(currentDay.getDate() + 1);
        continue;
      }
      if (av.valid_to && dateCopy > new Date(av.valid_to)) {
        currentDay.setDate(currentDay.getDate() + 1);
        continue;
      }

      let daySlots = [];

      if (av.type === "weekly") {
        if (av.days && av.days.includes(weekday)) {
          const ranges = av.time_ranges || [];
          for (const r of ranges) {
            const slots = generateSlotsForRange(dateCopy, r.from, r.to, av.slot_duration_minutes || 30);
            daySlots.push(...slots);
          }
        }
      } else if (av.type === "date_range") {
        for (const dr of av.date_ranges || []) {
          const s = new Date(dr.start_date);
          const e = dr.end_date ? new Date(dr.end_date) : new Date(dr.start_date);
          if (dateCopy >= s && dateCopy <= e) {
            const ranges = dr.time_ranges || [];
            for (const r of ranges) {
              const slots = generateSlotsForRange(dateCopy, r.from, r.to, av.slot_duration_minutes || 30);
              daySlots.push(...slots);
            }
          }
        }
      } else if (av.type === "single_dates") {
        for (const dr of av.date_ranges || []) {
          const found = (dr.dates || []).some(d => {
            const a = new Date(d);
            return a.toDateString() === dateCopy.toDateString();
          });
          if (found) {
            const ranges = dr.time_ranges || [];
            for (const r of ranges) {
              const slots = generateSlotsForRange(dateCopy, r.from, r.to, av.slot_duration_minutes || 30);
              daySlots.push(...slots);
            }
          }
        }
      }

      const freeSlots = daySlots.filter(slot => {
        for (const b of busy) {
          if (!(slot.end <= b.start || slot.start >= b.end)) {
            return false;
          }
        }
        return true;
      });

      for (const s of freeSlots) {
        availabilitySlots.push({
          start: s.start.toISOString(),
          end: s.end.toISOString(),
          date: s.start.toISOString().split('T')[0],
        });
      }

      currentDay.setDate(currentDay.getDate() + 1);
    }

    if (availabilitySlots.length > 0) {
      groupedResults.push({
        availability_id: av._id.toString(),
        type: av.type,
        days: av.days,
        time_ranges: av.time_ranges,
        date_ranges: av.date_ranges,
        slot_duration_minutes: av.slot_duration_minutes,
        valid_from: av.valid_from,
        valid_to: av.valid_to,
        active: av.active,
        slots: availabilitySlots,
        total_slots: availabilitySlots.length,
      });
    }
  }

  return groupedResults;
}

module.exports = {
  generateAvailableSlotsForUser,
  generateGroupedSlotsForUser,
};
