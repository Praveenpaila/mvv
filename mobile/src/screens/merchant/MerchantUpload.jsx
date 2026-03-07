import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Image, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import api from "../../api/api";

export default function MerchantUpload() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category: "", packSize: "",
    price: "", Mrp: "", discount: "", stock: "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({ type: "error", text1: "Permission denied" }); return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) setImage(result.assets[0]);
  };

  const resetForm = () => {
    setImage(null);
    setForm({ name: "", description: "", category: "", packSize: "", price: "", Mrp: "", discount: "", stock: "" });
  };

  const onSubmit = async () => {
    if (!image) { Toast.show({ type: "error", text1: "Please upload an image" }); return; }
    if (!form.name || !form.category || !form.price || !form.stock) {
      Toast.show({ type: "error", text1: "Fill all required fields" }); return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", { uri: image.uri, type: image.mimeType || "image/jpeg", name: image.fileName || "product.jpg" });
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category.toLowerCase());
      formData.append("packSize", form.packSize);
      formData.append("price", form.price);
      formData.append("Mrp", form.Mrp);
      formData.append("discount", form.discount);
      formData.append("stock", form.stock);

      await api.post("/add-product", formData, { headers: { "Content-Type": "multipart/form-data" } });
      Toast.show({ type: "success", text1: "Product added successfully" });
      resetForm();
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <KeyboardAvoidingView style={s.flex1} behavior="padding" keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.pageTitle}>Upload Product</Text>
        <Text style={s.pageSubtitle}>Add a new product to your store</Text>

        <TouchableOpacity style={[s.imagePicker, image && s.imagePickerActive]} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={s.previewImage} />
          ) : (
            <>
              <Text style={s.imagePickerIcon}>📷</Text>
              <Text style={s.imagePickerText}>Tap to upload product image</Text>
            </>
          )}
        </TouchableOpacity>
        {image && (
          <TouchableOpacity style={s.removeImageBtn} onPress={() => setImage(null)}>
            <Text style={s.removeImageText}>Remove Image</Text>
          </TouchableOpacity>
        )}

        <View style={s.card}>
          <Text style={s.fieldLabel}>Product Name *</Text>
          <TextInput style={s.input} placeholder="e.g. Fresh Mango" placeholderTextColor="#888" value={form.name} onChangeText={(v) => set("name", v)} />

          <Text style={s.fieldLabel}>Description</Text>
          <TextInput style={[s.input, s.textarea]} placeholder="Product description..." placeholderTextColor="#888" value={form.description} onChangeText={(v) => set("description", v)} multiline numberOfLines={3} textAlignVertical="top" />

          <View style={s.row}>
            <View style={s.col}>
              <Text style={s.fieldLabel}>Category *</Text>
              <TextInput style={s.input} placeholder="vegetables" placeholderTextColor="#888" value={form.category} onChangeText={(v) => set("category", v)} autoCapitalize="none" />
            </View>
            <View style={s.col}>
              <Text style={s.fieldLabel}>Pack Size</Text>
              <TextInput style={s.input} placeholder="1 kg" placeholderTextColor="#888" value={form.packSize} onChangeText={(v) => set("packSize", v)} />
            </View>
          </View>

          <View style={s.row}>
            <View style={s.col}>
              <Text style={s.fieldLabel}>Price (₹) *</Text>
              <TextInput style={s.input} placeholder="99" placeholderTextColor="#888" value={form.price} onChangeText={(v) => set("price", v)} keyboardType="numeric" />
            </View>
            <View style={s.col}>
              <Text style={s.fieldLabel}>MRP (₹)</Text>
              <TextInput style={s.input} placeholder="149" placeholderTextColor="#888" value={form.Mrp} onChangeText={(v) => set("Mrp", v)} keyboardType="numeric" />
            </View>
          </View>

          <View style={s.row}>
            <View style={s.col}>
              <Text style={s.fieldLabel}>Stock *</Text>
              <TextInput style={s.input} placeholder="100" placeholderTextColor="#888" value={form.stock} onChangeText={(v) => set("stock", v)} keyboardType="numeric" />
            </View>
            <View style={s.col}>
              <Text style={s.fieldLabel}>Discount (%)</Text>
              <TextInput style={s.input} placeholder="10" placeholderTextColor="#888" value={form.discount} onChangeText={(v) => set("discount", v)} keyboardType="numeric" />
            </View>
          </View>
        </View>

        <TouchableOpacity style={[s.submitBtn, uploading && s.submitBtnDisabled]} onPress={onSubmit} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Add Product</Text>}
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5FF" },
  flex1: { flex: 1 },
  content: { padding: 20, paddingBottom: 320 },
  pageTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
  pageSubtitle: { fontSize: 14, color: "#64748B", marginTop: 4, marginBottom: 20 },
  imagePicker: { borderWidth: 2, borderColor: "#C4B5FD", borderStyle: "dashed", borderRadius: 16, padding: 32, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", marginBottom: 12 },
  imagePickerActive: { borderColor: "#8B5CF6", borderStyle: "solid", padding: 0, overflow: "hidden" },
  previewImage: { width: "100%", height: 200, borderRadius: 14 },
  imagePickerIcon: { fontSize: 40, marginBottom: 8 },
  imagePickerText: { fontSize: 15, fontWeight: "600", color: "#334155" },
  removeImageBtn: { alignItems: "center", marginBottom: 16 },
  removeImageText: { color: "#EF4444", fontSize: 13, fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: "#fff", color: "#1a1a1a" },
  textarea: { height: 80 },
  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  submitBtn: { backgroundColor: "#8B5CF6", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  submitBtnDisabled: { backgroundColor: "#C4B5FD" },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
