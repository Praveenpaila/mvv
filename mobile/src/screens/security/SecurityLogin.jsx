import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { SECURITY_API_URL } from "../../config/apiConfig";

export default function SecurityLogin({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!username || !password) {
      Toast.show({ type: "error", text1: "Enter username and password" });
      return;
    }
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      const res = await fetch(`${SECURITY_API_URL}/watchman/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (data?.role === "security") {
        Toast.show({ type: "success", text1: "Welcome, Watchman!" });
        navigation.replace("SecurityPanel");
      } else {
        Toast.show({ type: "error", text1: data?.error || "Access denied" });
      }
    } catch (err) {
      if (err?.name === "AbortError") {
        Toast.show({ type: "error", text1: "Server not connected", text2: "Check if security backend is running on port 5005" });
      } else {
        Toast.show({ type: "error", text1: "Login failed", text2: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView
        style={s.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            <View style={s.headerRow}>
              <Text style={s.icon}>🔒</Text>
              <Text style={s.title}>Watchman Login</Text>
              <Text style={s.subtitle}>Security personnel only</Text>
            </View>

            <View style={s.form}>
              <TextInput
                style={s.input}
                placeholder="Username"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <TextInput
                style={s.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={[s.submit, loading && s.submitDisabled]}
                onPress={onLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.submitText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={s.backRow}>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={s.backLink}>← Back to main login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FEF2F2" },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 280,
  },
  card: {
    width: "100%", maxWidth: 400, backgroundColor: "#fff", padding: 28, borderRadius: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
  },
  headerRow: { alignItems: "center", marginBottom: 24 },
  icon: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", color: "#DC2626" },
  subtitle: { fontSize: 13, color: "#94A3B8", marginTop: 4 },
  form: { gap: 12 },
  input: {
    borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, backgroundColor: "#fff", color: "#1a1a1a",
  },
  submit: {
    backgroundColor: "#DC2626", paddingVertical: 15, borderRadius: 12,
    alignItems: "center", marginTop: 4,
  },
  submitDisabled: { backgroundColor: "#FCA5A5" },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  backRow: { alignItems: "center", marginTop: 20 },
  backLink: { color: "#64748B", fontSize: 14 },
});
