// src/loaders/index.js
const connectDB = require("../config/db");
const expressLoader = require("./express");

module.exports = async (app) => {
  console.log("🧩 Initializing application loaders...");

  // 1️⃣ Connect to MongoDB
  await connectDB();
  console.log("✅ MongoDB Connected");

  // 2️⃣ Initialize Express App (middlewares + routes)
  await expressLoader(app);
  console.log("✅ Express Initialized");

  console.log("🚀 All loaders initialized successfully");
};
