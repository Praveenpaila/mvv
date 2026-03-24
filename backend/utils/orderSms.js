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

function normalizeItems(itemsLike) {
  if (!itemsLike) return [];
  const items = Array.isArray(itemsLike) ? itemsLike : Object.values(itemsLike);
  return items
    .map((i) => ({
      name: String(i?.name || "").trim(),
      quantity: Number(i?.quantity || 0),
    }))
    .filter((i) => i.name && i.quantity > 0);
}

function formatAddressShort(address) {
  if (!address) return "";
  const block = address.block ?? address?.blockNo ?? "";
  const floor = address.floor ?? "";
  const room = address.roomNo ?? address.room ?? "";
  const parts = [];
  if (block !== "") parts.push(`Blk ${block}`);
  if (floor !== "") parts.push(`Flr ${floor}`);
  if (room !== "") parts.push(`Rm ${room}`);
  return parts.length ? `Addr: ${parts.join(" ")}` : "";
}

function formatItemsShort(order) {
  const items = normalizeItems(order?.items);
  if (!items.length) return "";

  const head = items.slice(0, 2).map((i) => `${i.name} x${i.quantity}`);
  const tailCount = Math.max(0, items.length - head.length);
  const extra = tailCount ? ` +${tailCount} more` : "";
  return `Items: ${head.join(", ")}${extra}`;
}

function compactOrderId(orderId) {
  const s = String(orderId || "");
  return s.length > 8 ? s.slice(-8) : s;
}

function trimMessage(message, maxLen = 420) {
  const s = String(message || "");
  if (s.length <= maxLen) return s;
  return `${s.slice(0, Math.max(0, maxLen - 3))}...`;
}

function buildOrderPlacedSms({ order }) {
  const orderId = compactOrderId(order?._id);
  const total = formatINR(order?.totalAmount);
  const items = formatItemsShort(order);
  const addr = formatAddressShort(order?.address);
  const support =
    process.env.SMS_SUPPORT_NUMBER ||
    process.env.TWILIO_PHONE_NUMBER ||
    process.env.SMS_FROM_NUMBER ||
    "6302853317";

  const base = [
    `MVV: Order ${orderId} placed.`,
    items,
    `Total ${total}.`,
    addr,
    `Help: ${support}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return trimMessage(base);
}

function buildOrderStatusSms({ order, previousStatus }) {
  const orderId = compactOrderId(order?._id);
  const current = prettyStatus(order?.orderStatus);
  const previous = previousStatus
    ? ` (from ${prettyStatus(previousStatus)})`
    : "";
  const items = formatItemsShort(order);
  const total = formatINR(order?.totalAmount);
  const addr = formatAddressShort(order?.address);
  const support =
    process.env.SMS_SUPPORT_NUMBER ||
    process.env.TWILIO_PHONE_NUMBER ||
    process.env.SMS_FROM_NUMBER ||
    "6302853317";

  const base = [
    `MVV: Order ${orderId} status ${current}${previous}.`,
    items,
    `Total ${total}.`,
    addr,
    `Help: ${support}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return trimMessage(base);
}

module.exports = { buildOrderPlacedSms, buildOrderStatusSms };
