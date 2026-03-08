const CategoryModel = require("../model/mkCategory");
const ProductModel = require("../model/mkProduct");
const UserModel = require("../model/mkUser");
const OrderModel = require("../model/mkOrder");
const MerchantOrder = require("../model/mkMerchantOrders");
const AddressModel = require("../model/mkAddress");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const CartModel = require("../model/mkCart");
const path = require("path");
const csv = require("csv-parser");
const {
  notifyOrderPlaced,
  notifyOrderStatusChanged,
} = require("../utils/orderNotify");
const mongoose = require("mongoose");
// bulk
// BASE PROJECT PATH (ENDS WITH /)

// Root folder where mkGold exists
const BASE_IMAGE_DIR = "C:/Users/paila praveen/OneDrive/Desktop/project/";

exports.getProducts = async (req, res) => {
  try {
    res.json({ message: "Products working" });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

exports.bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    const rows = [];
    const errors = [];

    // 🔹 Preload all merchants once (important optimization)
    const merchants = await mongoose.model("mkUser").find({}, "_id");

    if (!merchants.length) {
      return res.status(400).json({
        success: false,
        message: "No merchants found in database",
      });
    }

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];

          try {
            const {
              name,
              description,
              category,
              packSize,
              price,
              mrp,
              discount,
              stock,
              image,
              merchantId,
            } = row;

            if (!name || !category || !packSize || !price || !mrp || !image) {
              throw new Error("Missing required CSV fields");
            }

            // 🔹 Decide merchantId
            let finalMerchantId;

            if (merchantId && mongoose.Types.ObjectId.isValid(merchantId)) {
              finalMerchantId = merchantId;
            } else {
              // Assign random merchant
              const randomIndex = Math.floor(Math.random() * merchants.length);
              finalMerchantId = merchants[randomIndex]._id;
            }

            const relativePath = image.replace(/\\/g, "/");
            const absolutePath = path.join(BASE_IMAGE_DIR, relativePath);

            if (!fs.existsSync(absolutePath)) {
              throw new Error("Image not found");
            }

            const upload = await cloudinary.uploader.upload(absolutePath, {
              folder: "mk-products",
            });

            const imageUrl = upload.secure_url;

            let cat = await CategoryModel.findOne({
              categoryName: category.trim(),
            });

            if (!cat) {
              cat = await CategoryModel.create({
                categoryName: category.trim(),
                image: imageUrl,
              });
            }

            await ProductModel.create({
              name: name.trim(),
              description: description?.trim() || "",
              category: cat._id,
              packSize: packSize.trim(),
              price: Number(price),
              mrp: Number(mrp),
              discount: Number(discount || 0),
              stock: Number(stock || 0),
              image: imageUrl,
              merchantId: finalMerchantId, // ← dynamic
            });
          } catch (err) {
            errors.push({
              product: row.name || "unknown",
              error: err.message,
            });
          }
        }

        fs.unlinkSync(req.file.path);

        return res.status(201).json({
          success: true,
          total: rows.length,
          failedCount: errors.length,
          errors,
        });
      });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/* ================= HOME ================= */
exports.home = async (req, res) => {
  try {
    const category = await CategoryModel.find();
    // const products = await ProductModel.find();

    return res.status(200).json({
      success: true,
      message: "Products loaded successfully",
      category,
      // products,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.products = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await ProductModel.find({ category: id });

    return res.status(200).json({
      success: true,
      message: "Products loaded successfully",
      products,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= ADD PRODUCT ================= */
exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      packSize,
      price,
      Mrp,
      discount,
      stock,
    } = req.body;

    let imageUrl = "";

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "mk-products",
      });
      imageUrl = upload.secure_url;
      fs.unlinkSync(req.file.path);
    }

    let cat = await CategoryModel.findOne({ categoryName: category });

    if (!cat) {
      cat = await CategoryModel.create({
        categoryName: category,
        image: imageUrl,
      });
    }

    await ProductModel.create({
      name,
      description,
      category: cat._id,
      packSize,
      price,
      mrp: Mrp,
      discount,
      stock,
      image: imageUrl,
      merchantId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// get single productDetails

exports.getSingleProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({
        success: false,
        message: "Product ID is required and must be valid.",
      });
    }
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "error in loading the single product",
    });
  }
};

/* ================= CART ================= */

