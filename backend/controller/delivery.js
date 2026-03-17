const Order = require("../model/mkOrder");
const Delivery = require("../model/mkDelivery");
const DeliveryPerson = require("../model/mkDeliveryPerson");
const User = require("../model/mkUser");
const bcryptjs = require("bcryptjs");
const { notifyOrderStatusChanged } = require("../utils/orderNotify");
const { parsePagination } = require("../utils/pagination");

// NEW CONTROLLER: getDeliveryPersons - Get all active delivery persons (Admin Only)
exports.getDeliveryPersons = async (req, res) => {
  try {
    const deliveryPersons = await DeliveryPerson.find({ isActive: true })
      .select("_id name email phoneNumber vehicleNumber")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      deliveryPersons,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// NEW CONTROLLER: addDeliveryPerson - Add a new delivery person (Admin Only). Creates User + DeliveryPerson so they can log in.
exports.addDeliveryPerson = async (req, res) => {
  try {
    const { name, email, phoneNumber, vehicleNumber, password } = req.body;

    if (!name || !email || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone number are required",
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email or phone number already exists",
      });
    }

    const existingDP = await DeliveryPerson.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingDP) {
      return res.status(400).json({
        success: false,
        message: "A delivery person with this email or phone number already exists",
      });
    }

    const plainPassword = password && String(password).trim() ? password : "Delivery123";
    const hashedPassword = await bcryptjs.hash(plainPassword, 10);

    const userName = email.toLowerCase().replace(/@.*$/, "").replace(/[^a-z0-9]/g, "") || "dp";
    const uniqueUserName = await (async () => {
      let base = userName;
      let n = 0;
      while (await User.findOne({ userName: base })) {
        base = userName + (n += 1);
      }
      return base;
    })();

    const user = await User.create({
      userName: uniqueUserName,
      email: email.trim().toLowerCase(),
      phoneNumber: String(phoneNumber).trim(),
      password: hashedPassword,
      role: "deliveryPerson",
    });

    const deliveryPerson = await DeliveryPerson.create({
      userId: user._id,
      name: name.trim(),
      email: user.email,
      phoneNumber: user.phoneNumber,
      vehicleNumber: (vehicleNumber && String(vehicleNumber).trim()) || "",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      deliveryPerson,
      message: "Delivery person added. They can log in with email and the set password.",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number already exists",
      });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

// NEW CONTROLLER: getOrderDeliveryStatus - Check if order has delivery assigned
exports.getOrderDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const delivery = await Delivery.findOne({ orderId })
      .populate("deliveryPerson", "name email phoneNumber");

    // Also check merchant order confirmation status
    const MerchantOrder = require("../model/mkMerchantOrders");
    const merchantOrders = await MerchantOrder.find({ orderId })
      .populate("merchantId", "userName");
    
    const merchantStatus = merchantOrders.map((mo) => ({
      merchantId: mo.merchantId?._id,
      merchantName: mo.merchantId?.userName || "Merchant",
      confirmed: mo.confirmed || false,
    }));

    const allConfirmed = merchantOrders.every(
      (mo) => mo.confirmed === true
    );
    const confirmedCount = merchantOrders.filter(
      (mo) => mo.confirmed === true
    ).length;

    // Populate delivery person name if delivery exists
    let populatedDelivery = null;
    if (delivery) {
      populatedDelivery = await Delivery.findById(delivery._id)
        .populate("deliveryPerson", "name email phoneNumber");
    }

    return res.status(200).json({
      success: true,
      delivery: populatedDelivery || null,
      merchantStatus,
      allMerchantsConfirmed: allConfirmed,
      confirmedCount,
      totalMerchants: merchantOrders.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// NEW CONTROLLER: assignDelivery (Admin Only)
exports.assignDelivery = async (req, res) => {
  try {
    const { orderId, deliveryPersonId } = req.body;
    // Only allow if orderStatus === "confirmed"
    const order = await Order.findById(orderId);
    if (!order || order.orderStatus !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Order not confirmed or not found",
      });
    }

    // Check if all merchant orders are confirmed
    const MerchantOrder = require("../model/mkMerchantOrders");
    const merchantOrders = await MerchantOrder.find({ orderId });
    if (merchantOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No merchant orders found for this order",
      });
    }
    const allMerchantsConfirmed = merchantOrders.every(
      (mo) => mo.confirmed === true
    );
    if (!allMerchantsConfirmed) {
      const confirmedCount = merchantOrders.filter(
        (mo) => mo.confirmed === true
      ).length;
      return res.status(400).json({
        success: false,
        message: `Only ${confirmedCount} of ${merchantOrders.length} merchants have confirmed. Please wait for all merchants to confirm.`,
      });
    }
    // Check if delivery person exists and is active
    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      isActive: true,
    });
    if (!deliveryPerson) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive delivery person",
      });
    }
    // Check if delivery already exists for this order
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: "Delivery already assigned to this order",
      });
    }
    // Create mkDelivery document
    const delivery = await Delivery.create({
      orderId,
      deliveryPerson: deliveryPersonId,
      status: "assigned",
    });
    return res.status(200).json({
      success: true,
      delivery,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// NEW CONTROLLER: getMyDeliveries - Get deliveries for logged-in delivery person
exports.getMyDeliveries = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find delivery person linked to this user
    const deliveryPerson = await DeliveryPerson.findOne({ userId });
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      });
    }

    const filter = { deliveryPerson: deliveryPerson._id };
    const status = req.query?.status;
    if (status && status !== "all") {
      const validStatuses = ["assigned", "picked_up", "out_for_delivery", "delivered"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter",
        });
      }
      filter.status = status;
    }

    const from = req.query?.from ? new Date(req.query.from) : null;
    const to = req.query?.to ? new Date(req.query.to) : null;
    if ((from && !Number.isNaN(from.getTime())) || (to && !Number.isNaN(to.getTime()))) {
      filter.createdAt = {};
      if (from && !Number.isNaN(from.getTime())) filter.createdAt.$gte = from;
      if (to && !Number.isNaN(to.getTime())) filter.createdAt.$lte = to;
    }

    const { paginating, page, skip, limit } = parsePagination(req.query);
    const total = await Delivery.countDocuments(filter);

    // Get deliveries assigned to this delivery person
    let query = Delivery.find(filter)
      .populate("deliveryPerson", "name email phoneNumber vehicleNumber")
      .populate({
        path: "orderId",
        populate: [
          {
            path: "user",
            select: "userName email phoneNumber",
          },
          {
            path: "items.merchantId",
            select: "userName",
          },
        ],
      })
      .sort({ createdAt: -1 });

    if (paginating) query = query.skip(skip).limit(limit);

    const deliveries = await query;

    const statusCounts = await Delivery.aggregate([
      { $match: { deliveryPerson: deliveryPerson._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statsByStatus = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    const active =
      (statsByStatus.assigned || 0) +
      (statsByStatus.picked_up || 0) +
      (statsByStatus.out_for_delivery || 0);
    const completed = statsByStatus.delivered || 0;
    const totalAssigned = Object.values(statsByStatus).reduce(
      (sum, c) => sum + c,
      0,
    );

    return res.status(200).json({
      success: true,
      deliveries,
      total,
      filters: {
        status: status || "all",
        from: req.query?.from || null,
        to: req.query?.to || null,
      },
      pagination: paginating
        ? (() => {
            const totalPages = Math.max(Math.ceil(total / limit), 1);
            return {
              page,
              limit,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            };
          })()
        : null,
      stats: {
        total: totalAssigned,
        active,
        completed,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// NEW CONTROLLER: getMyProfile - Get delivery person's own profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deliveryPerson = await DeliveryPerson.findOne({ userId });
    
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      deliveryPerson,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// NEW CONTROLLER: updateMyProfile - Update delivery person's own profile
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phoneNumber, vehicleNumber, isActive } = req.body;

    const deliveryPerson = await DeliveryPerson.findOne({ userId });
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      });
    }

    // Update allowed fields
    if (name !== undefined) deliveryPerson.name = name;
    if (phoneNumber !== undefined) deliveryPerson.phoneNumber = phoneNumber;
    if (vehicleNumber !== undefined) deliveryPerson.vehicleNumber = vehicleNumber;
    if (isActive !== undefined) deliveryPerson.isActive = isActive;

    await deliveryPerson.save();

    return res.status(200).json({
      success: true,
      deliveryPerson,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

// NEW CONTROLLER: updateDeliveryStatus (PUT /delivery/:id)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Find delivery person linked to this user
    const deliveryPerson = await DeliveryPerson.findOne({ userId });
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      });
    }

    // Validate status
    const validStatuses = ["assigned", "picked_up", "out_for_delivery", "delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Only allow delivery user to update their assigned delivery
    const delivery = await Delivery.findOne({
      _id: id,
      deliveryPerson: deliveryPerson._id,
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found or not assigned to you",
      });
    }

    // Validate status transition
    const statusFlow = {
      assigned: ["picked_up"],
      picked_up: ["out_for_delivery"],
      out_for_delivery: ["delivered"],
      delivered: [],
    };

    if (!statusFlow[delivery.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${delivery.status} to ${status}`,
      });
    }

    const previousStatus = delivery.status;
    delivery.status = status;
    await delivery.save();

    // If delivered, update mkOrders.orderStatus = "delivered"
    let updatedOrder = await Order.findById(delivery.orderId).populate(
      "user",
      "email userName phoneNumber",
    );

    if (status === "delivered") {
      updatedOrder = await Order.findByIdAndUpdate(delivery.orderId, {
        orderStatus: "delivered",
      }, { new: true }).populate("user", "email userName phoneNumber");
    }

    const orderForNotification = updatedOrder
      ? {
          ...updatedOrder.toObject(),
          orderStatus: status,
        }
      : { _id: delivery.orderId, orderStatus: status, address: {} };

    await notifyOrderStatusChanged({
      order: orderForNotification,
      previousStatus,
      userEmail:
        updatedOrder?.user?.email || updatedOrder?.address?.email || "",
      userName:
        updatedOrder?.user?.userName || updatedOrder?.address?.firstName || "",
      phoneNumber:
        updatedOrder?.address?.phoneNumber || updatedOrder?.user?.phoneNumber || "",
    });

    return res.status(200).json({
      success: true,
      delivery,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
