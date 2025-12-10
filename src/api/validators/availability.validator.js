const { body, param, query } = require("express-validator");

const timeFormatRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

const validateTimeRange = (value) => {
  if (!Array.isArray(value)) {
    throw new Error("time_ranges must be an array");
  }

  for (const range of value) {
    if (!range.from || !range.to) {
      throw new Error("Each time range must have 'from' and 'to' fields");
    }

    if (!timeFormatRegex.test(range.from) || !timeFormatRegex.test(range.to)) {
      throw new Error("Time must be in HH:mm format (e.g., 09:00, 17:30)");
    }

    const [fromHour, fromMin] = range.from.split(":").map(Number);
    const [toHour, toMin] = range.to.split(":").map(Number);
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;

    if (toMinutes <= fromMinutes) {
      throw new Error(`End time (${range.to}) must be after start time (${range.from})`);
    }
  }

  return true;
};

const validateDays = (value) => {
  const validDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  if (!Array.isArray(value)) {
    throw new Error("days must be an array");
  }

  for (const day of value) {
    if (!validDays.includes(day.toLowerCase())) {
      throw new Error(`Invalid day: ${day}. Must be one of: ${validDays.join(", ")}`);
    }
  }

  return true;
};

const validateDateRanges = (value, { req }) => {
  const type = req.body.type;

  if (type === "date_range" || type === "single_dates") {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(`date_ranges is required for type '${type}'`);
    }

    for (const range of value) {
      if (type === "date_range") {
        if (!range.start_date) {
          throw new Error("start_date is required for date_range type");
        }

        if (range.end_date) {
          const start = new Date(range.start_date);
          const end = new Date(range.end_date);

          if (end < start) {
            throw new Error("end_date must be after or equal to start_date");
          }
        }
      }

      if (type === "single_dates") {
        if (!range.dates || !Array.isArray(range.dates) || range.dates.length === 0) {
          throw new Error("dates array is required for single_dates type");
        }
      }

      if (range.time_ranges) {
        validateTimeRange(range.time_ranges);
      }
    }
  }

  // For weekly type: date_ranges are optional but if provided, validate them
  if (type === "weekly" && value) {
    if (!Array.isArray(value)) {
      throw new Error("date_ranges must be an array");
    }

    for (const range of value) {
      if (!range.start_date) {
        throw new Error("start_date is required for date_ranges in weekly type");
      }

      if (range.end_date) {
        const start = new Date(range.start_date);
        const end = new Date(range.end_date);

        if (end < start) {
          throw new Error("end_date must be after or equal to start_date");
        }
      }

      if (range.time_ranges) {
        validateTimeRange(range.time_ranges);
      }
    }
  }

  return true;
};

exports.createAvailabilityValidation = [
  body("type")
    .isIn(["weekly", "date_range", "single_dates"])
    .withMessage("type must be one of: weekly, date_range, single_dates"),

  body("slot_duration_minutes")
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage("slot_duration_minutes must be between 15 and 180 minutes"),

  body("days")
    .if(body("type").equals("weekly"))
    .custom(validateDays),

  body("time_ranges")
    .if(body("type").equals("weekly"))
    .custom(validateTimeRange),

  body("date_ranges")
    .optional()
    .custom(validateDateRanges),

  body("valid_from")
    .optional()
    .isISO8601()
    .withMessage("valid_from must be a valid date"),

  body("valid_to")
    .optional()
    .isISO8601()
    .withMessage("valid_to must be a valid date")
    .custom((value, { req }) => {
      if (req.body.valid_from && value) {
        const from = new Date(req.body.valid_from);
        const to = new Date(value);
        if (to < from) {
          throw new Error("valid_to must be after valid_from");
        }
      }
      return true;
    }),
];

exports.updateAvailabilityValidation = [
  param("id").isMongoId().withMessage("Invalid availability ID"),
  body("type")
    .optional()
    .isIn(["weekly", "date_range", "single_dates"])
    .withMessage("type must be one of: weekly, date_range, single_dates"),

  body("slot_duration_minutes")
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage("slot_duration_minutes must be between 15 and 180 minutes"),

  body("days").optional().custom(validateDays),

  body("time_ranges").optional().custom(validateTimeRange),

  body("active")
    .optional()
    .isBoolean()
    .withMessage("active must be a boolean"),
];

exports.deleteAvailabilityValidation = [
  param("id").isMongoId().withMessage("Invalid availability ID"),
];

exports.getAvailableSlotsValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID"),
  query("start")
    .optional()
    .isISO8601()
    .withMessage("start must be a valid ISO date"),
  query("end")
    .optional()
    .isISO8601()
    .withMessage("end must be a valid ISO date"),
];

exports.bookMeetingValidation = [
  body("mentor_id")
    .notEmpty()
    .isMongoId()
    .withMessage("mentor_id is required and must be valid"),

  body("mentee_id")
    .notEmpty()
    .isMongoId()
    .withMessage("mentee_id is required and must be valid"),

  body("start_at")
    .notEmpty()
    .isISO8601()
    .withMessage("start_at is required and must be a valid date"),

  body("end_at")
    .notEmpty()
    .isISO8601()
    .withMessage("end_at is required and must be a valid date"),

  body("duration_minutes")
    .notEmpty()
    .isInt({ min: 15, max: 180 })
    .withMessage("duration_minutes is required and must be between 15 and 180"),

  body("connection_id")
    .optional()
    .isMongoId()
    .withMessage("connection_id must be a valid ID if provided"),
];
