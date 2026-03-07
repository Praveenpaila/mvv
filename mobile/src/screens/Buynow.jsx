import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";

const Buynow = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.card}>
      <View style={styles.checkmarkWrapper}>
        <Text style={styles.checkmark}>✓</Text>
      </View>
      <Text style={styles.title}>Order Placed Successfully!</Text>
      <Text style={styles.subtitle}>
        Thank you for shopping with us. Your order is being processed and will
        be delivered soon.
      </Text>
      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => {
          // Reset navigation stack and navigate to Home tab
          navigation?.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "Main",
                  state: {
                    routes: [{ name: "HomeTab" }],
                    index: 0,
                  },
                },
              ],
            })
          );
        }}
      >
        <Text style={styles.homeBtnText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  checkmarkWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "700",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  homeBtn: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  homeBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default Buynow;
