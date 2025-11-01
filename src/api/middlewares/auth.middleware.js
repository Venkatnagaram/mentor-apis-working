const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    // Allow token to be passed in either Authorization header or cookies
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token expired. Please login again."
        : "Invalid token.";
    return res.status(403).json({ success: false, message });
  }
};
