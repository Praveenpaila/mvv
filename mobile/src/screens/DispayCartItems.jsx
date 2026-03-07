import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { addToCart, removeItem } from "../store/cart";
import { useDispatch } from "react-redux";
import api from "../api/api";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DispayCartItems = ({ item, onPriceChange, navigation }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [product, setProduct] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    const productId = item._id != null ? String(item._id) : null;
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/cart/${productId}`);
        if (res.data?.success && res.data?.product) {
          setProduct(res.data.product);
          onPriceChange(item._id, res.data.product.price, item.quantity);
        }
      } catch {
        Toast.show({ type: "error", text1: "Failed to load product" });
      }
    };
    fetchProduct();
  }, [item._id]);

  const updateCart = async (newQty) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      navigation?.navigate?.("Login");
      return;
    }
    if (newQty < 0) return;

    const id = item._id != null ? String(item._id) : null;
    if (!id) return;

    try {
      setQuantity(newQty);
      if (newQty === 0) {
        dispatch(removeItem(id));
        onPriceChange(item._id, 0, 0);
      } else {
        dispatch(addToCart({ _id: id, quantity: newQty }));
        onPriceChange(item._id, product?.price, newQty);
      }
      await api.post("/cart", { id, quantity: newQty });
    } catch {
      Toast.show({ type: "error", text1: "Cart update failed" });
    }
  };

  if (!product || quantity === 0) return null;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.image || "https://via.placeholder.com/80x80" }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>₹{product.price}</Text>
      </View>
      <View style={styles.cart}>
        <TouchableOpacity onPress={() => updateCart(quantity - 1)}>
          <Text style={styles.cartBtn}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{quantity}</Text>
        <TouchableOpacity onPress={() => updateCart(quantity + 1)}>
          <Text style={styles.cartBtn}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => updateCart(0)}>
        <Text style={styles.remove}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  middle: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  price: {
    fontSize: 14,
    color: "#2ecc71",
    fontWeight: "600",
    marginTop: 4,
  },
  cart: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartBtn: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2ecc71",
    minWidth: 28,
    textAlign: "center",
  },
  qty: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  remove: {
    fontSize: 13,
    color: "#e74c3c",
    fontWeight: "600",
    marginLeft: 12,
  },
});

export default DispayCartItems;
