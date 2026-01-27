const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mkCategory",
      required: true,
    },
    description: {
      type: String,
      default:
        "a;kfjlkjdLKJAFM l;kfhajlk ;lgaijkoifjk aflkhjLJFFS;LAFJKFA;VLKAJF;ILIBJSGFAJL",
    },
    packSize: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    mrp: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.mkProduct || mongoose.model("mkProduct", productSchema);
