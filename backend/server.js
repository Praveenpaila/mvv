const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const hpp = require("hpp");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRouter = require("./routes/auth");
const productRouter = require("./routes/product");
const { connectWatchmanDb } = require("./config/watchmanDb");
const { isSmsConfigured } = require("./utils/sms");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const PORT = Number(process.env.PORT) || 3000;
const MongoURL = process.env.MONGO_URL;
const JWT_KEY = process.env.KEY;

if (!MongoURL) {
  console.error("Error: MONGO_URL is not defined in environment variables");
  process.exit(1);
}

if (!JWT_KEY) {
  console.error("Error: KEY (JWT secret) is not defined in environment variables");
  process.exit(1);
}

const app = express();
const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  // Needed for req.secure + correct client IPs behind a reverse proxy (nginx, render, etc.)
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(
  helmet({
    // API server; CSP is usually enforced at the frontend/reverse-proxy layer
    contentSecurityPolicy: false,
    // Avoid breaking cross-origin embedding in some deployments (set explicitly if needed)
    crossOriginEmbedderPolicy: false,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: isProd ? { maxAge: 15552000, includeSubDomains: true } : false,
  }),
);
app.use(hpp());
app.use(compression());

// Request logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const parseEnvList = (value) =>
  String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

// CORS configuration (set CORS_ORIGINS in production)
const corsOriginsFromEnv = parseEnvList(process.env.CORS_ORIGINS);
const devOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3000",
  "http://localhost:8081",
];

const allowedOrigins =
  corsOriginsFromEnv.length > 0
    ? corsOriginsFromEnv
    : process.env.NODE_ENV === "production"
      ? null
      : devOrigins;

if (process.env.NODE_ENV === "production" && !allowedOrigins) {
  console.error(
    "Error: CORS_ORIGINS must be set in production (comma-separated list).",
  );
  process.exit(1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      if (allowedOrigins && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const err = new Error("Not allowed by CORS");
      err.statusCode = 403;
      return callback(err);
    },
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    limit: process.env.JSON_LIMIT || "1mb",
  }),
);

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

app.get("/health", (req, res) => {
  res.status(200).json({ success: true });
});

// Security / Watchman (same as security backend) — mounted after Watchman DB is connected
// app.use("/api/watchman", watchmanRoutes) is added in startup below

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

    // Keep error handlers last so dynamically-mounted routes still work
    app.use(notFound);
    app.use(errorHandler);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
