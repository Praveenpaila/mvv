const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadPath = "uploads/";

// ✅ Ensure uploads folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// ✅ Optional: file filter - allows both CSV and image files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = [".csv", ".jpg", ".jpeg", ".png", ".gif", ".webp"];
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV and image files are allowed"), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
});
