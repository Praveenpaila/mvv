const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRouter = require("./routes/auth");
const productRouter = require("./routes/product");
const { connectWatchmanDb } = require("./config/watchmanDb");
const { isSmsConfigured } = require("./utils/sms");

const PORT = process.env.PORT;
const MongoURL = process.env.MONGO_URL;

if (!MongoURL) {
  console.error("Error: MONGO_URL is not defined in environment variables");
  process.exit(1);
}

const app = express();

// CORS configuration - allow specific frontend & mobile web origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8081",

  // PC Wi-Fi IP (for mobile browser access)
  "http://172.20.147.117:5173",
  "http://172.20.147.117:3000",
  "http://172.20.147.117:8081",
];

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve deliveryImages as static files
app.use(
  "/deliveryImages",
  express.static(path.join(__dirname, "../deliveryImages")),
);

// Routes
app.use("/api/auth", authRouter);
app.use("/api", productRouter);
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api", require("./routes/orders"));
app.use("/api/delivery", require("./routes/delivery"));

// Security / Watchman (same as security backend) — mounted after Watchman DB is connected
// app.use("/api/watchman", watchmanRoutes) is added in startup below

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

// Connect to MongoDB, then Watchman DB, then mount watchman routes and start server
mongoose
  .connect(MongoURL)
  .then(async () => {
    console.log("Mongoose connected successfully");
    const smsProvider = (process.env.SMS_PROVIDER || "fast2sms").toLowerCase();
    console.log(
      `[sms] provider=${smsProvider} enabled=${String(
        process.env.SMS_ENABLED || "true",
      )} configured=${isSmsConfigured()}`,
    );
    await connectWatchmanDb();
    app.use("/api/watchman", require("./routes/watchmanRoutes"));
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
