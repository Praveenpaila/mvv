const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "mkUser",
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  secondName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  block: {
    type: Number,
    required: true,
  },
  floor: {
    type: Number,
    required: true,
  },
  roomNo: {
    type: Number,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
});

module.exports =
  mongoose.models.mkAddress || mongoose.model("mkAddress", Schema);
