const express = require("express");
const { createOrder } = require("../controller/order");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Mounted at /api in server.js, so final path is:
// POST /api/orders
router.post("/order", auth, createOrder);

module.exports = router;
