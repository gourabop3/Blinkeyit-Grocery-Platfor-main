const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_DB || process.env.MONGO_DB.includes("username:password")) {
      console.warn("⚠️ MongoDB URI not configured properly");
      console.log("📝 Running in development mode without database");
      console.log("💡 To fix: Update MONGO_DB in .env with your actual MongoDB connection string");
      return;
    }
    
    await mongoose.connect(process.env.MONGO_DB);
    console.log(`✅ MongoDB Connected Successfully`);
  } catch (error) {
    console.warn("⚠️ MongoDB Connection Failed:", error.message);
    console.log("📝 Running in development mode without database");
    console.log("💡 Login will not work without a database connection");
    // Continue without database for development
  }
};

module.exports = connectDB;
