import React, { useRef } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import Product from "./Product";
import Footer from "../components/Footer";
import { Title } from "../components/Title";
import colors from "../theme/colors";
import { useScrollToTopOnFocus } from "../hooks/useScrollToTopOnFocus";

const Home = ({ navigation }) => {
  const category = useSelector((state) => state.category.category);
  const scrollRef = useRef(null);
  useScrollToTopOnFocus(scrollRef);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.home}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Title text1="Shop by" text2="Category" />
        <View style={styles.grid}>
          {(category || []).map((cat, idx) => (
            <Product
              key={cat._id != null ? String(cat._id) : `cat-${idx}`}
              item={{
                _id: cat._id,
                categoryName: cat.categoryName,
                image: cat.image,
              }}
              onPress={() => navigation?.navigate?.("Category", { id: cat._id })}
            />
          ))}
        </View>
      </View>
      <Footer navigation={navigation} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  home: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 6,
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default Home;
