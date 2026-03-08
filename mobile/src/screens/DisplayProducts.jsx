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
import colors from "../theme/colors";

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
            resizeMode="contain"
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
            <Text style={styles.price}>{`\u20B9${item.price}`}</Text>
            <Text
              style={[
                styles.stock,
                item.stock === 0
                  ? styles.stockOut
                  : item.stock <= 5
                  ? styles.stockLow
                  : styles.stockOk,
              ]}
            >
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
                <Text style={styles.qtyBtnText}>-</Text>
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
    minHeight: 290,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  imageWrapper: {
    width: "100%",
    height: 138,
    backgroundColor: colors.surfaceSoft,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#26373F",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  outOfStockText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  info: {
    flex: 1,
    padding: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 20,
  },
  packSize: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  bottom: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  stock: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  stockOk: {
    color: "#1D7A4B",
  },
  stockLow: {
    color: "#AB6400",
  },
  stockOut: {
    color: "#DC2626",
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  disabledBtn: {
    borderWidth: 1,
    borderColor: "#E2E8E4",
    backgroundColor: "#F3F6F4",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  disabledBtnText: {
    color: "#789085",
    fontWeight: "600",
    fontSize: 12,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7DACD",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 16,
    textAlign: "center",
  },
});

export default DisplayProducts;
