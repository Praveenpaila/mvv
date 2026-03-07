import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  RefreshControl, FlatList, TextInput, Modal, Switch,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import api from "../../api/api";

const STATUS_FLOW = { assigned: "picked_up", picked_up: "out_for_delivery", out_for_delivery: "delivered" };
const STATUS_LABELS = { assigned: "Assigned", picked_up: "Picked Up", out_for_delivery: "Out for Delivery", delivered: "Delivered" };
const STATUS_COLORS = { assigned: "#3B82F6", picked_up: "#F59E0B", out_for_delivery: "#8B5CF6", delivered: "#10B981" };

export default function DeliveryDashboard({ navigation, setToken, setRole }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ vehicleNumber: "", isActive: true });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchDeliveries = useCallback(async () => {
    try {
      const res = await api.get("/delivery/my");
      if (res.data?.success) setDeliveries(res.data.deliveries || []);
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.message || "Failed to fetch deliveries" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/delivery/profile");
      if (res.data?.success) {
        setProfile(res.data.deliveryPerson);
        setProfileForm({
          vehicleNumber: res.data.deliveryPerson.vehicleNumber || "",
          isActive: res.data.deliveryPerson.isActive,
        });
      }
    } catch { /* profile might not exist yet */ }
  }, []);

  useEffect(() => { fetchDeliveries(); fetchProfile(); }, [fetchDeliveries, fetchProfile]);

  const updateStatus = async (deliveryId, nextStatus) => {
    try {
      setUpdatingId(deliveryId);
      const res = await api.put(`/delivery/${deliveryId}`, { status: nextStatus });
      if (res.data?.success) {
        Toast.show({ type: "success", text1: `Marked as ${STATUS_LABELS[nextStatus]}` });
        fetchDeliveries();
      }
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.message || "Update failed" });
    } finally {
      setUpdatingId(null);
    }
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      const res = await api.put("/delivery/profile", profileForm);
      if (res.data?.success) {
        setProfile(res.data.deliveryPerson);
        Toast.show({ type: "success", text1: "Profile saved!" });
        setShowProfile(false);
      }
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.message || "Save failed" });
    } finally {
      setSavingProfile(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "role", "token_expiry", "userName"]);
    setToken?.(null);
    setRole?.(null);
    navigation.replace("Login");
  };

  const stats = {
    total: deliveries.length,
    active: deliveries.filter((d) => d.status !== "delivered").length,
    done: deliveries.filter((d) => d.status === "delivered").length,
  };

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={s.loadingText}>Loading deliveries…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Delivery Panel</Text>
          <Text style={s.headerSub}>{profile?.name || "Rider"}</Text>
        </View>
        <View style={s.headerBtns}>
          <TouchableOpacity style={s.profileBtn} onPress={() => setShowProfile(true)}>
            <Text style={s.profileBtnText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.logoutBtn} onPress={logout}>
            <Text style={s.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { label: "Total", count: stats.total, color: "#10B981" },
          { label: "Active", count: stats.active, color: "#F59E0B" },
          { label: "Delivered", count: stats.done, color: "#6366F1" },
        ].map((item) => (
          <View key={item.label} style={[s.statCard, { borderTopColor: item.color }]}>
            <Text style={[s.statCount, { color: item.color }]}>{item.count}</Text>
            <Text style={s.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Deliveries */}
      <FlatList
        data={deliveries}
        keyExtractor={(d, i) => (d._id != null ? String(d._id) : `del-${i}`)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDeliveries(); }} />
        }
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyText}>No deliveries assigned yet</Text>
          </View>
        }
        renderItem={({ item: d }) => {
          const order = d.orderId;
          const nextStatus = STATUS_FLOW[d.status];
          const isUpdating = updatingId === d._id;
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardOrderId}>#{order?._id?.slice(-8) || "------"}</Text>
                <View style={[s.badge, { backgroundColor: (STATUS_COLORS[d.status] || "#64748B") + "20" }]}>
                  <Text style={[s.badgeText, { color: STATUS_COLORS[d.status] || "#64748B" }]}>
                    {STATUS_LABELS[d.status] || d.status}
                  </Text>
                </View>
              </View>

              {/* Customer */}
              <View style={s.section}>
                <Text style={s.sectionLabel}>Customer</Text>
                <Text style={s.sectionValue}>{order?.user?.userName || "—"}</Text>
                <Text style={s.sectionSub}>{order?.user?.phoneNumber || ""}</Text>
              </View>

              {/* Address */}
              <View style={s.section}>
                <Text style={s.sectionLabel}>📍 Address</Text>
                <Text style={s.sectionValue}>
                  Block {order?.address?.block}, Floor {order?.address?.floor}, Room {order?.address?.roomNo}
                </Text>
              </View>

              {/* Items */}
              <View style={s.itemsBox}>
                {order?.items?.map((item, idx) => (
                  <View key={idx} style={s.itemRow}>
                    <Text style={s.itemName}>{item.name}</Text>
                    <Text style={s.itemMerchant}>{item.merchantId?.userName || ""}</Text>
                    <Text style={s.itemQty}>×{item.quantity}</Text>
                  </View>
                ))}
              </View>

              {/* Total */}
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total</Text>
                <Text style={s.totalValue}>₹{order?.totalAmount}</Text>
              </View>

              {/* Action Button */}
              {nextStatus && (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: STATUS_COLORS[nextStatus] }]}
                  onPress={() => updateStatus(d._id, nextStatus)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={s.actionBtnText}>Mark as {STATUS_LABELS[nextStatus]}</Text>
                  )}
                </TouchableOpacity>
              )}
              {!nextStatus && d.status === "delivered" && (
                <View style={s.deliveredBadge}>
                  <Text style={s.deliveredText}>✓ Delivered</Text>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Profile Modal */}
      <Modal visible={showProfile} transparent animationType="slide" onRequestClose={() => setShowProfile(false)}>
        <View style={s.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalKav}>
            <View style={s.modalCard}>
              <ScrollView contentContainerStyle={s.modalScrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={s.modalTitle}>My Profile</Text>
                {profile && (
                  <>
                    <View style={s.profileInfoRow}>
                      <Text style={s.profileLabel}>Name</Text>
                      <Text style={s.profileValue}>{profile.name}</Text>
                    </View>
                    <View style={s.profileInfoRow}>
                      <Text style={s.profileLabel}>Email</Text>
                      <Text style={s.profileValue}>{profile.email}</Text>
                    </View>
                    <View style={s.profileInfoRow}>
                      <Text style={s.profileLabel}>Phone</Text>
                      <Text style={s.profileValue}>{profile.phoneNumber}</Text>
                    </View>
                  </>
                )}

                <Text style={s.fieldLabel}>Vehicle Number</Text>
                <TextInput
                  style={s.input}
                  value={profileForm.vehicleNumber}
                  onChangeText={(v) => setProfileForm((f) => ({ ...f, vehicleNumber: v }))}
                  placeholder="e.g. KA 01 AB 1234"
                  placeholderTextColor="#888"
                />

                <View style={s.switchRow}>
                  <View>
                    <Text style={s.fieldLabel}>Available for Deliveries</Text>
                    <Text style={s.switchSub}>
                      {profileForm.isActive ? "✓ You will receive new orders" : "⚠ You won't receive new orders"}
                    </Text>
                  </View>
                  <Switch
                    value={profileForm.isActive}
                    onValueChange={(v) => setProfileForm((f) => ({ ...f, isActive: v }))}
                    trackColor={{ false: "#E2E8F0", true: "#10B981" }}
                  />
                </View>

                <TouchableOpacity style={s.saveBtn} onPress={saveProfile} disabled={savingProfile}>
                  {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Changes</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setShowProfile(false)}>
                  <Text style={s.cancelText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECFDF5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  loadingText: { marginTop: 12, color: "#64748B", fontSize: 15 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#10B981", paddingHorizontal: 20, paddingVertical: 18,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 13, color: "#A7F3D0", marginTop: 2 },
  headerBtns: { flexDirection: "row", gap: 8 },
  profileBtn: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  profileBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statsRow: { flexDirection: "row", padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", borderTopWidth: 3, borderRadius: 10, padding: 14, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  statCount: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardOrderId: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  section: { marginBottom: 10 },
  sectionLabel: { fontSize: 11, color: "#94A3B8", marginBottom: 2 },
  sectionValue: { fontSize: 13, fontWeight: "600", color: "#334155" },
  sectionSub: { fontSize: 12, color: "#64748B" },
  itemsBox: { backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, marginVertical: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  itemName: { flex: 1, fontSize: 13, color: "#334155" },
  itemMerchant: { fontSize: 11, color: "#94A3B8", marginHorizontal: 6 },
  itemQty: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  totalLabel: { fontSize: 14, color: "#64748B" },
  totalValue: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
  actionBtn: { borderRadius: 10, paddingVertical: 13, alignItems: "center", marginTop: 14 },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  deliveredBadge: { backgroundColor: "#D1FAE5", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 14 },
  deliveredText: { color: "#065F46", fontWeight: "700", fontSize: 14 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#94A3B8" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalKav: { width: "100%" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36, maxHeight: "90%" },
  modalScrollContent: { paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B", marginBottom: 16 },
  profileInfoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  profileLabel: { fontSize: 13, color: "#94A3B8" },
  profileValue: { fontSize: 13, fontWeight: "600", color: "#334155" },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#334155", marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#1a1a1a", backgroundColor: "#fff" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  switchSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  saveBtn: { backgroundColor: "#10B981", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { backgroundColor: "#F1F5F9", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 10 },
  cancelText: { color: "#64748B", fontWeight: "700", fontSize: 15 },
});
