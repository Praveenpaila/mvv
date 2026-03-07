const express = require("express");
const { createRazorpayOrder, verifyPayment } = require("../controller/payment");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Mounted at /api/payment in server.js, so final paths are:
// POST /api/payment/create-order
// POST /api/payment/verify
router.post("/create-order", auth, createRazorpayOrder);
router.post("/verify", auth, verifyPayment);

module.exports = router;
