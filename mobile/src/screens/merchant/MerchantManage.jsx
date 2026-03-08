import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/api";

const LIMIT = 12;

const sortOptions = [
  { key: "updated_desc", label: "Updated ↓" },
  { key: "updated_asc", label: "Updated ↑" },
  { key: "newest", label: "Newest" },
  { key: "name_asc", label: "Name A→Z" },
  { key: "name_desc", label: "Name Z→A" },
  { key: "price_asc", label: "Price ↑" },
  { key: "price_desc", label: "Price ↓" },
  { key: "stock_asc", label: "Stock ↑" },
  { key: "stock_desc", label: "Stock ↓" },
];

const hydrate = (p) => ({
  ...p,
  _draftPrice: String(p?.price ?? ""),
  _draftStock: String(p?.stock ?? ""),
  _pendingImage: null,
  _saving: false,
  _deleting: false,
});

const isDirty = (p) => {
  const priceNum = Number(p?._draftPrice);
  const stockNum = Number(p?._draftStock);
  if (!Number.isFinite(priceNum) || !Number.isFinite(stockNum)) return true;
  if (Number(p?.price ?? 0) !== priceNum) return true;
  if (Number(p?.stock ?? 0) !== stockNum) return true;
  if (p?._pendingImage) return true;
  return false;
};

