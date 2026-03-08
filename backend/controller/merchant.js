const Order = require("../model/mkOrder");
const MerchantOrder = require("../model/mkMerchantOrders");
const Delivery = require("../model/mkDelivery");
const DeliveryPerson = require("../model/mkDeliveryPerson");
const { notifyOrderStatusChanged } = require("../utils/orderNotify");

/**
 * Auto-assign a delivery person when all merchants have confirmed.
 * Picks the delivery person with the fewest active (assigned/picked_up/out_for_delivery) deliveries.
 */
async function autoAssignDeliveryPerson(orderId) {
  const deliveryPersons = await DeliveryPerson.find({ isActive: true }).select(
    "_id",
  );
  if (!deliveryPersons.length) return;

  const activeStatuses = ["assigned", "picked_up", "out_for_delivery"];
  let chosenPersonId = null;
  let minActiveCount = Infinity;

  for (const person of deliveryPersons) {
    const activeCount = await Delivery.countDocuments({
      deliveryPerson: person._id,
      status: { $in: activeStatuses },
    });
    if (activeCount < minActiveCount) {
      minActiveCount = activeCount;
      chosenPersonId = person._id;
    }
  }

  if (!chosenPersonId) return;

  const existing = await Delivery.findOne({ orderId });
  if (existing) return;

  await Delivery.create({
    orderId,
    deliveryPerson: chosenPersonId,
    status: "assigned",
  });
}

// MODIFIED FUNCTION: toggleMerchantConfirmation - Toggle checkbox for merchant order
exports.toggleMerchantConfirmation = async (req, res) => {
  try {
    const { merchantOrderId } = req.body;
    const merchantId = req.user.userId;

    // Find merchant's sub-order
    const merchantOrder = await MerchantOrder.findOne({
      _id: merchantOrderId,
      merchantId,
    });
    if (!merchantOrder) {
      return res.status(404).json({
        success: false,
        message: "Merchant order not found",
      });
    }

    // Toggle confirmed checkbox
    merchantOrder.confirmed = !merchantOrder.confirmed;
    await merchantOrder.save();

    // Check if ALL merchants have confirmed (all checkboxes checked)
    const allSubOrders = await MerchantOrder.find({
      orderId: merchantOrder.orderId,
    });
    const totalMerchants = allSubOrders.length;
    const confirmedCount = allSubOrders.filter(
      (mo) => mo.confirmed === true,
    ).length;
    const allConfirmed =
      confirmedCount === totalMerchants && totalMerchants > 0;

    if (allConfirmed) {
      const mainOrderId = merchantOrder.orderId;
      const updatedOrder = await Order.findByIdAndUpdate(
        mainOrderId,
        {
        orderStatus: "confirmed",
        },
        { new: true },
      ).populate("user", "email userName phoneNumber");
      // Auto-assign delivery person when all checkboxes are checked

      await autoAssignDeliveryPerson(mainOrderId);

      await notifyOrderStatusChanged({
        order: updatedOrder,
        previousStatus: "placed",
        userEmail: updatedOrder?.user?.email || updatedOrder?.address?.email || "",
        userName:
          updatedOrder?.user?.userName || updatedOrder?.address?.firstName || "",
        phoneNumber:
          updatedOrder?.address?.phoneNumber || updatedOrder?.user?.phoneNumber || "",
      });
    }

    return res.status(200).json({
      success: true,
      confirmed: merchantOrder.confirmed,
      allConfirmed,
      confirmedCount,
      totalMerchants,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