exports.cart = async (req, res) => {
  try {
    const cart = await CartModel.find({ user: req.user.userId }).populate(
      "productId",
    );

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= ADD / UPDATE CART ================= */
exports.addToCart = async (req, res) => {
  try {
    const { id, quantity } = req.body;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const cartItem = await CartModel.findOne({
      user: req.user.userId,
      productId: id,
    });

    if (cartItem) {
      if (quantity === 0) {
        await CartModel.findByIdAndDelete(cartItem._id);
      } else {
        cartItem.quantity = quantity;
        await cartItem.save();
      }
    } else {
      if (quantity > 0) {
        await CartModel.create({
          user: req.user.userId,
          productId: id,
          quantity,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= PROFILE ================= */
exports.profile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).select("-password");

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= USER ORDERS ================= */
exports.orders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await OrderModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("-__v"); // remove unnecessary field
    console.log("hojlafjl");
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch orders",
    });
  }
};

/* ================= ADMIN ORDERS ================= */
exports.order = async (req, res) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= ADDRESS ================= */
exports.addAddress = async (req, res) => {
  try {
    const { firstName, secondName, email, block, floor, roomNo, phoneNumber } =
      req.body || {};

    // Basic validation + friendly messages
    if (!firstName || !secondName || !email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name and email",
      });
    }

    const toNumber = (value) => {
      const n =
        typeof value === "number" ? value : Number(String(value).trim());
      return Number.isFinite(n) ? n : null;
    };

    const blockNum = toNumber(block);
    if (blockNum === null) {
      return res.status(400).json({
        success: false,
        message: "Block must be a number",
      });
    }

    const floorNum = toNumber(floor);
    if (floorNum === null) {
      return res.status(400).json({
        success: false,
        message: "Floor must be a number",
      });
    }

    const roomNoNum = toNumber(roomNo);
    if (roomNoNum === null) {
      return res.status(400).json({
        success: false,
        message: "Room number must be a number",
      });
    }

    const phoneNum = toNumber(phoneNumber);
    if (phoneNum === null) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain digits only",
      });
    }

    await AddressModel.create({
      user: req.user.userId,
      firstName: String(firstName).trim(),
      secondName: String(secondName).trim(),
      email: String(email).trim(),
      block: blockNum,
      floor: floorNum,
      roomNo: roomNoNum,
      phoneNumber: phoneNum,
    });

    return res.status(200).json({
      success: true,
      message: "Address added",
    });
  } catch (err) {
    // Handle mongoose validation errors nicely
    if (err?.name === "ValidationError" || err?.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Please check your address details and try again",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while saving address",
    });
  }
};

