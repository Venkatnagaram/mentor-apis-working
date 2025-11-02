const rateLimit = {};

const getRateLimiter = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();

    if (!rateLimit[key]) {
      rateLimit[key] = { attempts: 0, resetTime: now + windowMs };
    }

    if (now > rateLimit[key].resetTime) {
      rateLimit[key] = { attempts: 0, resetTime: now + windowMs };
    }

    rateLimit[key].attempts++;

    if (rateLimit[key].attempts > maxAttempts) {
      const resetIn = Math.ceil((rateLimit[key].resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many attempts. Please try again in ${resetIn} seconds.`,
      });
    }

    res.setHeader("X-RateLimit-Remaining", maxAttempts - rateLimit[key].attempts);
    next();
  };
};

module.exports = { getRateLimiter };
