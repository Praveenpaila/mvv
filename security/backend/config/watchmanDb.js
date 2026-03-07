const mongoose = require("mongoose");

const connectWatchmanDb = async () => {
  try {
    MONGO_URL="mongodb://172.18.210.62:27017/"
// ////
    await mongoose.connect("mongodb://172.18.210.62:27017/watchman");
    console.log("Connected to Watchman DB");
  } catch (err) {
    console.error("DB connection error:", err);
  }
};

module.exports = connectWatchmanDb;
