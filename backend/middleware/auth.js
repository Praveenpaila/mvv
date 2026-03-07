const jwt = require("jsonwebtoken");
require("dotenv").config();

const KEY = process.env.KEY;

exports.auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }
    const decoded = jwt.verify(token, KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

// NEW: Admin role middleware
exports.admin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  }
  next();
};

// NEW: Delivery role middleware
exports.delivery = (req, res, next) => {
  if (req.user.role !== "deliveryPerson") {
    return res
      .status(403)
      .json({ success: false, message: "Delivery access required" });
  }
  next();
};