exports.address = async (req, res) => {
  try {
    const address = await AddressModel.find({ user: req.user.userId });

    return res.status(200).json({
      success: true,
      address,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.removeAddress = async (req, res) => {
  try {
    await AddressModel.findByIdAndDelete(req.body.id);

    return res.status(200).json({
      success: true,
      message: "Address removed",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.postOrder = async (req, res) => {
  try {
    const user = req.user.userId;
    const { items, addressId, totalAmount, paymentType } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in cart",
      });
    }

    // 🔹 Build order items snapshot
    const orderItems = {};
    let calculatedTotal = 0;

    for (const i of items) {
      const product = await ProductModel.findById(i._id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.stock < i.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // snapshot at order time
      orderItems[i._id] = {
        name: product.name,
        price: product.price,
        quantity: i.quantity,
        image: product.image,
      };

      // 🔹 calculate total for validation
      calculatedTotal += product.price * i.quantity;

      // 🔹 reduce stock
      product.stock -= i.quantity;
      await product.save();
    }

    const address = await AddressModel.findById(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // ✅ SECURITY: Validate totalAmount matches calculated amount (allow 1% variance for rounding)
    const variance = Math.abs(calculatedTotal - totalAmount) / calculatedTotal;
    if (variance > 0.01) {
      console.warn(
        `[Order] Total mismatch: calculated=${calculatedTotal}, provided=${totalAmount}`,
      );
      return res.status(400).json({
        success: false,
        message: "Order total verification failed",
      });
    }

    const order = await OrderModel.create({
      user,
      items: orderItems,
      address,
      totalAmount: calculatedTotal,
      paymentType,
      paymentStatus: paymentType === "cash" ? "pending" : "pending",
      orderStatus: "placed",
    });
    await CartModel.deleteMany({ user: req.user.userId });

    const userDoc = await UserModel.findById(user).select(
      "email userName phoneNumber",
    );
    await notifyOrderPlaced({
      order,
      userEmail: req.user.email || address?.email || userDoc?.email || "",
      userName: req.user.userName || userDoc?.userName || address?.firstName || "",
      phoneNumber:
        address?.phoneNumber || req.user.phoneNumber || userDoc?.phoneNumber || "",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      totalAmount: order.totalAmount,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.search = async (req, res) => {
  try {
    const { query } = req.params;

    const products = await ProductModel.find({
      name: { $regex: query, $options: "i" },
    }).lean();

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatus = [
      "placed",
      "confirmed",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatus.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Order can only be set to "confirmed" when ALL merchants have checked their checkbox
    if (orderStatus === "confirmed") {
      const merchantOrders = await MerchantOrder.find({ orderId: id });
      if (merchantOrders.length > 0) {
        const allConfirmed = merchantOrders.every(
          (mo) => mo.confirmed === true
        );
        if (!allConfirmed) {
          const confirmedCount = merchantOrders.filter(
            (mo) => mo.confirmed === true
          ).length;
          return res.status(400).json({
            success: false,
            message: `Cannot set to confirmed: only ${confirmedCount} of ${merchantOrders.length} merchants have confirmed. Wait for all merchants to check their confirmation.`,
          });
        }
      }
    }

    // 🔹 decide payment status based on order status
    let paymentStatus;

    if (orderStatus === "delivered") {
      paymentStatus = "paid";
    } else if (orderStatus === "cancelled") {
      paymentStatus = "failed";
    } else {
      paymentStatus = "pending";
    }

    const existingOrder = await OrderModel.findById(id).populate(
      "user",
      "email userName",
    );

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { orderStatus, paymentStatus },
      { new: true },
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const populated =
      existingOrder?.user?.email || existingOrder?.user?.userName
        ? existingOrder
        : await OrderModel.findById(id).populate(
            "user",
            "email userName phoneNumber",
          );

    await notifyOrderStatusChanged({
      order: updatedOrder,
      previousStatus: populated?.orderStatus,
      userEmail: populated?.user?.email || updatedOrder?.address?.email || "",
      userName:
        populated?.user?.userName || updatedOrder?.address?.firstName || "",
      phoneNumber:
        updatedOrder?.address?.phoneNumber || populated?.user?.phoneNumber || "",
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Error updating order status",
    });
  }
};

/* ================= UPDATE PRODUCT (ADMIN) ================= */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category, // optional category name
      packSize,
      price,
      Mrp,
      stock,
    } = req.body;

    let product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Optional: update category if provided as category name
    if (category) {
      let cat = await CategoryModel.findOne({
        categoryName: category.toLowerCase().trim(),
      });

      if (!cat) {
        cat = await CategoryModel.create({
          categoryName: category.toLowerCase().trim(),
          image: product.image,
        });
      }

      product.category = cat._id;
    }

    if (typeof name === "string" && name.trim()) product.name = name.trim();
    if (typeof description === "string")
      product.description = description.trim();
    if (typeof packSize === "string" && packSize.trim())
      product.packSize = packSize.trim();
    if (price !== undefined) product.price = Number(price);
    if (Mrp !== undefined) product.mrp = Number(Mrp);
    if (stock !== undefined) product.stock = Number(stock);

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "mk-products",
      });
      product.image = upload.secure_url;
      fs.unlinkSync(req.file.path);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= DELETE PRODUCT (ADMIN) ================= */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Note: cart / orders keep their own snapshots, so we don't touch them here

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.bulkManage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    const filePath = req.file.path;
    const merchantId = req.user.userId;

    const rows = [];
    const errors = [];
    const notFound = [];
    let updatedCount = 0;

    // ===============================
    // Read CSV
    // ===============================
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          const cleanRow = {};

          Object.keys(row).forEach((key) => {
            const cleanKey = key.trim().replace("\ufeff", "");
            cleanRow[cleanKey] = row[key];
          });

          rows.push(cleanRow);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (!rows.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "CSV is empty",
      });
    }

    // ===============================
    // Process Each Row
    // ===============================
    for (const row of rows) {
      const id = row.id?.trim();
      const price = row.price?.trim();
      const quantity = row.quantity?.trim();

      if (!id || !price || !quantity) {
        errors.push({ row, message: "Missing fields" });
        continue;
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        errors.push({ id, message: "Invalid ObjectId format" });
        continue;
      }

      const parsedPrice = Number(price);
      const parsedQuantity = Number(quantity);

      if (isNaN(parsedPrice) || isNaN(parsedQuantity)) {
        errors.push({ id, message: "Price/Quantity must be numbers" });
        continue;
      }

      // 🔐 Secure update — only update merchant's own product
      const updatedProduct = await ProductModel.findOneAndUpdate(
        {
          _id: id,
          merchantId: merchantId,
        },
        {
          $set: {
            price: parsedPrice,
            stock: parsedQuantity,
          },
        },
        { new: true },
      );

      if (!updatedProduct) {
        notFound.push(id);
        continue;
      }

      updatedCount++;
    }

    // Remove uploaded file
    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: "Bulk update completed",
      updatedCount,
      notFound,
      errors,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getMerchantOrders = async (req, res) => {
  try {
    const merchantId = req.user.userId;

    // Get merchant-specific orders
    const merchantOrders = await MerchantOrder.find({
      merchantId: new mongoose.Types.ObjectId(merchantId),
    })
      .populate("orderId") // get full order details
      .sort({ createdAt: -1 });

    const formattedOrders = merchantOrders.map((mo) => ({
      merchantOrderId: mo._id,
      orderId: mo.orderId?._id,
      items: mo.items,
      merchantTotal: mo.merchantTotal,
      orderStatus: mo.orderId?.orderStatus,
      address: mo.orderId?.address,
      createdAt: mo.createdAt,
      confirmed: mo.confirmed || false,
    }));

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Error loading merchant orders",
    });
  }
};

exports.getMerchantStock = async (req, res) => {
  try {
    const merchantId = req.user.userId;

    // Strict ObjectId matching (prevents casting issues)
    const products = await ProductModel.find({
      merchantId: new mongoose.Types.ObjectId(merchantId),
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load merchant products",
    });
  }
};
