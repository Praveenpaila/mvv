import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../../api/api";

export default function AdminRiders() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    vehicleNumber: "",
    password: "",
  });

  const fetchRiders = useCallback(async () => {
    try {
      const res = await api.get("/delivery/persons");
      if (res.data?.success) {
        setList(res.data.deliveryPersons || []);
      }
    } catch {
      Toast.show({ type: "error", text1: "Failed to load delivery persons" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const openAdd = () => {
    setForm({
      name: "",
      email: "",
      phoneNumber: "",
      vehicleNumber: "",
      password: "",
    });
    setAddModal(true);
  };

  const submitAdd = async () => {
    const { name, email, phoneNumber, vehicleNumber, password } = form;
    if (!name?.trim() || !email?.trim() || !phoneNumber?.trim()) {
      Toast.show({ type: "error", text1: "Name, email and phone are required" });
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/delivery/persons", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        vehicleNumber: vehicleNumber?.trim() || "",
        password: password?.trim() || undefined,
      });
      if (res.data?.success) {
        Toast.show({
          type: "success",
          text1: "Delivery person added",
          text2: "They can log in with email and the password you set (or default).",
        });
        setAddModal(false);
        fetchRiders();
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Failed to add delivery person",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={s.loadingText}>Loading riders…</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.addBtn} onPress={openAdd}>
        <Text style={s.addBtnText}>+ Add Delivery Person</Text>
      </TouchableOpacity>

      <FlatList
        data={list}
        keyExtractor={(item, i) => (item._id ? String(item._id) : `r-${i}`)}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchRiders();
            }}
          />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🚚</Text>
            <Text style={s.emptyText}>No delivery persons yet</Text>
            <Text style={s.emptySub}>Tap "Add Delivery Person" to add one</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{item.name?.charAt(0)?.toUpperCase() || "?"}</Text>
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardName}>{item.name}</Text>
              <Text style={s.cardEmail}>{item.email}</Text>
              <Text style={s.cardPhone}>{item.phoneNumber}</Text>
              {item.vehicleNumber ? (
                <Text style={s.cardVehicle}>🛵 {item.vehicleNumber}</Text>
              ) : null}
            </View>
          </View>
        )}
      />

      {/* Add Delivery Person Modal */}
      <Modal visible={addModal} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        <View style={s.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalKav}>
            <View style={s.modalCard}>
              <ScrollView contentContainerStyle={s.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={s.modalTitle}>Add Delivery Person</Text>
                <Text style={s.modalSub}>They will be able to log in with email and password.</Text>

                <Text style={s.label}>Name *</Text>
                <TextInput
                  style={s.input}
                  placeholder="Full name"
                  placeholderTextColor="#888"
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                />

                <Text style={s.label}>Email *</Text>
                <TextInput
                  style={s.input}
                  placeholder="email@example.com"
                  placeholderTextColor="#888"
                  value={form.email}
                  onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={s.label}>Phone *</Text>
                <TextInput
                  style={s.input}
                  placeholder="10-digit number"
                  placeholderTextColor="#888"
                  value={form.phoneNumber}
                  onChangeText={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
                  keyboardType="phone-pad"
                />

                <Text style={s.label}>Vehicle number (optional)</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. KA 01 AB 1234"
                  placeholderTextColor="#888"
                  value={form.vehicleNumber}
                  onChangeText={(v) => setForm((f) => ({ ...f, vehicleNumber: v }))}
                />

                <Text style={s.label}>Login password (optional)</Text>
                <TextInput
                  style={s.input}
                  placeholder="Default: Delivery123"
                  placeholderTextColor="#888"
                  value={form.password}
                  onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
                  secureTextEntry
                />

                <TouchableOpacity style={[s.saveBtn, saving && s.saveBtnDisabled]} onPress={submitAdd} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Add Delivery Person</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setAddModal(false)}>
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  loadingText: { marginTop: 12, color: "#64748B" },
  addBtn: {
    backgroundColor: "#6366F1",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  listContent: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#64748B", fontWeight: "600" },
  emptySub: { fontSize: 13, color: "#94A3B8", marginTop: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  cardEmail: { fontSize: 13, color: "#64748B", marginTop: 2 },
  cardPhone: { fontSize: 13, color: "#64748B", marginTop: 1 },
  cardVehicle: { fontSize: 12, color: "#10B981", marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalKav: { width: "100%", maxHeight: "90%" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36 },
  modalScroll: { paddingBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B", marginBottom: 4 },
  modalSub: { fontSize: 13, color: "#64748B", marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#1a1a1a",
  },
  saveBtn: { backgroundColor: "#6366F1", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  saveBtnDisabled: { backgroundColor: "#A5B4FC" },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  cancelBtn: { backgroundColor: "#F1F5F9", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 10 },
  cancelText: { color: "#64748B", fontWeight: "700", fontSize: 15 },
});
