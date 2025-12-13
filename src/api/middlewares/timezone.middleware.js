const { getTimezoneFromRequest, isValidTimezone, FRONTEND_TIMEZONE } = require('../../utils/timezone');

const timezoneMiddleware = (req, res, next) => {
  try {
    let timezone = getTimezoneFromRequest(req);

    if (!isValidTimezone(timezone)) {
      console.warn(`Invalid timezone provided: ${timezone}. Falling back to ${FRONTEND_TIMEZONE}`);
      timezone = FRONTEND_TIMEZONE;
    }

    req.timezone = timezone;

    next();
  } catch (error) {
    console.error('Error in timezone middleware:', error);
    req.timezone = FRONTEND_TIMEZONE;
    next();
  }
};

module.exports = timezoneMiddleware;
