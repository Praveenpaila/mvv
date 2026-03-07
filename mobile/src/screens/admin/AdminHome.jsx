import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "../../api/api";

export default function AdminHome({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/orders");
        if (res.data?.success) setOrders(res.data.orders || []);
      } catch {
        Toast.show({ type: "error", text1: "Failed to load dashboard" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "placed" || o.orderStatus === "confirmed"
  ).length;
  const delivered = orders.filter((o) => o.orderStatus === "delivered").length;
  const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const recentOrders = orders.slice(0, 5);

  const statusColor = (s) => {
    const map = { placed: "#3B82F6", confirmed: "#8B5CF6", out_for_delivery: "#F59E0B", delivered: "#10B981", cancelled: "#EF4444" };
    return map[s] || "#64748B";
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={s.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>Admin Dashboard</Text>
        <Text style={s.pageSubtitle}>Welcome back! Here's an overview of your store.</Text>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          {[
            { icon: "📦", count: totalOrders, label: "Total Orders", color: "#6366F1" },
            { icon: "⏳", count: pendingOrders, label: "Pending Orders", color: "#F59E0B" },
            { icon: "✅", count: delivered, label: "Delivered", color: "#10B981" },
            { icon: "💰", count: `₹${revenue.toLocaleString("en-IN")}`, label: "Revenue", color: "#EC4899" },
          ].map((item) => (
            <View key={item.label} style={[s.statCard, { borderTopColor: item.color }]}>
              <Text style={s.statIcon}>{item.icon}</Text>
              <Text style={[s.statCount, { color: item.color }]}>{item.count}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <View style={s.actionsGrid}>
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate("Upload")}>
              <Text style={s.actionIcon}>➕</Text>
              <Text style={s.actionTitle}>Add Product</Text>
              <Text style={s.actionSub}>Upload a new product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate("Orders")}>
              <Text style={s.actionIcon}>📋</Text>
              <Text style={s.actionTitle}>View Orders</Text>
              <Text style={s.actionSub}>Manage customer orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate("Manage")}>
              <Text style={s.actionIcon}>✏️</Text>
              <Text style={s.actionTitle}>Manage Products</Text>
              <Text style={s.actionSub}>Edit stock & prices</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
                <Text style={s.viewAll}>View All →</Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((order, idx) => (
              <View key={order._id != null ? String(order._id) : `order-${idx}`} style={s.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderId}>#{order._id?.slice(-8)}</Text>
                  <Text style={s.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: statusColor(order.orderStatus) + "20" }]}>
                  <Text style={[s.statusText, { color: statusColor(order.orderStatus) }]}>
                    {order.orderStatus?.replace(/_/g, " ")}
                  </Text>
                </View>
                <Text style={s.orderAmount}>₹{order.totalAmount}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  content: { padding: 20, paddingBottom: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#64748B" },
  pageTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
  pageSubtitle: { fontSize: 14, color: "#64748B", marginTop: 4, marginBottom: 20 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: {
    width: "47%", backgroundColor: "#fff", borderTopWidth: 4, borderRadius: 12,
    padding: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statCount: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 4, textAlign: "center" },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B", marginBottom: 12 },
  viewAll: { fontSize: 13, color: "#6366F1", fontWeight: "600" },
  actionsGrid: { flexDirection: "row", gap: 12 },
  actionCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 14, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  actionIcon: { fontSize: 26, marginBottom: 8 },
  actionTitle: { fontSize: 12, fontWeight: "700", color: "#1E293B", textAlign: "center" },
  actionSub: { fontSize: 10, color: "#94A3B8", marginTop: 4, textAlign: "center" },
  orderRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 10, padding: 14, marginBottom: 8,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  orderId: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  orderDate: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginHorizontal: 10 },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  orderAmount: { fontSize: 14, fontWeight: "700", color: "#10B981" },
});
