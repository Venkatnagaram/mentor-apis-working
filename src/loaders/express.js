const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("../api/routes");
const requestLogger = require("../api/middlewares/requestLogger");
const { errorHandler } = require("../api/middlewares/error.middleware");

module.exports = (app) => {
  app.use(helmet());

  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ limit: "10kb", extended: true }));

  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  app.use(requestLogger);

  app.use("/api", routes);

  app.use(errorHandler);
};
