import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeItem } from "../store/cart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";
import Toast from "react-native-toast-message";

const DisplayProducts = ({ item, navigation }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);
  const cartItem = cart.find((i) => i._id === item._id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const outOfStock = item.stock === 0;

  const updateCart = async (newQty) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      navigation?.navigate?.("Login");
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

  return (
    <View style={[styles.card, outOfStock ? styles.disabled : null]}>
      <Pressable
        onPress={() =>
          navigation?.navigate?.("ProductItem", {
            catId: item.category,
            id: item._id,
          })
        }
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri: item.image || "https://via.placeholder.com/120x120",
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </Pressable>
      {outOfStock && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.packSize}>{item.packSize}</Text>
        <View style={styles.bottom}>
          <View>
            <Text style={styles.price}>₹{item.price}</Text>
            <Text style={styles.stock}>
              {item.stock === 0
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
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyBox}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateCart(quantity - 1)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateCart(quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    opacity: 0.7,
  },
  imageWrapper: {
    width: "100%",
    height: 110,
    backgroundColor: "#F1F5F9",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  outOfStockText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  packSize: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  stock: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledBtn: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  disabledBtnText: {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: 14,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
  qtyText: {
    fontSize: 15,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
    color: "#1E293B",
  },
});

export default DisplayProducts;
