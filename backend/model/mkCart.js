const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "mkUser",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "mkProduct",
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.models.mkCart || mongoose.model("mkCart", schema);
