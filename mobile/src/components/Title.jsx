import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const Title = ({ text1, text2 }) => (
  <View style={styles.title}>
    <Text style={styles.heading}>
      <Text style={styles.primary}>{text1} </Text>
      <Text style={styles.secondary}>{text2}</Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
  },
  primary: {
    color: "#333",
  },
  secondary: {
    color: "#2ecc71",
  },
});
