const CategoryModel = require("../model/mkCategory");
const ProductModel = require("../model/mkProduct");
const UserModel = require("../model/mkUser");
const OrderModel = require("../model/mkOrder");
const AddressModel = require("../model/mkAddress");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const CartModel = require("../model/mkCart");
const path = require("path");
const csv = require("csv-parser");
// bulk

// BASE PROJECT PATH (ENDS WITH /)

// Root folder where mkGold exists
const BASE_IMAGE_DIR = "C:/Users/paila praveen/OneDrive/Desktop/project/";

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

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        console.log(`CSV rows loaded: ${rows.length}`);

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
            } = row;

            // 🔴 STRICT VALIDATION (matches schema)
            if (!name || !category || !packSize || !price || !mrp || !image) {
              throw new Error("Missing required CSV fields");
            }

            // mkGold/products/apple.png
            const relativePath = image.replace(/\\/g, "/");
            const absolutePath = path.join(BASE_IMAGE_DIR, relativePath);

            if (!fs.existsSync(absolutePath)) {
              throw new Error(`Image not found`);
            }

            // 🔹 Upload image to Cloudinary
            const upload = await cloudinary.uploader.upload(absolutePath, {
              folder: "mk-products",
            });

            const imageUrl = upload.secure_url;

            // 🔹 Find or create category
            let cat = await CategoryModel.findOne({
              categoryName: category.trim(),
            });

            if (!cat) {
              cat = await CategoryModel.create({
                categoryName: category.trim(),
                image: imageUrl, // first product image
              });
            }

            // 🔹 Create product USING CSV DATA
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
            });

            if ((i + 1) % 10 === 0) {
              console.log(`Uploaded ${i + 1}/${rows.length}`);
            }
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
    const product = await ProductModel.findById(id);
    return res.status(200).json({
      sucess: true,
      product,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err || "error in loading the single product",
    });
  }
};

/* ================= CART ================= */

exports.cart = async (req, res) => {
  try {
    const cart = await CartModel.find({ user: req.user.userId });
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
    const cartItem = await CartModel.findOne({
      user: req.user.userId,
      productId: id,
    });

    if (cartItem) {
      if (quantity === 0) {
        await CartModel.findByIdAndDelete(cartItem._id);
      } else {
        await CartModel.findByIdAndUpdate(
          cartItem._id,
          { quantity },
          { new: true },
        );
      }
    } else {
      if (quantity > 0) {
        await CartModel.create({
          user: req.user.userId,
          productId: id,
          quantity,
          image: product.image,
          price: product.price,
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
      message: err.message || "Error updating cart",
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
      user,
    });
  }
};

/* ================= USER ORDERS ================= */
exports.orders = async (req, res) => {
  try {
    const orders = await OrderModel.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 }); // latest first
    // const orders = await OrderModel.find();
    return res.status(200).json({
      success: true,
      // user: req.user.userId,
      count: orders.length,
      orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
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
    await AddressModel.create({
      user: req.user.userId,
      ...req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Address added",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
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

    const order = await OrderModel.create({
      user,
      items: orderItems,
      address,
      totalAmount,
      paymentType,
      paymentStatus: paymentType === "cash" ? "pending" : "paid",
    });
    await CartModel.deleteMany({ user: req.user.userId });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
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
    const all = await ProductModel.find();
    const products = all.filter((i) =>
      i.name.toLowerCase().includes(query.toLowerCase()),
    );

    // const filtered = products.filter((item) =>
    //   item.name.toLowerCase().includes(query.toLowerCase()),
    // );
    res.status(200).json({
      success: true,
      products,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err || "error occured at search",
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

    // 🔹 decide payment status based on order status
    let paymentStatus;

    if (orderStatus === "delivered") {
      paymentStatus = "paid";
    } else if (orderStatus === "cancelled") {
      paymentStatus = "failed";
    } else {
      paymentStatus = "pending";
    }

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
