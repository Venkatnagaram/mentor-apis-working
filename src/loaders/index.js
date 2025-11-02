const connectDB = require("../config/db");
const expressLoader = require("./express");

module.exports = async (app) => {
  console.log("🧩 Initializing application loaders...");

  await connectDB();
  console.log("✅ MongoDB Connected");

  await expressLoader(app);
  console.log("✅ Express Initialized");

  console.log("🚀 All loaders initialized successfully");
};
