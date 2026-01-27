const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRouter = require("./routes/auth");
const productRouter = require("./routes/product");
require("dotenv").config();

const PORT = process.env.PORT;
const MongoURL = process.env.MONGO_URL;

if (!MongoURL) {
  console.error("Error: MONGO_URL is not defined in environment variables");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(MongoURL)
  .then(() => {
    console.log("Mongoose connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/", productRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});
app.get("/health", (req, res) => {
  res.status(200).json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
