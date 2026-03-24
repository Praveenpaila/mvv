const Product = require("../model/mkProduct");
const Address = require("../model/mkAddress");
const Order = require("../model/mkOrder");
const CartModel = require("../model/mkCart");
const MerchantOrder = require("../model/mkMerchantOrders");
const mongoose = require("mongoose");
const { notifyOrderPlaced } = require("../utils/orderNotify");

exports.createOrder = async (req, res) => {
  try {
    const { items, addressId, paymentType } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart empty" });
    }

    if (!["cash", "online"].includes(paymentType)) {
      return res.status(400).json({ message: "Invalid payment type" });
    }

    let totalAmount = 0;
    let validatedItems = [];

    // ===============================
    // Validate & Prepare Order Items
    // ===============================
    const normalizedItems = items.map((item) => ({
      productId: item._id || item.productId,
      quantity: Number(item.quantity),
    }));

    for (const item of normalizedItems) {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
    }

    const productIds = normalizedItems.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId.toString());

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (!product.merchantId) {
        return res
          .status(500)
          .json({ message: "Product has no merchant assigned" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      totalAmount += product.price * item.quantity;

      validatedItems.push({
        productId: product._id,
        merchantId: product.merchantId,
        name: product.name,
        image: product.image,
        quantity: Number(item.quantity),
        price: Number(product.price),
      });
    }

    // Deduct stock in bulk for speed and consistency
    const bulkOps = normalizedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    const bulkResult = await Product.bulkWrite(bulkOps, { ordered: false });
    if (bulkResult.modifiedCount !== normalizedItems.length) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // ===============================
    // Validate Address
    // ===============================
    const address = await Address.findById(addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // ===============================
    // Create Main Order
    // ===============================
    const order = await Order.create({
      user: userId,
      items: validatedItems,
      address: {
        firstName: address.firstName || "",
        secondName: address.secondName || "",
        email: address.email || "",
        block: address.block || 0,
        floor: address.floor || 0,
        roomNo: address.roomNo || 0,
        phoneNumber: address.phoneNumber || 0,
      },
      paymentType: paymentType.toLowerCase(),
      paymentStatus: "pending",
      orderStatus: "placed",
      totalAmount,
    });

    // ===============================
    // Clear Cart
    // ===============================
    await CartModel.deleteMany({ user: userId });

    // ===============================
    // Split Items Per Merchant
    // ===============================
    const merchantMap = {};

    validatedItems.forEach((item) => {
      const merchantId = item.merchantId.toString();

      if (!merchantMap[merchantId]) {
        merchantMap[merchantId] = {
          items: [],
          total: 0,
        };
      }

      merchantMap[merchantId].items.push({
        productId: item.productId,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      });

      merchantMap[merchantId].total += item.price * item.quantity;
    });

    // ===============================
    // Create Merchant Orders
    // ===============================
    for (const merchantId in merchantMap) {
      await MerchantOrder.create({
        merchantId: new mongoose.Types.ObjectId(merchantId),
        orderId: order._id,
        items: merchantMap[merchantId].items,
        merchantTotal: merchantMap[merchantId].total,
      });
    }

    notifyOrderPlaced({
      order,
      userEmail: req.user.email || address.email,
      userName: req.user.userName || address.firstName,
      phoneNumber: order?.address?.phoneNumber || req.user.phoneNumber,
    }).catch((err) => {
      console.warn("ORDER NOTIFY ERROR:", err?.message || err);
    });

    return res.status(201).json({
      success: true,
      orderId: order._id,
      totalAmount,
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Order failed",
      error: err.message,
    });
  }
};
