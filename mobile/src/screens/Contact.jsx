import React, { useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Footer from "../components/Footer";
import colors from "../theme/colors";
import { useScrollToTopOnFocus } from "../hooks/useScrollToTopOnFocus";

const Contact = ({ navigation }) => {
  const scrollRef = useRef(null);
  useScrollToTopOnFocus(scrollRef);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.contactPage}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.headerSub}>We are here to help. Reach out anytime.</Text>
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
};

const styles = StyleSheet.create({
  contactPage: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 100 },
  container: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { marginBottom: 24 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  headerSub: { fontSize: 15, color: colors.textSecondary },
  h2: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  p: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 16 },
  detailText: { fontSize: 15, color: colors.textSecondary, marginBottom: 8 },
  bold: { fontWeight: "700", color: colors.text },
});

export default Contact;