export default function MerchantManage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("updated_desc");

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = useMemo(() => {
    const out = { limit: LIMIT, sort };
    if (debouncedQ) out.q = debouncedQ;
    if (inStockOnly) out.inStock = "true";
    return out;
  }, [sort, debouncedQ, inStockOnly]);

  const fetchPage = useCallback(
    async ({ nextPage, mode }) => {
      try {
        const res = await api.get("/merchant/stock", {
          params: { ...params, page: nextPage },
        });
        if (!res.data?.success) throw new Error("Failed");

        const incoming = Array.isArray(res.data.products)
          ? res.data.products.map(hydrate)
          : [];

        setHasNext(Boolean(res.data.pagination?.hasNext));
        setTotal(Number(res.data.total ?? 0));

        if (mode === "append") {
          setItems((prev) => [...prev, ...incoming]);
        } else {
          setItems(incoming);
        }
      } catch (err) {
        Toast.show({
          type: "error",
          text1: err?.response?.data?.message || "Failed to load products",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [params],
  );

  useEffect(() => {
    setPage(1);
    setLoading(true);
    fetchPage({ nextPage: 1, mode: "reset" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, inStockOnly, sort]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPage({ nextPage: 1, mode: "reset" });
  };

  const pickImageFor = async (productId) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({ type: "error", text1: "Permission denied" });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setItems((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, _pendingImage: asset } : p,
        ),
      );
    }
  };

  const setDraft = (productId, field, value) => {
    setItems((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, [field]: value } : p)),
    );
  };

  const saveProduct = async (product) => {
    const priceNum = Number(product._draftPrice);
    const stockNum = Number(product._draftStock);
    if (!Number.isFinite(priceNum) || !Number.isFinite(stockNum)) {
      Toast.show({ type: "error", text1: "Price/Stock must be numbers" });
      return;
    }

    setItems((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, _saving: true } : p)),
    );

    try {
      let res;
      if (product._pendingImage) {
        const fd = new FormData();
        fd.append("price", String(priceNum));
        fd.append("stock", String(stockNum));
        fd.append("image", {
          uri: product._pendingImage.uri,
          type: product._pendingImage.mimeType || "image/jpeg",
          name:
            product._pendingImage.fileName ||
            `product-${String(product._id).slice(-6)}.jpg`,
        });
        res = await api.put(`/products/${product._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.put(`/products/${product._id}`, {
          price: priceNum,
          stock: stockNum,
        });
      }

      if (res.data?.success) {
        const updated = res.data.product || {};
        Toast.show({ type: "success", text1: "Product updated" });
        setItems((prev) =>
          prev.map((p) =>
            p._id === product._id
              ? {
                  ...p,
                  ...updated,
                  _draftPrice: String(updated?.price ?? priceNum),
                  _draftStock: String(updated?.stock ?? stockNum),
                  _pendingImage: null,
                  _saving: false,
                }
              : p,
          ),
        );
      } else {
        throw new Error(res.data?.message || "Update failed");
      }
    } catch (err) {
      setItems((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, _saving: false } : p,
        ),
      );
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message || err?.message || "Update failed",
      });
    }
  };

  const deleteProduct = async (product) => {
    Alert.alert(
      "Delete product?",
      "This will permanently remove the product.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setItems((prev) =>
              prev.map((p) =>
                p._id === product._id ? { ...p, _deleting: true } : p,
              ),
            );
            try {
              const res = await api.delete(`/products/${product._id}`);
              if (res.data?.success) {
                Toast.show({ type: "success", text1: "Product deleted" });
                setItems((prev) => prev.filter((p) => p._id !== product._id));
              } else {
                throw new Error(res.data?.message || "Delete failed");
              }
            } catch (err) {
              setItems((prev) =>
                prev.map((p) =>
                  p._id === product._id ? { ...p, _deleting: false } : p,
                ),
              );
              Toast.show({
                type: "error",
                text1:
                  err?.response?.data?.message ||
                  err?.message ||
                  "Delete failed",
              });
            }
          },
        },
      ],
    );
  };

  const loadMore = () => {
    if (!hasNext || loadingMore || loading) return;
    const next = page + 1;
    setLoadingMore(true);
    setPage(next);
    fetchPage({ nextPage: next, mode: "append" });
  };

  const Header = (
    <View style={s.headerWrap}>
      <Text style={s.title}>Manage Products</Text>
      <Text style={s.subtitle}>
        {total ? `${total} products` : "Update prices, stock and images"}
      </Text>

      <View style={s.searchRow}>
        <TextInput
          style={s.search}
          placeholder="Search products…"
          placeholderTextColor="#94A3B8"
          value={q}
          onChangeText={setQ}
          autoCapitalize="none"
        />
        <View style={s.switchWrap}>
          <Text style={s.switchLabel}>In stock</Text>
          <Switch value={inStockOnly} onValueChange={setInStockOnly} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.sortRow}
      >
        {sortOptions.map((opt) => {
          const active = opt.key === sort;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setSort(opt.key)}
              style={[s.sortChip, active && s.sortChipActive]}
            >
              <Text style={[s.sortChipText, active && s.sortChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={s.loadingText}>Loading products…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <FlatList
        data={items}
        keyExtractor={(p, i) => (p?._id != null ? String(p._id) : `p-${i}`)}
        contentContainerStyle={{ paddingBottom: 28 }}
        ListHeaderComponent={Header}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={s.emptyText}>No products found</Text>
          </View>
        }
        renderItem={({ item: p }) => {
          const dirty = isDirty(p);
          return (
            <View style={s.card}>
              <View style={s.rowTop}>
                <Image
                  source={{ uri: p._pendingImage?.uri || p.image }}
                  style={s.img}
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.name} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <Text style={s.meta}>
                    {p.packSize ? `${p.packSize} • ` : ""}
                    ID: {String(p._id).slice(-6)}
                  </Text>
                  <View style={s.btnRow}>
                    <TouchableOpacity
                      style={s.smallBtn}
                      onPress={() => pickImageFor(p._id)}
                    >
                      <Text style={s.smallBtnText}>Change Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.smallBtn, s.smallBtnDanger]}
                      onPress={() => deleteProduct(p)}
                      disabled={p._deleting}
                    >
                      <Text style={[s.smallBtnText, s.smallBtnDangerText]}>
                        {p._deleting ? "Deleting…" : "Delete"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={s.fieldRow}>
                <View style={s.field}>
                  <Text style={s.label}>Price (₹)</Text>
                  <TextInput
                    style={s.input}
                    keyboardType="numeric"
                    value={p._draftPrice}
                    onChangeText={(v) => setDraft(p._id, "_draftPrice", v)}
                  />
                </View>
                <View style={s.field}>
                  <Text style={s.label}>Stock</Text>
                  <TextInput
                    style={s.input}
                    keyboardType="numeric"
                    value={p._draftStock}
                    onChangeText={(v) => setDraft(p._id, "_draftStock", v)}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  s.saveBtn,
                  (!dirty || p._saving) && s.saveBtnDisabled,
                ]}
                onPress={() => saveProduct(p)}
                disabled={!dirty || p._saving}
              >
                {p._saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.saveText}>
                    {dirty ? "Save Changes" : "Saved"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
        ListFooterComponent={
          hasNext ? (
            <TouchableOpacity
              style={[s.loadMoreBtn, loadingMore && s.loadMoreBtnDisabled]}
              onPress={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color="#8B5CF6" />
              ) : (
                <Text style={s.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ height: 12 }} />
          )
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  loadingText: { marginTop: 12, color: "#64748B", fontSize: 15 },
  emptyText: { color: "#94A3B8", fontSize: 16 },

  headerWrap: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#1E293B" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 4, marginBottom: 12 },

  searchRow: { gap: 10 },
  search: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0f172a",
  },
  switchWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  switchLabel: { color: "#334155", fontWeight: "600" },

  sortRow: { paddingTop: 10, paddingBottom: 6, gap: 10, paddingRight: 16 },
  sortChip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  sortChipActive: { backgroundColor: "#8B5CF6", borderColor: "#8B5CF6" },
  sortChipText: { fontSize: 12, fontWeight: "700", color: "#475569" },
  sortChipTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  rowTop: { flexDirection: "row", gap: 12 },
  img: { width: 86, height: 86, borderRadius: 12, backgroundColor: "#F1F5F9" },
  name: { fontSize: 15, fontWeight: "800", color: "#1E293B" },
  meta: { fontSize: 12, color: "#64748B", marginTop: 4 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  smallBtn: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallBtnText: { fontSize: 12, fontWeight: "800", color: "#334155" },
  smallBtnDanger: { backgroundColor: "#FEF2F2" },
  smallBtnDangerText: { color: "#B91C1C" },

  fieldRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  field: { flex: 1 },
  label: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#fff",
  },

  saveBtn: {
    backgroundColor: "#8B5CF6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
  },
  saveBtnDisabled: { backgroundColor: "#C4B5FD" },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  loadMoreBtn: {
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loadMoreBtnDisabled: { opacity: 0.6 },
  loadMoreText: { color: "#8B5CF6", fontWeight: "900" },
});

