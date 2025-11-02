// server.js
require("dotenv").config();
const express = require("express");
const loaders = require("./src/loaders");

const app = express();
const PORT = process.env.PORT || 5001;

(async () => {
  try {
    await loaders(app);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
})();
