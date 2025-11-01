const express = require("express");
const cors = require("cors");
const routes = require("../api/routes");
const requestLogger = require("../middlewares/requestLogger");
const { errorHandler } = require("../middlewares/error.middleware");

module.exports = (app) => {
  // Parse JSON requests
  app.use(express.json());

  // Enable CORS for frontend access
  app.use(cors());

  // Log incoming requests
  app.use(requestLogger);

  // Register all routes under /api
  app.use("/api", routes);

  // Global error handler (always at the end)
  app.use(errorHandler);
};
