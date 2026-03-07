const mongoose = require("mongoose");

const watchmanSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "security" },
});

module.exports = mongoose.model("Watchman", watchmanSchema);
