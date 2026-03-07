import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import DisplayProducts from "./DisplayProducts";
import api from "../api/api";
import { add } from "../store/product";
import { addToCart, removeItem } from "../store/cart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const ProductItem = ({ route, navigation }) => {
  const { catId, id } = route.params || {};
  const dispatch = useDispatch();

  useEffect(() => {
    const getItems = async () => {
      try {
        const res = await api.get(`/home/${catId}`);
        if (res.data?.products) {
          dispatch(add(res.data.products));
        }
      } catch (err) {
        console.log(err || "error");
      }
    };
    if (catId) getItems();
  }, [catId, dispatch]);

  const products = useSelector((state) => state.product.products);
  const item = (products || []).find((p) => p._id === id);
  const cart = useSelector((state) => state.cart.cart);
  const cartItem = cart.find((i) => i._id === id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const outOfStock = item?.stock === 0;
  const relatedProducts = (products || []).filter((p) => p && p._id !== id);

  const updateCart = async (newQty) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      navigation?.navigate?.("Login");
      return;
    }
    if (newQty > item.stock) {
      Toast.show({ type: "error", text1: "Stock limit reached" });
      return;
    }
    try {
      if (newQty === 0) {
        dispatch(removeItem(item._id));
      } else {
        dispatch(addToCart({ _id: item._id, quantity: newQty }));
      }
      await api.post("/cart", { id: item._id, quantity: newQty });
    } catch {
      Toast.show({ type: "error", text1: "Cart update failed" });
    }
  };

  if (!item) {
    return (
      <View style={styles.notFound}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.main} contentContainerStyle={styles.content}>
      <View style={styles.page}>
        <View style={styles.container}>
          <View style={styles.left}>
            <Image
              source={{
                uri: item.image || "https://via.placeholder.com/200x200",
              }}
              style={styles.image}
              resizeMode="contain"
            />
            {outOfStock && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
          </View>
          <View style={styles.right}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.rating}>⭐ {item.rating || 4.5}</Text>
            <View style={styles.pack}>
              <Text style={styles.packLabel}>Pack Size</Text>
              <Text style={styles.packValue}>{item.packSize}</Text>
            </View>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.price}>₹{item.price}</Text>
                <Text style={styles.stock}>
                  {outOfStock
                    ? "Out of stock"
                    : item.stock <= 5
                    ? `Only ${item.stock} left`
                    : "In stock"}
                </Text>
              </View>
              {outOfStock ? (
                <TouchableOpacity style={styles.disabledBtn} disabled>
                  <Text style={styles.disabledBtnText}>Unavailable</Text>
                </TouchableOpacity>
              ) : quantity === 0 ? (
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => updateCart(1)}
                >
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.qtyBox}>
                  <TouchableOpacity onPress={() => updateCart(quantity - 1)}>
                    <Text style={styles.qtyBtn}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <TouchableOpacity onPress={() => updateCart(quantity + 1)}>
                    <Text style={styles.qtyBtn}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.description}>
              <Text style={styles.descTitle}>About this product</Text>
              <Text style={styles.descText}>{item.description}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.related}>
        <Text style={styles.relatedTitle}>Related Products</Text>
        <View style={styles.relatedGrid}>
          {relatedProducts.map((p, idx) => (
            <DisplayProducts key={p._id != null ? String(p._id) : `rel-${idx}`} item={p} navigation={navigation} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 16, paddingBottom: 24 },
  page: { marginBottom: 24 },
  container: { flexDirection: "column" },
  left: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  image: { width: 200, height: 200 },
  outOfStockBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  outOfStockText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  right: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  name: { fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 8 },
  rating: { fontSize: 14, marginBottom: 12 },
  pack: { marginBottom: 12 },
  packLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  packValue: { fontSize: 14, fontWeight: "600" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  price: { fontSize: 24, fontWeight: "700", color: "#2ecc71" },
  stock: { fontSize: 12, color: "#666", marginTop: 4 },
  addBtn: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  disabledBtn: {
    backgroundColor: "#bdc3c7",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledBtnText: { color: "#7f8c8d", fontWeight: "600", fontSize: 16 },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyBtn: { fontSize: 24, fontWeight: "600", color: "#2ecc71", minWidth: 36, textAlign: "center" },
  qtyText: { fontSize: 18, fontWeight: "600", minWidth: 28, textAlign: "center" },
  description: { marginTop: 8 },
  descTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  descText: { fontSize: 14, color: "#666", lineHeight: 22 },
  related: { marginTop: 24 },
  relatedTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  relatedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  notFound: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
});

export default ProductItem;
