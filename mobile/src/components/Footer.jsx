import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../theme/colors";

const Footer = ({ navigation }) => (
  <View style={styles.footer}>
    <View style={styles.top}>
      <View style={styles.brand}>
        <Text style={styles.brandName}>MVV</Text>
        <Text style={styles.brandDesc}>
          Fresh groceries delivered to your doorstep.
        </Text>
      </View>

      <View style={styles.links}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
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
      </View>

      <View style={styles.contact}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.contactText}>India</Text>
        <Text style={styles.contactText}>+91 9XXXXXXXXX</Text>
        <Text style={styles.contactText}>support@mkgoldcoast.com</Text>
      </View>
    </View>

    <View style={styles.bottom}>
      <Text style={styles.copyright}>
        Copyright {new Date().getFullYear()} MVV. All rights reserved.
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#EAF6EE",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 32,
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 14,
  },
  top: {
    marginBottom: 16,
  },
  brand: {
    marginBottom: 18,
  },
  brandName: {
    fontSize: 20,
    color: colors.text,
    fontWeight: "700",
    marginBottom: 8,
  },
  brandDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  links: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "700",
    marginBottom: 10,
  },
  link: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  contact: {
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: "rgba(22,48,32,0.12)",
    paddingTop: 12,
  },
  copyright: {
    textAlign: "center",
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default Footer;
