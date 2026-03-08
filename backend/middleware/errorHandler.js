const isHttpErrorStatus = (status) =>
  Number.isInteger(status) && status >= 400 && status <= 599;

// Centralized error handler (keeps response shape stable: { success, message })
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) return;

  const statusCode = isHttpErrorStatus(err?.statusCode)
    ? err.statusCode
    : isHttpErrorStatus(err?.status)
      ? err.status
      : 500;

  const message =
    (typeof err?.message === "string" && err.message.trim()) ||
    "Internal server error";

  if (process.env.NODE_ENV !== "test" && statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

