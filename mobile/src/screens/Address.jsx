import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import api from "../api/api";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Address = ({ navigation }) => {
  const { token } = useAuth();
  const [firstName, setFirstName] = React.useState("");

  useEffect(() => {
    if (!token && navigation?.replace) navigation.replace("Login");
  }, [token, navigation]);
  const [secondName, setSecondName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [block, setBlock] = React.useState("");
  const [floor, setFloor] = React.useState("");
  const [roomNo, setRoomNo] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");

  const isDigitsOnly = (v) => /^\d+$/.test(String(v || "").trim());

  const onSubmitHandler = async () => {
    // Client-side validation (show friendly popups)
    if (!firstName.trim() || !secondName.trim()) {
      Toast.show({ type: "error", text1: "Enter your first and last name" });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Toast.show({ type: "error", text1: "Enter a valid email address" });
      return;
    }
    if (!isDigitsOnly(block)) {
      Toast.show({ type: "error", text1: "Block must be a number (digits only)" });
      return;
    }
    if (!isDigitsOnly(floor)) {
      Toast.show({ type: "error", text1: "Floor must be a number (digits only)" });
      return;
    }
    if (!isDigitsOnly(roomNo)) {
      Toast.show({ type: "error", text1: "Room number must be digits only" });
      return;
    }
    if (!isDigitsOnly(phoneNumber) || String(phoneNumber).trim().length < 8) {
      Toast.show({ type: "error", text1: "Enter a valid phone number" });
      return;
    }

    const formData = {
      firstName: firstName.trim(),
      secondName: secondName.trim(),
      email: email.trim(),
      block: Number(String(block).trim()),
      floor: Number(String(floor).trim()),
      roomNo: Number(String(roomNo).trim()),
      phoneNumber: Number(String(phoneNumber).trim()),
    };

    try {
      await api.post("/address", formData);
      Toast.show({ type: "success", text1: "Address saved" });
      navigation?.navigate?.("Main", { screen: "CartTab" });
    } catch (err) {
      const raw = err.response?.data?.message;
      // Map ugly server errors to friendly messages (fallback)
      let friendly =
        raw ||
        (err.request
          ? "Server not connected"
          : "Unable to save address. Please try again.");

      if (typeof raw === "string" && raw.toLowerCase().includes("validation failed")) {
        friendly = "Please check your address details (numbers must be digits only).";
      }

      Toast.show({
        type: "error",
        text1: friendly,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.half]}
              placeholder="First Name"
              placeholderTextColor="#888"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={[styles.input, styles.half]}
              placeholder="Last Name"
              placeholderTextColor="#888"
              value={secondName}
              onChangeText={setSecondName}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.half]}
              placeholder="Block"
              placeholderTextColor="#888"
              value={block}
              onChangeText={setBlock}
              keyboardType="number-pad"
            />
            <TextInput
              style={[styles.input, styles.half]}
              placeholder="Floor"
              placeholderTextColor="#888"
              value={floor}
              onChangeText={setFloor}
              keyboardType="number-pad"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Room No"
            placeholderTextColor="#888"
            value={roomNo}
            onChangeText={setRoomNo}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#888"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={styles.submit}
            onPress={onSubmitHandler}
          >
            <Text style={styles.submitText}>Save Address</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 16, paddingBottom: 280 },
  form: { backgroundColor: "#fff", padding: 20, borderRadius: 12 },
  row: { flexDirection: "row" },
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
  half: { flex: 1, marginHorizontal: 4 },
  submit: {
    backgroundColor: "#2ecc71",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default Address;
