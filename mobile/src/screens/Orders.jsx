import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const Orders = ({ order }) => (
  <View style={styles.orderBox}>
    <View style={styles.top}>
      <View>
        <Text
          style={[
            styles.status,
            styles[order.orderStatus] || styles.placed,
          ]}
        >
          {String(order.orderStatus || "placed").replace(/_/g, " ")}
        </Text>
        <Text style={styles.date}>
          {order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "-"}
        </Text>
      </View>
      <Text style={styles.amount}>₹{order.totalAmount}</Text>
    </View>
    <View style={styles.items}>
      {Object.values(order.items || {}).map((item, idx) => (
        <View style={styles.itemRow} key={idx}>
          <Image
            source={{ uri: item.image || "https://via.placeholder.com/60x60" }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.itemMeta}>
              {item.quantity} × ₹{item.price}
            </Text>
          </View>
          <Text style={styles.itemTotal}>
            ₹{item.price * item.quantity}
          </Text>
        </View>
      ))}
    </View>
    <View style={styles.deliveryStatus}>
      <Text style={styles.label}>Delivery Status</Text>
      <Text
        style={[
          styles.badge,
          styles[order.orderStatus] || styles.placed,
        ]}
      >
        {String(order.orderStatus || "placed").replace(/_/g, " ")}
      </Text>
    </View>
    <View style={styles.bottom}>
      <Text style={styles.bottomText}>
        Delivery in {order.deliveryTime || "2-3 days"}
      </Text>
      <Text style={styles.payment}>Payment: {order.paymentType}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  orderBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  placed: { color: "#f39c12", backgroundColor: "rgba(243,156,18,0.2)" },
  confirmed: { color: "#3498db", backgroundColor: "rgba(52,152,219,0.2)" },
  out_for_delivery: { color: "#9b59b6", backgroundColor: "rgba(155,89,182,0.2)" },
  delivered: { color: "#2ecc71", backgroundColor: "rgba(46,204,113,0.2)" },
  cancelled: { color: "#e74c3c", backgroundColor: "rgba(231,76,60,0.2)" },
  date: { fontSize: 12, color: "#666", marginTop: 4 },
  amount: { fontSize: 18, fontWeight: "700", color: "#2ecc71" },
  items: { marginBottom: 12 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  productImage: { width: 50, height: 50, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: "600", color: "#333" },
  itemMeta: { fontSize: 12, color: "#666", marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: "600", color: "#2ecc71" },
  deliveryStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: { fontSize: 13, color: "#666" },
  badge: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  bottom: { marginTop: 4 },
  bottomText: { fontSize: 13, color: "#666" },
  payment: { fontSize: 12, color: "#999", marginTop: 2 },
});

export default Orders;
