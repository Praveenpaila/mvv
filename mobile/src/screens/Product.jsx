import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../theme/colors";

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
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrap: {
    width: "100%",
    height: 142,
    backgroundColor: colors.surfaceSoft,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    padding: 12,
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 20,
    textAlign: "center",
  },
  price: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: "600",
    marginTop: 6,
  },
});

export default Product;
