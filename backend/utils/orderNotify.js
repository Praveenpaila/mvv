const { sendEmail } = require("./email");
const { sendSMS } = require("./sms");
const { buildOrderPlacedEmail, buildOrderStatusEmail } = require("./orderEmail");
const { buildOrderPlacedSms, buildOrderStatusSms } = require("./orderSms");

function pickPhone(...values) {
  for (const value of values) {
    const normalized = String(value || "").replace(/\D/g, "");
    if (normalized) return normalized;
  }
  return "";
}

async function notifyOrderPlaced({ order, userEmail, userName, phoneNumber }) {
  try {
    const email = String(userEmail || "").trim();
    const mail = buildOrderPlacedEmail({ order, userName });
    await sendEmail({ to: email, ...mail });
  } catch (e) {
    console.warn("[notify] order placed email failed:", e?.message || e);
  }

  try {
    const toPhone = pickPhone(phoneNumber, order?.address?.phoneNumber);
    const smsMessage = buildOrderPlacedSms({ order, userName });
    await sendSMS({ to: toPhone, message: smsMessage });
  } catch (e) {
    console.warn("[notify] order placed sms failed:", e?.message || e);
  }
}

async function notifyOrderStatusChanged({
  order,
  userEmail,
  userName,
  phoneNumber,
  previousStatus,
}) {
  try {
    const email = String(userEmail || "").trim();
    const mail = buildOrderStatusEmail({ order, userName, previousStatus });
    await sendEmail({ to: email, ...mail });
  } catch (e) {
    console.warn("[notify] order status email failed:", e?.message || e);
  }

  try {
    const toPhone = pickPhone(phoneNumber, order?.address?.phoneNumber);
    const smsMessage = buildOrderStatusSms({ order, previousStatus });
    await sendSMS({ to: toPhone, message: smsMessage });
  } catch (e) {
    console.warn("[notify] order status sms failed:", e?.message || e);
  }
}

module.exports = {
  notifyOrderPlaced,
  notifyOrderStatusChanged,
};
