/**
 * Security / Watchman DB connection (separate database, same MongoDB server).
 * Uses MONGO_URL from env; connects to database "watchman".
 * Original security backend lives at security/backend — this integrates it into main backend.
 */
const mongoose = require("mongoose");

let watchmanConnection = null;

const connectWatchmanDb = async () => {
  try {
    const raw = (process.env.MONGO_URL || "mongodb://localhost:27017/").trim().replace(/\/+$/, "");
    const parts = raw.split("/");
    const base = parts.length > 3 ? parts.slice(0, -1).join("/") : raw;
    const uri = base + "/watchman";
    watchmanConnection = mongoose.createConnection(uri);
    await watchmanConnection.asPromise();
    console.log("Connected to Watchman DB");
    return watchmanConnection;
  } catch (err) {
    console.error("Watchman DB connection error:", err);
    throw err;
  }
};

const getWatchmanConnection = () => watchmanConnection;

module.exports = { connectWatchmanDb, getWatchmanConnection };
