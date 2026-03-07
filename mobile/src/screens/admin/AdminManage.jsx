import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, Modal, TextInput, Alert, RefreshControl,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "../../api/api";
import { useSelector } from "react-redux";

export default function AdminManage() {
  const categories = useSelector((state) => state.category.category);
  const [selectedCat, setSelectedCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ stock: "", price: "" });
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async (catId) => {
    try {
      setLoading(true);
      const res = await api.get(`/home/${catId}`);
      if (res.data?.success) setProducts(res.data.products || []);
    } catch {
      Toast.show({ type: "error", text1: "Failed to load products" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCat) fetchProducts(selectedCat._id);
  }, [selectedCat, fetchProducts]);

  const openEdit = (product) => {
    setEditModal(product);
    setEditForm({ stock: String(product.stock || ""), price: String(product.price || "") });
  };

  const saveEdit = async () => {
    if (!editModal) return;
    try {
      setSaving(true);
      await api.put(`/admin/products/${editModal._id}`, {
        stock: Number(editForm.stock),
        price: Number(editForm.price),
      });
      Toast.show({ type: "success", text1: "Product updated" });
      setProducts((prev) => prev.map((p) => p._id === editModal._id ? { ...p, stock: Number(editForm.stock), price: Number(editForm.price) } : p));
      setEditModal(null);
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.content}>
        <Text style={s.pageTitle}>Manage Products</Text>

        {/* Category Selector */}
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(c, i) => (c._id != null ? String(c._id) : `cat-${i}`)}
          showsHorizontalScrollIndicator={false}
          style={s.catList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.catChip, selectedCat?._id === item._id && s.catChipActive]}
              onPress={() => setSelectedCat(item)}
            >
              <Text style={[s.catChipText, selectedCat?._id === item._id && s.catChipTextActive]}>
                {item.categoryName}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={s.emptyCat}>No categories loaded</Text>}
        />

        {/* Products */}
        {!selectedCat ? (
          <View style={s.center}>
            <Text style={s.emptyIcon}>👆</Text>
            <Text style={s.emptyText}>Select a category to manage products</Text>
          </View>
        ) : loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(p, i) => (p._id != null ? String(p._id) : `prod-${i}`)}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(selectedCat._id); }} />
            }
            ListEmptyComponent={
              <View style={s.center}>
                <Text style={s.emptyText}>No products in this category</Text>
              </View>
            }
            renderItem={({ item: product }) => (
              <View style={s.productCard}>
                <Image
                  source={{ uri: product.image }}
                  style={s.productImage}
                  defaultSource={{ uri: "https://via.placeholder.com/60x60/f5f5f5/999?text=MK" }}
                />
                <View style={s.productInfo}>
                  <Text style={s.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={s.productPack}>{product.packSize}</Text>
                  <View style={s.productMeta}>
                    <Text style={s.productPrice}>₹{product.price}</Text>
                    <View style={[s.stockBadge, product.stock <= 5 && s.stockLow]}>
                      <Text style={[s.stockText, product.stock <= 5 && s.stockTextLow]}>
                        Stock: {product.stock}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={s.editBtn} onPress={() => openEdit(product)}>
                  <Text style={s.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* Edit Modal */}
      <Modal visible={!!editModal} transparent animationType="slide" onRequestClose={() => setEditModal(null)}>
        <View style={s.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalKav}>
            <View style={s.modalCard}>
              <ScrollView contentContainerStyle={s.modalScrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={s.modalTitle}>Edit Product</Text>
                <Text style={s.modalSub}>{editModal?.name}</Text>
                <Text style={s.fieldLabel}>Price (₹)</Text>
                <TextInput style={s.input} placeholderTextColor="#888" value={editForm.price} onChangeText={(v) => setEditForm((f) => ({ ...f, price: v }))} keyboardType="numeric" placeholder="Price" />
                <Text style={s.fieldLabel}>Stock</Text>
                <TextInput style={s.input} placeholderTextColor="#888" value={editForm.stock} onChangeText={(v) => setEditForm((f) => ({ ...f, stock: v }))} keyboardType="numeric" placeholder="Stock" />
                <TouchableOpacity style={s.saveBtn} onPress={saveEdit} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Changes</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setEditModal(null)}>
                  <Text style={s.cancelText}>Cancel</Text>
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
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  content: { flex: 1, padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B", marginBottom: 16 },
  catList: { maxHeight: 50, marginBottom: 16 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: "#CBD5E1", marginRight: 8, backgroundColor: "#fff" },
  catChipActive: { backgroundColor: "#6366F1", borderColor: "#6366F1" },
  catChipText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  catChipTextActive: { color: "#fff" },
  emptyCat: { color: "#94A3B8", fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: "#94A3B8" },
  productCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 12, padding: 12, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  productImage: { width: 56, height: 56, borderRadius: 8, marginRight: 12, backgroundColor: "#F1F5F9" },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  productPack: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  productMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  productPrice: { fontSize: 14, fontWeight: "700", color: "#10B981" },
  stockBadge: { backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  stockLow: { backgroundColor: "#FEF2F2" },
  stockText: { fontSize: 11, color: "#16A34A", fontWeight: "600" },
  stockTextLow: { color: "#DC2626" },
  editBtn: { backgroundColor: "#EEF2FF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  editBtnText: { color: "#6366F1", fontWeight: "700", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalKav: { width: "100%" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36, maxHeight: "90%" },
  modalScrollContent: { paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  modalSub: { fontSize: 13, color: "#94A3B8", marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: "#fff", color: "#1a1a1a" },
  saveBtn: { backgroundColor: "#6366F1", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { backgroundColor: "#F1F5F9", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 10 },
  cancelText: { color: "#64748B", fontWeight: "700", fontSize: 15 },
});
