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
import { Title } from "../components/Title";
import api from "../api/api";
import { SAFE_MODE } from "../config/apiConfig";
import Toast from "react-native-toast-message";

const Signup = ({ setToken, setRole, navigation }) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async () => {
    if (!userName || !email || !phoneNumber || !password) {
      Toast.show({ type: "error", text1: "Enter all details" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", {
        userName,
        email,
        phoneNumber,
        password,
      });
      if (res.data?.success) {
        setRole?.(res.data.user.role);
        setToken?.(res.data.token);
        Toast.show({
          type: "success",
          text1: res.data.message || "Signup successful",
        });
        navigation?.replace?.("Main", { screen: "HomeTab" });
      } else {
        Toast.show({ type: "error", text1: res.data?.message || "Signup failed" });
      }
    } catch (err) {
      const msg =
        SAFE_MODE
          ? "Demo mode: Signup disabled (backend not connected)"
          : err.response?.data?.message || "Server not connected";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Title text1="Signup" text2="" />
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#888"
              value={userName}
              onChangeText={setUserName}
            />
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
              placeholder="Phone Number"
              placeholderTextColor="#888"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
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
                {loading ? "Signing up..." : "Signup"}
              </Text>
            </TouchableOpacity>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation?.navigate?.("Login")}>
                <Text style={styles.footerLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 40,
    paddingBottom: 280,
  },
  card: {
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

export default Signup;
