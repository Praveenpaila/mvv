import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title } from "../components/Title";
import api from "../api/api";
import { SAFE_MODE } from "../config/apiConfig";
import Toast from "react-native-toast-message";

const Login = ({ setToken, setRole, navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Enter all details" });
      return;
    }
    setLoading(true);
    try {
      // Force-timeout login so UI never hangs on "Logging in..."
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      const res = await api.post(
        "/auth/login",
        { email, password },
        { signal: controller.signal },
      );
      clearTimeout(timeoutId);

      if (res.data?.success) {
        setToken?.(res.data.token);
        const userRole = res.data.user.role;
        setRole?.(userRole);

        Toast.show({ type: "success", text1: "Login successful" });

        // Route each role to its dedicated panel
        const roleRoutes = {
          admin: "AdminPanel",
          merchant: "MerchantPanel",
          deliveryPerson: "DeliveryPanel",
          security: "SecurityPanel",
          user: "Main",
        };
        const target = roleRoutes[userRole] || "Main";

        if (target === "Main") {
          navigation?.replace?.("Main", { screen: "HomeTab" });
        } else {
          navigation?.replace?.(target);
        }
      } else {
        Toast.show({
          type: "error",
          text1: res.data?.message || "Login failed",
        });
      }
    } catch (err) {
      console.log("Login error", err?.message, err?.response?.data);

      let msg = "Login failed";
      let description;

      if (SAFE_MODE) {
        msg = "Demo mode: Login disabled (backend not connected)";
      } else if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
        msg = "Server not connected";
        description = "Request timed out. Check IP/Wi‑Fi and ensure backend is running.";
      } else if (err.response) {
        // Backend responded with an error (e.g. wrong password, email not found)
        msg = err.response.data?.message || "Incorrect email or password";
      } else if (err.request) {
        // Request made but no response -> server not reachable / network issue
        msg = "Server not connected";
        description = "Please check your Wi‑Fi, IP address, or that the backend is running.";
      } else {
        // Something else (config / unexpected)
        msg = "Unexpected error during login";
        description = err.message;
      }

      Toast.show({
        type: "error",
        text1: msg,
        ...(description ? { text2: description } : {}),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Title text1="Login" text2="" />
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.submit, loading ? styles.submitDisabled : null]}
                onPress={onSubmitHandler}
                disabled={loading}
              >
                <Text style={styles.submitText}>
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation?.navigate?.("Signup")}>
                  <Text style={styles.footerLink}>Create an account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 280,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  form: { marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  submit: {
    backgroundColor: "#2ecc71",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitDisabled: { backgroundColor: "#95a5a6" },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  footerText: { fontSize: 14, color: "#666" },
  footerLink: { fontSize: 14, color: "#2ecc71", fontWeight: "600" },
});

export default Login;
