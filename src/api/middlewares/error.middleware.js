exports.errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    // Optional: include stack trace only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
