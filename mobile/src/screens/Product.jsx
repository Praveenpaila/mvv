import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const Product = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={styles.imageWrap}>
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/120x120" }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={2}>
        {item.categoryName}
      </Text>
      {item.price != null && (
        <Text style={styles.price}>₹{item.price}</Text>
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  imageWrap: {
    width: "100%",
    height: 130,
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 22,
  },
  price: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "800",
    marginTop: 8,
  },
});

export default Product;
