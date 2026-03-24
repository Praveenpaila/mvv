const rateLimit = require("express-rate-limit");

const windowMs =
  Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const max = Number(process.env.AUTH_RATE_LIMIT_MAX) || 100;

const authRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

module.exports = { authRateLimiter };

