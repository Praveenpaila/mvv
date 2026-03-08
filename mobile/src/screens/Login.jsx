import React, { useRef, useState } from "react";
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
import colors from "../theme/colors";
import { useScrollToTopOnFocus } from "../hooks/useScrollToTopOnFocus";

const Login = ({ setToken, setRole, navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useScrollToTopOnFocus(scrollRef);

  const onSubmitHandler = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Enter all details" });
      return;
    }
    setLoading(true);

    try {
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
        description = "Request timed out. Check IP/Wi-Fi and ensure backend is running.";
      } else if (err.response) {
        msg = err.response.data?.message || "Incorrect email or password";
      } else if (err.request) {
        msg = "Server not connected";
        description = "Please check your Wi-Fi, IP address, or that the backend is running.";
      } else {
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
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Title text1="Login" text2="" />
            <Text style={styles.subtitle}>Welcome back to your grocery dashboard.</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.submit, loading ? styles.submitDisabled : null]}
                onPress={onSubmitHandler}
                disabled={loading}
              >
                <Text style={styles.submitText}>{loading ? "Logging in..." : "Login"}</Text>
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
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 30,
  },
  card: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  subtitle: {
    marginTop: -8,
    marginBottom: 2,
    color: colors.textSecondary,
    fontSize: 14,
  },
  form: { marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#CFDED3",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
    color: colors.text,
    backgroundColor: "#FBFEFC",
  },
  submit: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitDisabled: { backgroundColor: "#95a5a6" },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    flexWrap: "wrap",
    gap: 4,
  },
  footerText: { fontSize: 13, color: colors.textSecondary },
  footerLink: { fontSize: 13, color: colors.primaryDark, fontWeight: "600" },
});

export default Login;
