const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../model/mkOrder");

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const options = {
      amount: order.totalAmount * 100, // convert to paise
      currency: "INR",
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json(razorpayOrder);
  } catch (err) {
    res.status(500).json({ message: "Razorpay order creation failed" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false });
    }

    await Order.findByIdAndUpdate(orderId, {
      orderStatus: "confirmed",
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
