exports.admin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (req.user.role === "admin") {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Error occurred in admin middleware",
    });
  }
};
