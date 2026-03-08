function formatINR(amount) {
  const n = Number(amount || 0);
  return `₹${Number.isFinite(n) ? n.toFixed(0) : "0"}`;
}

function prettyStatus(status) {
  const map = {
    assigned: "Assigned",
    picked_up: "Picked up",
    placed: "Placed",
    confirmed: "Confirmed",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] || status || "Updated";
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildItemsTable(itemsObj) {
  const items = Object.values(itemsObj || {});
  if (!items.length) return "<p>No items</p>";

  const rows = items
    .map((i) => {
      const name = escapeHtml(i.name);
      const qty = Number(i.quantity || 0);
      const price = Number(i.price || 0);
      const lineTotal = qty * price;
      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${name}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${qty}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatINR(price)}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatINR(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px;text-align:left;border-bottom:1px solid #e2e8f0;">Item</th>
          <th style="padding:10px;text-align:center;border-bottom:1px solid #e2e8f0;">Qty</th>
          <th style="padding:10px;text-align:right;border-bottom:1px solid #e2e8f0;">Price</th>
          <th style="padding:10px;text-align:right;border-bottom:1px solid #e2e8f0;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function buildAddressBlock(address) {
  if (!address) return "";
  const name =
    `${escapeHtml(address.firstName)} ${escapeHtml(address.secondName)}`.trim();
  const line2 = `Block ${escapeHtml(address.block)}, Floor ${escapeHtml(
    address.floor,
  )}, Room ${escapeHtml(address.roomNo)}`;
  const phone = escapeHtml(address.phoneNumber);
  return `
    <div style="margin-top:10px;color:#334155;font-size:14px;line-height:20px;">
      <div style="font-weight:700;color:#1e293b;">Delivery address</div>
      <div>${name}</div>
      <div>${line2}</div>
      <div>Phone: ${phone}</div>
    </div>
  `;
}

function wrapEmail({ title, subtitle, bodyHtml }) {
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#10b981;border-radius:16px;padding:18px 20px;color:white;">
      <div style="font-size:18px;font-weight:800;letter-spacing:-0.2px;">MVV</div>
      <div style="opacity:0.9;margin-top:4px;">${escapeHtml(subtitle || "")}</div>
    </div>
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-top:14px;">
      <div style="font-size:18px;font-weight:800;color:#0f172a;">${escapeHtml(
        title,
      )}</div>
      ${bodyHtml}
    </div>
    <div style="color:#64748b;font-size:12px;margin-top:12px;text-align:center;">
      © ${new Date().getFullYear()} MVV
    </div>
  </div>
  `;
}

function buildOrderPlacedEmail({ order, userName }) {
  const orderId = escapeHtml(order?._id);
  const total = formatINR(order?.totalAmount);
  const paymentType = escapeHtml(order?.paymentType);
  const deliveryTime = escapeHtml(order?.deliveryTime);
  const createdAt = order?.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : new Date().toLocaleString();

  const bodyHtml = `
    <p style="margin-top:10px;color:#334155;">
      Hi ${escapeHtml(userName || "there")}, your order has been placed successfully.
    </p>
    <div style="margin-top:12px;color:#334155;font-size:14px;">
      <div><strong>Order ID:</strong> ${orderId}</div>
      <div><strong>Placed at:</strong> ${escapeHtml(createdAt)}</div>
      <div><strong>Delivery:</strong> ${deliveryTime}</div>
      <div><strong>Payment:</strong> ${paymentType}</div>
    </div>
    ${buildItemsTable(order?.items)}
    <div style="margin-top:12px;text-align:right;font-size:16px;font-weight:800;color:#0f172a;">
      Total: ${total}
    </div>
    ${buildAddressBlock(order?.address)}
  `;

  return {
    subject: `Your MVV order is placed (${orderId})`,
    html: wrapEmail({
      title: "Order placed",
      subtitle: "Invoice / Order confirmation",
      bodyHtml,
    }),
    text: `Order placed. Order ID: ${orderId}. Total: ${total}.`,
  };
}

function buildOrderStatusEmail({ order, userName, previousStatus }) {
  const orderId = escapeHtml(order?._id);
  const newStatus = prettyStatus(order?.orderStatus);
  const prev = previousStatus ? prettyStatus(previousStatus) : null;
  const total = formatINR(order?.totalAmount);

  const bodyHtml = `
    <p style="margin-top:10px;color:#334155;">
      Hi ${escapeHtml(userName || "there")}, your order status has been updated.
    </p>
    <div style="margin-top:12px;color:#334155;font-size:14px;">
      <div><strong>Order ID:</strong> ${orderId}</div>
      ${prev ? `<div><strong>Previous:</strong> ${escapeHtml(prev)}</div>` : ""}
      <div><strong>Current:</strong> ${escapeHtml(newStatus)}</div>
      <div><strong>Total:</strong> ${total}</div>
    </div>
    <div style="margin-top:14px;padding:12px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;">
      We’ll notify you again if there are more updates.
    </div>
  `;

  return {
    subject: `Order update: ${newStatus} (${orderId})`,
    html: wrapEmail({
      title: "Order status updated",
      subtitle: "Live order updates",
      bodyHtml,
    }),
    text: `Order ${orderId} status updated to ${newStatus}. Total: ${total}.`,
  };
}

module.exports = { buildOrderPlacedEmail, buildOrderStatusEmail };

