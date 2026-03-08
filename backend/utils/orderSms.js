function formatINR(amount) {
  const n = Number(amount || 0);
  return `Rs.${Number.isFinite(n) ? n.toFixed(0) : "0"}`;
}

function prettyStatus(status) {
  const map = {
    assigned: "Assigned",
    picked_up: "Picked Up",
    placed: "Placed",
    confirmed: "Confirmed",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] || status || "Updated";
}

function buildOrderPlacedSms({ order }) {
  const orderId = String(order?._id || "");
  const total = formatINR(order?.totalAmount);
  const support =
    process.env.SMS_SUPPORT_NUMBER ||
    process.env.TWILIO_PHONE_NUMBER ||
    process.env.SMS_FROM_NUMBER ||
    "6302853317";

  return `MVV: Your order ${orderId} is placed. Total ${total}. For help call ${support}.`;
}

function buildOrderStatusSms({ order, previousStatus }) {
  const orderId = String(order?._id || "");
  const current = prettyStatus(order?.orderStatus);
  const previous = previousStatus
    ? ` (from ${prettyStatus(previousStatus)})`
    : "";
  const support =
    process.env.SMS_SUPPORT_NUMBER ||
    process.env.TWILIO_PHONE_NUMBER ||
    process.env.SMS_FROM_NUMBER ||
    "6302853317";

  return `MVV: Order ${orderId} status is now ${current}${previous}. Help: ${support}.`;
}

module.exports = { buildOrderPlacedSms, buildOrderStatusSms };
