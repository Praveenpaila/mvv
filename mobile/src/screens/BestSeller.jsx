import React, { useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import DisplayProducts from "./DisplayProducts";
import Footer from "../components/Footer";
import { Title } from "../components/Title";
import colors from "../theme/colors";
import { useScrollToTopOnFocus } from "../hooks/useScrollToTopOnFocus";

const BestSeller = ({ navigation }) => {
  const products = useSelector((state) => state.product.products);
  const scrollRef = useRef(null);
  useScrollToTopOnFocus(scrollRef);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.wrapper}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Title text1="Best" text2="Seller" />
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
  wrapper: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 100 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  empty: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 30,
    width: "100%",
  },
});

export default BestSeller;
