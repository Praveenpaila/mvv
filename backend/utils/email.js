const nodemailer = require("nodemailer");
const DEFAULT_FROM_EMAIL = "praveenpaila2175@gmail.com";
const DEFAULT_FROM_NAME = "MVV";

let cachedTransporter = null;

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      (process.env.SMTP_FROM || process.env.SMTP_USER || DEFAULT_FROM_EMAIL),
  );
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
}

function resolveFromAddress(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return DEFAULT_FROM_EMAIL;

  // Supports both `email@x.com` and `Name <email@x.com>`.
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim();
}

async function sendEmail({ to, subject, html, text }) {
  if (!to) return { skipped: true, reason: "missing_to" };
  if (!isEmailConfigured()) {
    // Do not break orders if email isn’t configured
    console.warn("[email] SMTP not configured. Skipping email to:", to);
    return { skipped: true, reason: "not_configured" };
  }

  const configuredFrom =
    process.env.SMTP_FROM || process.env.SMTP_USER || DEFAULT_FROM_EMAIL;
  const fromAddress = resolveFromAddress(configuredFrom);
  const from = {
    name: String(process.env.SMTP_FROM_NAME || DEFAULT_FROM_NAME).trim(),
    address: fromAddress,
  };
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  return { skipped: false, messageId: info.messageId };
}

module.exports = { sendEmail, isEmailConfigured };

