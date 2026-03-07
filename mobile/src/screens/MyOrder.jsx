import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import api from "../api/api";
import Orders from "./Orders";

const MyOrder = ({ navigation }) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!token && navigation?.replace) navigation.replace("Login");
  }, [token, navigation]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await api.get("/orders");
        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading orders…</Text>
      </View>
    );

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptyText}>Your past orders will appear here</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>My Orders</Text>
      {orders.map((order, idx) => (
        <Orders key={order._id != null ? String(order._id) : `order-${idx}`} order={order} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 16, paddingBottom: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { fontSize: 16, color: "#666" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#666" },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
});

export default MyOrder;
