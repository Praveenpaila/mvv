const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    /* ===== USER ===== */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mkUser",
      required: true,
    },

    /* ===== ORDER ITEMS ===== */
    items: {
      type: Object,
    },

    /* ===== ADDRESS (SNAPSHOT) ===== */
    address: {
      type: Object,
    },

    /* ===== PAYMENT ===== */
    paymentType: {
      type: String,
      enum: ["cash", "online"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "paid",
    },

    /* ===== PRICE ===== */
    totalAmount: {
      type: Number,
      required: true,
    },

    /* ===== ORDER STATUS ===== */
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },

    /* ===== DELIVERY ===== */
    deliveryTime: {
      type: String,
      default: "10–20 mins",
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.mkOrders || mongoose.model("mkOrders", orderSchema);
