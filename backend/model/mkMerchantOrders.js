const mongoose = require("mongoose");

const merchantOrderSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mkUser",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mkOrders",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "mkProduct",
          required: true,
        },
        name: String,
        image: String,
        quantity: Number,
        price: Number,
      },
    ],

    merchantTotal: {
      type: Number,
      required: true,
    },

    confirmed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.mkMerchantOrders ||
  mongoose.model("mkMerchantOrders", merchantOrderSchema);
