/**
 * Watchman (security) model — uses separate Watchman DB connection.
 * Original security backend: security/backend/model/watchman.js
 */
const mongoose = require("mongoose");
const { getWatchmanConnection } = require("../config/watchmanDb");

const watchmanSchema = new mongoose.Schema({
  username: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: "security" },
});

const conn = getWatchmanConnection();
if (!conn) {
  throw new Error("Watchman DB not initialized. Call connectWatchmanDb() before requiring watchman model.");
}

module.exports = conn.model("Watchman", watchmanSchema);
