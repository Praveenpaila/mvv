import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Footer from "../components/Footer";

const Contact = ({ navigation }) => (
  <ScrollView style={styles.contactPage} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <Text style={styles.headerSub}>We're here to help. Reach out anytime.</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.h2}>Get in Touch</Text>
        <Text style={styles.p}>
          Have questions about orders, delivery, or products? Our support team
          is always ready to assist you.
        </Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Email:</Text> support@mkgoldcoast.com
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Phone:</Text> +91 98765 43210
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Address:</Text> Hyderabad, India
          </Text>
        </View>
      </View>
    </View>
    <Footer navigation={navigation} />
  </ScrollView>
);

const styles = StyleSheet.create({
  contactPage: { flex: 1, backgroundColor: "#F8FAFC" },
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
  info: {},
  h2: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  p: { fontSize: 15, color: "#64748B", lineHeight: 24, marginBottom: 16 },
  details: {},
  detailText: { fontSize: 15, color: "#64748B", marginBottom: 8 },
  bold: { fontWeight: "700", color: "#1E293B" },
});

export default Contact;
