import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import DisplayProducts from "./DisplayProducts";
import Footer from "../components/Footer";

const BestSeller = ({ navigation }) => {
  const products = useSelector((state) => state.product.products);

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Best Sellers</Text>
      <Text style={styles.subtitle}>Popular picks for you</Text>
      <View style={styles.grid}>
        {(products || []).length === 0 ? (
          <Text style={styles.empty}>No products found</Text>
        ) : (
          (products || []).map((item, idx) => (
            <DisplayProducts
              key={item._id != null ? String(item._id) : `prod-${idx}`}
              item={item}
              navigation={navigation}
            />
          ))
        )}
      </View>
      <Footer navigation={navigation} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16, paddingBottom: 100 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  empty: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 40,
  },
});

export default BestSeller;
