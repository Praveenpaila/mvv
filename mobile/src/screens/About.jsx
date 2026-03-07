import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Footer from "../components/Footer";

const About = ({ navigation }) => (
  <ScrollView style={styles.aboutPage} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>About MK Gold Coast</Text>
        <Text style={styles.headerSub}>
          Fresh groceries delivered to your doorstep in minutes.
        </Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.h2}>Who We Are</Text>
        <Text style={styles.p}>
          MK Gold Coast is a fast and reliable online grocery delivery platform
          inspired by modern quick-commerce services like Blinkit. We focus on
          delivering fresh fruits, vegetables, and daily essentials at lightning
          speed.
        </Text>
        <Text style={styles.h2}>Our Mission</Text>
        <Text style={styles.p}>
          To simplify everyday shopping by providing quality products, affordable
          prices, and super-fast delivery — all from the comfort of your home.
        </Text>
        <Text style={styles.h2}>Why Choose Us?</Text>
        <Text style={styles.li}>✔ Fresh & quality products</Text>
        <Text style={styles.li}>✔ Fast delivery</Text>
        <Text style={styles.li}>✔ Trusted local sourcing</Text>
        <Text style={styles.li}>✔ Easy & secure shopping</Text>
      </View>
    </View>
    <Footer navigation={navigation} />
  </ScrollView>
);

const styles = StyleSheet.create({
  aboutPage: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16, paddingBottom: 100 },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: { marginBottom: 24 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  headerSub: { fontSize: 15, color: "#64748B" },
  text: {},
  h2: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  p: { fontSize: 15, color: "#64748B", lineHeight: 24, marginBottom: 8 },
  li: { fontSize: 15, color: "#64748B", marginBottom: 4 },
});

export default About;
