import React, { useEffect, useRef } from "react";
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
import colors from "../theme/colors";
import { useScrollToTopOnFocus } from "../hooks/useScrollToTopOnFocus";

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
  const scrollRef = useRef(null);
  useScrollToTopOnFocus(scrollRef);

  // When navigating to another related product on the same screen,
  // force scroll reset because focus event may not re-fire.
  useEffect(() => {
    const node = scrollRef.current;
    if (node && typeof node.scrollTo === "function") {
      node.scrollTo({ y: 0, animated: false });
    }
  }, [id]);

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
        <Text style={styles.notFoundText}>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.main}
      contentContainerStyle={styles.content}
    >
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
            <Text style={styles.rating}>{`Rating ${item.rating || 4.5}`}</Text>
            <View style={styles.pack}>
              <Text style={styles.packLabel}>Pack Size</Text>
              <View style={styles.packPill}>
                <Text style={styles.packValue}>{item.packSize}</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.price}>{`\u20B9${item.price}`}</Text>
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
                  <TouchableOpacity
                    style={styles.qtyBtnWrap}
                    onPress={() => updateCart(quantity - 1)}
                  >
                    <Text style={styles.qtyBtn}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtnWrap}
                    onPress={() => updateCart(quantity + 1)}
                  >
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
            <DisplayProducts
              key={p._id != null ? String(p._id) : `rel-${idx}`}
              item={p}
              navigation={navigation}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 24 },
  page: { marginBottom: 24 },
  container: { gap: 18 },
  left: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 300,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  outOfStockBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  outOfStockText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  right: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  name: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 6 },
  rating: { fontSize: 14, marginBottom: 18, color: colors.textSecondary },
  pack: { marginBottom: 22 },
  packLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  packPill: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F8F4",
    borderWidth: 1,
    borderColor: "#D2E2D7",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  packValue: { fontSize: 14, fontWeight: "600", color: colors.text },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  price: { fontSize: 30, fontWeight: "800", color: colors.primaryDark },
  stock: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  disabledBtn: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  disabledBtnText: { color: "#6B7280", fontWeight: "600", fontSize: 14 },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C3D8C9",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  qtyBtnWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtn: { fontSize: 18, fontWeight: "700", color: colors.primaryDark },
  qtyText: { fontSize: 14, fontWeight: "700", minWidth: 20, textAlign: "center" },
  description: {
    marginTop: 8,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#E5EFE8",
  },
  descTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8, color: colors.text },
  descText: { fontSize: 15, color: colors.textSecondary, lineHeight: 24 },
  related: { marginTop: 10 },
  relatedTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: colors.text },
  relatedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  notFound: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  notFoundText: { color: colors.textSecondary, fontSize: 15 },
});

export default ProductItem;
