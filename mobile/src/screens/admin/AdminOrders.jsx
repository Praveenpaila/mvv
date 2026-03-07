import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Modal,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../../api/api";

const STATUS_OPTIONS = [
  { value: "placed", label: "Placed", color: "#3B82F6" },
  { value: "confirmed", label: "Confirmed", color: "#8B5CF6" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "#F59E0B" },
  { value: "delivered", label: "Delivered", color: "#10B981" },
  { value: "cancelled", label: "Cancelled", color: "#EF4444" },
];

const statusColor = (s) => STATUS_OPTIONS.find((o) => o.value === s)?.color || "#64748B";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [modalOrder, setModalOrder] = useState(null);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [orderDeliveries, setOrderDeliveries] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [selectedDP, setSelectedDP] = useState({});
  const [dpModalOrder, setDpModalOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const [ordersRes, dpRes] = await Promise.all([
        api.get("/admin/orders"),
        api.get("/delivery/persons"),
      ]);
      if (ordersRes.data?.success) {
        const fetchedOrders = ordersRes.data.orders || [];
        setOrders(fetchedOrders);

        // Fetch merchant + delivery status for each order
        const statusMap = {};
        await Promise.all(
          fetchedOrders.map(async (order) => {
            try {
              const r = await api.get(`/delivery/order/${order._id}`);
              if (r.data?.success) statusMap[order._id] = r.data;
            } catch { /* skip */ }
          })
        );
        setOrderDeliveries(statusMap);
      }
      if (dpRes.data?.success) setDeliveryPersons(dpRes.data.deliveryPersons || []);
    } catch {
      Toast.show({ type: "error", text1: "Failed to load orders" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      const res = await api.put(`/admin/orders/${orderId}`, { orderStatus: status });
      if (res.data?.success || res.data?.message) {
        Toast.show({ type: "success", text1: "Status updated" });
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: status } : o));
      }
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.message || "Update failed" });
    } finally {
      setUpdatingId(null);
      setModalOrder(null);
    }
  };

  const assignDelivery = async (orderId) => {
    const dpId = selectedDP[orderId];
    if (!dpId) { Toast.show({ type: "error", text1: "Select a delivery person" }); return; }
    try {
      setAssigningId(orderId);
      const res = await api.post("/delivery/assign", { orderId, deliveryPersonId: dpId });
      if (res.data?.success) {
        Toast.show({ type: "success", text1: "Delivery assigned!" });
        fetchOrders();
      }
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.message || "Assignment failed" });
    } finally {
      setAssigningId(null);
      setDpModalOrder(null);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={s.loadingText}>Loading orders…</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={orders}
        keyExtractor={(o, i) => (o._id != null ? String(o._id) : `order-${i}`)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />
        }
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={s.emptyText}>No orders found</Text>
          </View>
        }
        renderItem={({ item: order }) => {
          const info = orderDeliveries[order._id] || {};
          const allConfirmed = info.allMerchantsConfirmed;
          const delivery = info.delivery;
          const confirmedCount = info.confirmedCount || 0;
          const totalMerchants = info.totalMerchants || 0;

          return (
            <View style={s.orderCard}>
              <View style={s.orderHeader}>
                <Text style={s.orderId}>#{order._id?.slice(-8)}</Text>
                <View style={[s.badge, { backgroundColor: statusColor(order.orderStatus) + "20" }]}>
                  <Text style={[s.badgeText, { color: statusColor(order.orderStatus) }]}>
                    {order.orderStatus?.replace(/_/g, " ")}
                  </Text>
                </View>
              </View>

              <View style={s.orderRow}>
                <Text style={s.orderLabel}>Customer</Text>
                <Text style={s.orderValue}>{order.address?.firstName} {order.address?.secondName}</Text>
              </View>
              <View style={s.orderRow}>
                <Text style={s.orderLabel}>Amount</Text>
                <Text style={[s.orderValue, { color: "#10B981", fontWeight: "700" }]}>₹{order.totalAmount}</Text>
              </View>
              <View style={s.orderRow}>
                <Text style={s.orderLabel}>Date</Text>
                <Text style={s.orderValue}>{new Date(order.createdAt).toLocaleDateString()}</Text>
              </View>

              {/* Merchant confirmation status */}
              {totalMerchants > 0 && (
                <View style={s.merchantSection}>
                  <Text style={s.merchantSectionTitle}>Merchant Confirmations ({confirmedCount}/{totalMerchants})</Text>
                  {info.merchantStatus?.map((m, i) => (
                    <View key={i} style={s.merchantRow}>
                      <Text style={s.merchantName}>{m.merchantName}</Text>
                      <View style={[s.confBadge, m.confirmed ? s.confBadgeYes : s.confBadgeNo]}>
                        <Text style={[s.confText, m.confirmed ? s.confTextYes : s.confTextNo]}>
                          {m.confirmed ? "✓ Confirmed" : "☐ Pending"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Delivery info */}
              {delivery ? (
                <View style={s.deliveryInfo}>
                  <Text style={s.deliveryInfoText}>
                    🚚 {delivery.deliveryPerson?.name} — {delivery.status?.replace(/_/g, " ")}
                  </Text>
                </View>
              ) : order.orderStatus === "confirmed" && allConfirmed ? (
                <TouchableOpacity style={s.assignBtn} onPress={() => setDpModalOrder(order)}>
                  <Text style={s.assignBtnText}>Assign Delivery Person</Text>
                </TouchableOpacity>
              ) : order.orderStatus === "confirmed" && !allConfirmed ? (
                <View style={s.waitingBox}>
                  <Text style={s.waitingText}>Waiting for merchants to confirm ({confirmedCount}/{totalMerchants})</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={s.changeStatusBtn}
                onPress={() => setModalOrder(order)}
                disabled={updatingId === order._id}
              >
                {updatingId === order._id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.changeStatusText}>Change Status</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Status Modal */}
      <Modal visible={!!modalOrder} transparent animationType="slide" onRequestClose={() => setModalOrder(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Update Order Status</Text>
            <Text style={s.modalSub}>#{modalOrder?._id?.slice(-8)}</Text>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[s.statusOption, modalOrder?.orderStatus === opt.value && { backgroundColor: opt.color + "20", borderColor: opt.color }]}
                onPress={() => updateStatus(modalOrder._id, opt.value)}
              >
                <View style={[s.statusDot, { backgroundColor: opt.color }]} />
                <Text style={[s.statusOptionText, modalOrder?.orderStatus === opt.value && { color: opt.color, fontWeight: "700" }]}>
                  {opt.label}{modalOrder?.orderStatus === opt.value ? "  ✓" : ""}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.cancelBtn} onPress={() => setModalOrder(null)}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delivery Person Assignment Modal */}
      <Modal visible={!!dpModalOrder} transparent animationType="slide" onRequestClose={() => setDpModalOrder(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Assign Delivery Person</Text>
            <Text style={s.modalSub}>Order #{dpModalOrder?._id?.slice(-8)}</Text>
            {deliveryPersons.length === 0 ? (
              <Text style={s.noDPText}>No active delivery persons available</Text>
            ) : (
              deliveryPersons.map((dp) => (
                <TouchableOpacity
                  key={dp._id != null ? String(dp._id) : dp.email}
                  style={[s.dpOption, selectedDP[dpModalOrder?._id] === dp._id && s.dpOptionSelected]}
                  onPress={() => setSelectedDP((prev) => ({ ...prev, [dpModalOrder._id]: dp._id }))}
                >
                  <View style={s.dpAvatar}>
                    <Text style={s.dpAvatarText}>{dp.name?.charAt(0)?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.dpName}>{dp.name}</Text>
                    <Text style={s.dpDetail}>{dp.phoneNumber} · {dp.vehicleNumber || "No vehicle"}</Text>
                  </View>
                  {selectedDP[dpModalOrder?._id] === dp._id && <Text style={{ color: "#6366F1", fontWeight: "700" }}>✓</Text>}
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={[s.assignConfirmBtn, (!selectedDP[dpModalOrder?._id] || assigningId === dpModalOrder?._id) && s.assignConfirmBtnDisabled]}
              onPress={() => assignDelivery(dpModalOrder._id)}
              disabled={!selectedDP[dpModalOrder?._id] || assigningId === dpModalOrder?._id}
            >
              {assigningId === dpModalOrder?._id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.assignConfirmText}>Assign</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setDpModalOrder(null)}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  loadingText: { marginTop: 12, color: "#64748B" },
  emptyText: { fontSize: 16, color: "#94A3B8" },
  orderCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  orderId: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  orderRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  orderLabel: { fontSize: 13, color: "#64748B" },
  orderValue: { fontSize: 13, fontWeight: "600", color: "#334155" },
  merchantSection: { backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, marginTop: 10 },
  merchantSectionTitle: { fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 6 },
  merchantRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  merchantName: { fontSize: 13, color: "#334155" },
  confBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  confBadgeYes: { backgroundColor: "#D1FAE5" },
  confBadgeNo: { backgroundColor: "#F1F5F9" },
  confText: { fontSize: 11, fontWeight: "700" },
  confTextYes: { color: "#065F46" },
  confTextNo: { color: "#64748B" },
  deliveryInfo: { backgroundColor: "#EEF2FF", borderRadius: 8, padding: 10, marginTop: 10 },
  deliveryInfoText: { fontSize: 13, color: "#4338CA", fontWeight: "600" },
  assignBtn: { backgroundColor: "#6366F1", borderRadius: 10, paddingVertical: 11, alignItems: "center", marginTop: 10 },
  assignBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  waitingBox: { backgroundColor: "#FFF7ED", borderRadius: 8, padding: 10, marginTop: 10 },
  waitingText: { fontSize: 13, color: "#B45309", fontWeight: "600" },
  changeStatusBtn: { backgroundColor: "#6366F1", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 10 },
  changeStatusText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 4 },
  modalSub: { fontSize: 13, color: "#94A3B8", marginBottom: 16 },
  statusOption: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 10 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  statusOptionText: { fontSize: 15, color: "#334155" },
  noDPText: { fontSize: 15, color: "#94A3B8", textAlign: "center", paddingVertical: 20 },
  dpOption: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 10 },
  dpOptionSelected: { backgroundColor: "#EEF2FF", borderColor: "#6366F1" },
  dpAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#6366F1", justifyContent: "center", alignItems: "center", marginRight: 12 },
  dpAvatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  dpName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  dpDetail: { fontSize: 12, color: "#64748B", marginTop: 2 },
  assignConfirmBtn: { backgroundColor: "#6366F1", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 10, marginBottom: 6 },
  assignConfirmBtnDisabled: { backgroundColor: "#A5B4FC" },
  assignConfirmText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { backgroundColor: "#F1F5F9", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  cancelText: { color: "#64748B", fontWeight: "700", fontSize: 15 },
});
