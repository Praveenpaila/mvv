const axios = require("axios");

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function normalizeIndianNumber(phone) {
  let digits = normalizePhone(phone);
  if (!digits) return "";

  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0"))
    return `91${digits.slice(1)}`;
  return digits;
}

function toE164(phone) {
  const digits = normalizeIndianNumber(phone);
  return digits ? `+${digits}` : "";
}

function isSmsEnabled() {
  return String(process.env.SMS_ENABLED || "true").toLowerCase() === "true";
}

function isSmsConfigured() {
  if (!isSmsEnabled()) return false;

  const provider = (process.env.SMS_PROVIDER || "fast2sms").toLowerCase();

  if (provider === "twilio") {
    return Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
    );
  }

  if (provider === "generic") {
    return Boolean(process.env.SMS_API_KEY && process.env.SMS_API_URL);
  }

  return Boolean(process.env.SMS_API_KEY && process.env.SMS_API_URL);
}

async function sendSMS({ to, message }) {
  const normalizedDigits = normalizeIndianNumber(to);
  const normalizedE164 = toE164(to);

  if (!normalizedDigits || !message) {
    return { skipped: true, reason: "missing_to_or_message" };
  }

  const provider = (process.env.SMS_PROVIDER || "fast2sms").toLowerCase();

  if (!isSmsConfigured()) {
    const reason = isSmsEnabled() ? `not_configured_${provider}` : "disabled";
    console.warn(`[sms] SMS ${reason}. Skipping sms to:`, normalizedDigits);
    return { skipped: true, reason };
  }

  try {
    if (provider === "twilio") {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;

      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        new URLSearchParams({
          To: normalizedE164,
          From: from,
          Body: message,
        }),
        {
          auth: { username: sid, password: token },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: Number(process.env.SMS_TIMEOUT_MS || 10000),
        },
      );
      return { skipped: false };
    }

    if (provider === "generic") {
      await axios.post(
        process.env.SMS_API_URL,
        {
          to: normalizedDigits,
          message,
          from: process.env.SMS_FROM_NUMBER || "6302853317",
        },
        {
          headers: {
            Authorization: process.env.SMS_API_KEY,
            "Content-Type": "application/json",
          },
          timeout: Number(process.env.SMS_TIMEOUT_MS || 10000),
        },
      );
      return { skipped: false };
    }

    // Default payload compatible with Fast2SMS bulk API.
    await axios.post(
      process.env.SMS_API_URL,
      {
        route: process.env.SMS_ROUTE || "q",
        sender_id: process.env.SMS_SENDER_ID || "MVV",
        message,
        language: "english",
        flash: 0,
        numbers: normalizedDigits,
      },
      {
        headers: {
          authorization: process.env.SMS_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: Number(process.env.SMS_TIMEOUT_MS || 10000),
      },
    );
  } catch (err) {
    const providerMsg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "sms provider request failed";
    console.warn("[sms] send failed:", providerMsg);
    throw err;
  }

  return { skipped: false };
}

module.exports = { sendSMS, isSmsConfigured };
