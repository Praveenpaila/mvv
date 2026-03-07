import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import Product from "./Product";
import Footer from "../components/Footer";

const Home = ({ navigation }) => {
  const category = useSelector((state) => state.category.category);

  return (
    <ScrollView
      style={styles.home}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Fresh Groceries</Text>
        <Text style={styles.heroSubtitle}>Delivered in minutes</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <Text style={styles.sectionSubtitle}>Browse fresh groceries</Text>
        </View>
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
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingBottom: 100,
  },
  heroSection: {
    backgroundColor: "#10B981",
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#D1FAE5",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default Home;
