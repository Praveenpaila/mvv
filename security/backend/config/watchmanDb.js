const mongoose = require("mongoose");

const connectWatchmanDb = async () => {
  try {
    const raw = (process.env.MONGO_URL || "mongodb://localhost:27017/")
      .trim()
      .replace(/\/+$/, "");
    const parts = raw.split("/");
    const base = parts.length > 3 ? parts.slice(0, -1).join("/") : raw;
    const uri = base + "/watchman";
    await mongoose.connect(uri);
    console.log("Connected to Watchman DB");
  } catch (err) {
    console.error("DB connection error:", err);
    throw err;
  }
};

module.exports = connectWatchmanDb;
