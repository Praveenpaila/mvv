const express = require("express");
const router = express.Router();
const {
  assignDelivery,
  getMyDeliveries,
  updateDeliveryStatus,
  getDeliveryPersons,
  addDeliveryPerson,
  getOrderDeliveryStatus,
  getMyProfile,
  updateMyProfile,
} = require("../controller/delivery");
const { auth, admin, delivery } = require("../middleware/auth");

// Delivery routes
router.get("/persons", auth, admin, getDeliveryPersons); // Get all delivery persons (admin only)
router.post("/persons", auth, admin, addDeliveryPerson); // Add new delivery person (admin only)
router.get("/order/:orderId", auth, admin, getOrderDeliveryStatus); // Check order delivery status (admin only)
router.post("/assign", auth, admin, assignDelivery); // Admin assigns delivery
router.get("/my", auth, delivery, getMyDeliveries); // Get deliveries for logged-in delivery person
router.get("/profile", auth, delivery, getMyProfile); // Get delivery person's own profile
router.put("/profile", auth, delivery, updateMyProfile); // Update delivery person's own profile
router.put("/:id", auth, delivery, updateDeliveryStatus); // Delivery user updates status

module.exports = router;
