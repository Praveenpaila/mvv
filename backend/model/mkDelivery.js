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

// Indexes for delivery list queries
deliverySchema.index({ deliveryPerson: 1, createdAt: -1 });
deliverySchema.index({ status: 1, createdAt: -1 });
deliverySchema.index({ orderId: 1 });

module.exports =
  mongoose.models.mkDelivery || mongoose.model("mkDelivery", deliverySchema);
