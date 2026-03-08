import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../theme/colors";

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
    marginTop: 20,
    marginBottom: 18,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
  },
  primary: {
    color: colors.primary,
  },
  secondary: {
    color: colors.text,
  },
});
