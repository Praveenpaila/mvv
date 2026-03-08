import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { clearCart } from "../store/cart";
import api from "../api/api";
import { useScrollToTopOnFocus } from "../hooks/useScrollToTopOnFocus";

const Profile = ({ navigation, setToken }) => {
  const { token } = useAuth();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);
  useScrollToTopOnFocus(scrollRef);

  useEffect(() => {
    if (!token && navigation?.replace) navigation.replace("Login");
  }, [token, navigation]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfileDetails = async () => {
      try {
        const res = await api.get("/profile");
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error(err || "server fault");
      } finally {
        setLoading(false);
      }
    };
    getProfileDetails();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading profile…</Text>
      </View>
    );
  if (!user)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load profile</Text>
      </View>
    );

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.userName?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{user.userName}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{user.phoneNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Role</Text>
            <Text style={[styles.value, styles.role]}>{user.role}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Joined</Text>
            <Text style={styles.value}>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "-"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            setToken?.(null);
            dispatch(clearCart());
            navigation?.replace?.("Login");
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 16, paddingBottom: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { fontSize: 16, color: "#666" },
  error: { fontSize: 16, color: "#e74c3c" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: { fontSize: 24, fontWeight: "700", color: "#fff" },
  name: { fontSize: 20, fontWeight: "700", color: "#333" },
  email: { fontSize: 14, color: "#666", marginTop: 4 },
  details: {},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 14, fontWeight: "600", color: "#333" },
  role: { textTransform: "capitalize" },
  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Profile;
