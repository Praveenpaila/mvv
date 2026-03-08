import React, { useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Footer from "../components/Footer";
import colors from "../theme/colors";
import { useScrollToTopOnFocus } from "../hooks/useScrollToTopOnFocus";

const About = ({ navigation }) => {
  const scrollRef = useRef(null);
  useScrollToTopOnFocus(scrollRef);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.aboutPage}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>About MVV</Text>
          <Text style={styles.headerSub}>
            Fresh groceries delivered to your doorstep in minutes.
          </Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.h2}>Who We Are</Text>
          <Text style={styles.p}>
            MVV is a fast and reliable online grocery delivery platform inspired by
            modern quick-commerce services like Blinkit. We focus on delivering
            fresh fruits, vegetables, and daily essentials quickly.
          </Text>
          <Text style={styles.h2}>Our Mission</Text>
          <Text style={styles.p}>
            To simplify everyday shopping by providing quality products,
            affordable prices, and super-fast delivery from the comfort of your
            home.
          </Text>
          <Text style={styles.h2}>Why Choose Us?</Text>
          <Text style={styles.li}>- Fresh and quality products</Text>
          <Text style={styles.li}>- Fast delivery</Text>
          <Text style={styles.li}>- Trusted local sourcing</Text>
          <Text style={styles.li}>- Easy and secure shopping</Text>
        </View>
      </View>
      <Footer navigation={navigation} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  aboutPage: { flex: 1, backgroundColor: colors.background },
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
    marginTop: 16,
    marginBottom: 8,
  },
  p: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 8 },
  li: { fontSize: 15, color: colors.textSecondary, marginBottom: 4 },
});

export default About;
