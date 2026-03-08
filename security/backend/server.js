const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const hpp = require("hpp");
require("dotenv").config();

const connectWatchmanDb = require("./config/watchmanDb");
const watchmanRoutes = require("./routes/watchmanRoutes");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 5005;

if (isProd) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

const parseEnvList = (value) =>
  String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const corsOriginsFromEnv = parseEnvList(process.env.CORS_ORIGINS);
const allowedOrigins =
  corsOriginsFromEnv.length > 0
    ? corsOriginsFromEnv
    : isProd
      ? null
      : ["http://localhost:5176", "http://localhost:5173", "http://localhost:5175"];

if (isProd && !allowedOrigins) {
  console.error(
    "Error: CORS_ORIGINS must be set in production (comma-separated list).",
  );
  process.exit(1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins && allowedOrigins.includes(origin)) return callback(null, true);
      const err = new Error("Not allowed by CORS");
      err.statusCode = 403;
      return callback(err);
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: isProd ? { maxAge: 15552000, includeSubDomains: true } : false,
  }),
);
app.use(hpp());
app.use(compression());
app.use(
  express.json({
    limit: process.env.JSON_LIMIT || "1mb",
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.use("/watchman", watchmanRoutes);

// Basic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  const message =
    (typeof err?.message === "string" && err.message.trim()) ||
    "Internal server error";
  if (!isProd || status >= 500) console.error("[error]", err);
  res.status(status).json({ success: false, message });
});

(async () => {
  await connectWatchmanDb();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Watchman backend running on port ${PORT}`);
  });
})().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});
