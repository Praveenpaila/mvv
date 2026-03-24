import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "../../api/api";

export default function MerchantHome({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, stockRes] = await Promise.all([
          api.get("/merchant/orders"),
          api.get("/merchant/stock"),
        ]);
        if (ordersRes.data?.success) setOrders(ordersRes.data.orders || []);
        if (stockRes.data?.success) setProducts(stockRes.data.products || []);
      } catch {
        Toast.show({ type: "error", text1: "Failed to load dashboard" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === "placed" || o.orderStatus === "confirmed").length;
  const totalProducts = products.length;
  const lowStock = products.filter((p) => (p.stock || 0) <= 5).length;
  const recentOrders = orders.slice(0, 5);

  const statusColor = (s) => {
    const map = { placed: "#3B82F6", confirmed: "#8B5CF6", out_for_delivery: "#F59E0B", delivered: "#10B981", cancelled: "#EF4444" };
    return map[s] || "#64748B";
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={s.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>Merchant Dashboard</Text>
        <Text style={s.pageSubtitle}>Welcome back! Here's your store overview.</Text>

        {/* Stats */}
        <View style={s.statsGrid}>
          {[
            { icon: "📦", count: totalOrders, label: "Total Orders", color: "#8B5CF6" },
            { icon: "⏳", count: pendingOrders, label: "Pending Orders", color: "#F59E0B" },
            { icon: "🛍️", count: totalProducts, label: "Total Products", color: "#3B82F6" },
            { icon: "⚠️", count: lowStock, label: "Low Stock", color: "#EF4444" },
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
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate("MUpload")}>
              <Text style={s.actionIcon}>➕</Text>
              <Text style={s.actionTitle}>Add Product</Text>
              <Text style={s.actionSub}>Upload a new product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate("MManage")}>
              <Text style={s.actionIcon}>✏️</Text>
              <Text style={s.actionTitle}>Manage Products</Text>
              <Text style={s.actionSub}>Update price & stock</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate("MOrders")}>
              <Text style={s.actionIcon}>📋</Text>
              <Text style={s.actionTitle}>My Orders</Text>
              <Text style={s.actionSub}>View & confirm orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate("MBulk")}>
              <Text style={s.actionIcon}>📄</Text>
              <Text style={s.actionTitle}>Bulk Manage</Text>
              <Text style={s.actionSub}>Paste CSV updates</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => navigation.navigate("MOrders")}>
                <Text style={s.viewAll}>View All →</Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((order) => (
              <View key={String(order.merchantOrderId)} style={s.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderId}>#{String(order.merchantOrderId).slice(-8)}</Text>
                  <Text style={s.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: statusColor(order.orderStatus) + "20" }]}>
                  <Text style={[s.statusText, { color: statusColor(order.orderStatus) }]}>
                    {order.orderStatus?.replace(/_/g, " ")}
                  </Text>
                </View>
                <Text style={s.orderAmount}>₹{order.merchantTotal}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5FF" },
  content: { padding: 20, paddingBottom: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#64748B" },
  pageTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
  pageSubtitle: { fontSize: 14, color: "#64748B", marginTop: 4, marginBottom: 20 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: { width: "47%", backgroundColor: "#fff", borderTopWidth: 4, borderRadius: 12, padding: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statCount: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 4, textAlign: "center" },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B", marginBottom: 12 },
  viewAll: { fontSize: 13, color: "#8B5CF6", fontWeight: "600" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionCard: { width: "48%", backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionTitle: { fontSize: 13, fontWeight: "700", color: "#1E293B", textAlign: "center" },
  actionSub: { fontSize: 11, color: "#94A3B8", marginTop: 4, textAlign: "center" },
  orderRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  orderId: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  orderDate: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginHorizontal: 10 },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  orderAmount: { fontSize: 14, fontWeight: "700", color: "#10B981" },
});
