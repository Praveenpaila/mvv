import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const Footer = ({ navigation }) => (
  <View style={styles.footer}>
    <View style={styles.brand}>
      <Text style={styles.brandName}>MK Gold Coast</Text>
      <Text style={styles.brandDesc}>
        Fresh groceries delivered to your doorstep.
      </Text>
    </View>
    <View style={styles.links}>
      <TouchableOpacity
        onPress={() => navigation?.navigate?.("Main", { screen: "HomeTab" })}
      >
        <Text style={styles.link}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation?.navigate?.("About")}>
        <Text style={styles.link}>About</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation?.navigate?.("Contact")}>
        <Text style={styles.link}>Contact</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation?.navigate?.("Main", { screen: "CartTab" })}
      >
        <Text style={styles.link}>Cart</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.contact}>
      <Text style={styles.contactText}>📍 India</Text>
      <Text style={styles.contactText}>📞 +91 9XXXXXXXXX</Text>
      <Text style={styles.contactText}>✉️ support@mkgoldcoast.com</Text>
    </View>
    <View style={styles.bottom}>
      <Text style={styles.copyright}>
        © {new Date().getFullYear()} MK Gold Coast. All rights reserved.
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#1E293B",
    padding: 24,
    marginTop: 32,
  },
  brand: {
    marginBottom: 20,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  brandDesc: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 22,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  link: {
    fontSize: 14,
    color: "#94A3B8",
    marginRight: 20,
    marginBottom: 8,
  },
  contact: {
    marginBottom: 20,
  },
  contactText: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 4,
  },
  bottom: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  copyright: {
    fontSize: 12,
    color: "#64748B",
  },
});

export default Footer;
