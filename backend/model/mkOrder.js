const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "mkProduct",
    required: true,
  },

  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "mkUser",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    /* ===== USER ===== */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mkUser",
      required: true,
    },

    /* ===== ORDER ITEMS ===== */
    items: [orderItemSchema], // ← IMPORTANT FIX

    /* ===== ADDRESS (SNAPSHOT) ===== */
    address: {
      firstName: String,
      secondName: String,
      email: String,
      block: Number,
      floor: Number,
      roomNo: Number,
      phoneNumber: Number,
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
