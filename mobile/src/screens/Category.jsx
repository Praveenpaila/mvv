import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import DisplayProducts from "./DisplayProducts";
import api from "../api/api";
import { add } from "../store/product";
import Footer from "../components/Footer";

const Category = ({ route, navigation }) => {
  const { id } = route.params || {};
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);

  useEffect(() => {
    const getItems = async () => {
      try {
        const res = await api.get(`/home/${id}`);
        if (res.data) {
          dispatch(add(res.data.products || []));
        }
      } catch (err) {
        console.log(err || "error");
      }
    };
    if (id) getItems();
  }, [id, dispatch]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {(products || []).length === 0 ? (
        <Text style={styles.empty}>No products found</Text>
      ) : (
        <>
          <View style={styles.grid}>
            {(products || []).map((item, idx) => (
              <DisplayProducts
                key={item._id != null ? String(item._id) : `prod-${idx}`}
                item={item}
                navigation={navigation}
              />
            ))}
          </View>
          <Footer navigation={navigation} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
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
    marginTop: 48,
  },
});

export default Category;
