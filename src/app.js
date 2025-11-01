require("dotenv").config();
const express = require("express");
const loaders = require("./loaders");

const app = express();

(async () => {
  await loaders(app);
})();

module.exports = app;
