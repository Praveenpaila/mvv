const nodemailer = require("nodemailer");

let cachedTransporter = null;

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      (process.env.SMTP_FROM || process.env.SMTP_USER),
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

async function sendEmail({ to, subject, html, text }) {
  if (!to) return { skipped: true, reason: "missing_to" };
  if (!isEmailConfigured()) {
    // Do not break orders if email isn’t configured
    console.warn("[email] SMTP not configured. Skipping email to:", to);
    return { skipped: true, reason: "not_configured" };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
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

