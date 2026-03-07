import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Switch,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../../api/api";

const orderStatusColor = (s) => {
  const map = { placed: "#3B82F6", confirmed: "#8B5CF6", out_for_delivery: "#F59E0B", delivered: "#10B981", cancelled: "#EF4444" };
  return map[s] || "#64748B";
};

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/merchant/orders");
      if (res.data?.success) setOrders(res.data.orders || []);
    } catch {
      Toast.show({ type: "error", text1: "Failed to load orders" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const toggleConfirm = async (merchantOrderId) => {
    try {
      setTogglingId(merchantOrderId);
      const res = await api.post("/merchant/toggle-confirm", { merchantOrderId });
      if (res.data?.success) {
        const msg = res.data.confirmed ? "Order confirmed ✓" : "Confirmation removed";
        Toast.show({ type: "success", text1: msg });
        if (res.data.allConfirmed) {
          Toast.show({ type: "success", text1: "All merchants confirmed!", text2: "Delivery will be auto-assigned" });
        }
        setOrders((prev) =>
          prev.map((o) => o.merchantOrderId === merchantOrderId ? { ...o, confirmed: res.data.confirmed } : o)
        );
      }
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.message || "Failed" });
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={s.loadingText}>Loading orders…</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={orders}
        keyExtractor={(o, i) => (o.merchantOrderId != null ? String(o.merchantOrderId) : `mo-${i}`)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />
        }
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={s.emptyText}>📦 No orders assigned to you</Text>
          </View>
        }
        renderItem={({ item: order }) => (
          <View style={[s.orderCard, order.confirmed && s.orderCardConfirmed]}>
            <View style={s.cardHeader}>
              <Text style={s.orderId}>#{String(order.merchantOrderId).slice(-8)}</Text>
              <View style={[s.statusBadge, { backgroundColor: orderStatusColor(order.orderStatus) + "20" }]}>
                <Text style={[s.statusText, { color: orderStatusColor(order.orderStatus) }]}>
                  {order.orderStatus?.replace(/_/g, " ")}
                </Text>
              </View>
            </View>

            {order.address && (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>📍 Address</Text>
                <Text style={s.infoValue}>
                  {order.address.firstName} — Block {order.address.block}, Floor {order.address.floor}, Room {order.address.roomNo}
                </Text>
              </View>
            )}

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>💰 Your Total</Text>
              <Text style={[s.infoValue, { color: "#10B981", fontWeight: "700" }]}>₹{order.merchantTotal}</Text>
            </View>

            <View style={s.itemsContainer}>
              <Text style={s.itemsTitle}>Items</Text>
              {order.items?.map((item, idx) => (
                <View key={idx} style={s.itemRow}>
                  <Text style={s.itemName}>{item.name}</Text>
                  <Text style={s.itemQty}>×{item.quantity}</Text>
                  <Text style={s.itemPrice}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
            </View>

            <View style={s.confirmRow}>
              <View>
                <Text style={s.confirmLabel}>Confirm this order</Text>
                <Text style={s.confirmSub}>
                  {order.confirmed ? "✓ You confirmed this order" : "Toggle to confirm your part"}
                </Text>
              </View>
              {togglingId === order.merchantOrderId ? (
                <ActivityIndicator color="#8B5CF6" />
              ) : (
                <Switch
                  value={order.confirmed || false}
                  onValueChange={() => toggleConfirm(order.merchantOrderId)}
                  trackColor={{ false: "#E2E8F0", true: "#8B5CF6" }}
                  thumbColor="#fff"
                />
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  loadingText: { marginTop: 12, color: "#64748B" },
  orderCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3, borderLeftWidth: 4, borderLeftColor: "#E2E8F0" },
  orderCardConfirmed: { borderLeftColor: "#10B981" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  orderId: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  infoRow: { marginBottom: 8 },
  infoLabel: { fontSize: 12, color: "#94A3B8", marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#334155" },
  itemsContainer: { backgroundColor: "#F8FAFC", borderRadius: 8, padding: 12, marginVertical: 10 },
  itemsTitle: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  itemName: { flex: 1, fontSize: 13, color: "#334155" },
  itemQty: { fontSize: 13, color: "#64748B", marginHorizontal: 8 },
  itemPrice: { fontSize: 13, fontWeight: "700", color: "#1E293B" },
  confirmRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  confirmLabel: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  confirmSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  emptyText: { fontSize: 16, color: "#94A3B8" },
});
