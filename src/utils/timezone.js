const { utcToZonedTime, zonedTimeToUtc, format } = require('date-fns-tz');
const { parseISO, isValid } = require('date-fns');

const BACKEND_TIMEZONE = process.env.BACKEND_TIMEZONE || 'UTC';
const FRONTEND_TIMEZONE = process.env.FRONTEND_TIMEZONE || 'UTC';

const toUTC = (dateInput, sourceTimezone = null) => {
  try {
    const timezone = sourceTimezone || BACKEND_TIMEZONE;

    let date;
    if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      throw new Error('Invalid date input');
    }

    if (!isValid(date)) {
      throw new Error('Invalid date');
    }

    return zonedTimeToUtc(date, timezone);
  } catch (error) {
    console.error('Error converting to UTC:', error);
    throw new Error('Failed to convert date to UTC');
  }
};

const fromUTC = (dateInput, targetTimezone = null) => {
  try {
    const timezone = targetTimezone || FRONTEND_TIMEZONE;

    let date;
    if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      throw new Error('Invalid date input');
    }

    if (!isValid(date)) {
      throw new Error('Invalid date');
    }

    return utcToZonedTime(date, timezone);
  } catch (error) {
    console.error('Error converting from UTC:', error);
    throw new Error('Failed to convert date from UTC');
  }
};

const formatInTimezone = (dateInput, targetTimezone = null, formatString = "yyyy-MM-dd'T'HH:mm:ssXXX") => {
  try {
    const timezone = targetTimezone || FRONTEND_TIMEZONE;

    let date;
    if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      throw new Error('Invalid date input');
    }

    if (!isValid(date)) {
      throw new Error('Invalid date');
    }

    return format(utcToZonedTime(date, timezone), formatString, { timeZone: timezone });
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    throw new Error('Failed to format date in timezone');
  }
};

const convertObjectDates = (obj, converter, timezone = null) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => convertObjectDates(item, converter, timezone));
  }

  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date) {
      converted[key] = converter(value, timezone);
    } else if (typeof value === 'string' && isISODateString(value)) {
      converted[key] = converter(value, timezone);
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = convertObjectDates(value, converter, timezone);
    } else {
      converted[key] = value;
    }
  }
  return converted;
};

const isISODateString = (str) => {
  if (typeof str !== 'string') return false;
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDateRegex.test(str);
};

const convertRequestToUTC = (data, timezone = null) => {
  return convertObjectDates(data, toUTC, timezone);
};

const convertResponseFromUTC = (data, timezone = null) => {
  return convertObjectDates(data, fromUTC, timezone);
};

const getTimezoneFromRequest = (req) => {
  return req.headers['x-timezone'] ||
         req.query.timezone ||
         req.body.timezone ||
         FRONTEND_TIMEZONE;
};

const isValidTimezone = (timezone) => {
  try {
    format(new Date(), 'z', { timeZone: timezone });
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = {
  toUTC,
  fromUTC,
  formatInTimezone,
  convertRequestToUTC,
  convertResponseFromUTC,
  getTimezoneFromRequest,
  isValidTimezone,
  BACKEND_TIMEZONE,
  FRONTEND_TIMEZONE,
};
