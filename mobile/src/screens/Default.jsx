import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Default = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Not accessible</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  text: {
    fontSize: 18,
    color: "#666",
  },
});

export default Default;
