const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mkOrders",
      required: true,
    },
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mkDeliveryPerson",
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "picked_up", "out_for_delivery", "delivered"],
      default: "assigned",
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.mkDelivery || mongoose.model("mkDelivery", deliverySchema);
