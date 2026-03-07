import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

const MenuItem = ({ icon, title, onPress }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuTitle}>{title}</Text>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

const Account = ({ navigation }) => {
  const { token } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>Manage your account</Text>

      <View style={styles.menuCard}>
        {token ? (
          <>
            <MenuItem
              icon="👤"
              title="Profile"
              onPress={() => navigation?.navigate?.("Profile")}
            />
            <MenuItem
              icon="📦"
              title="My Orders"
              onPress={() => navigation?.navigate?.("MyOrder")}
            />
          </>
        ) : (
          <MenuItem
            icon="🔐"
            title="Login / Sign up"
            onPress={() => navigation?.navigate?.("Login")}
          />
        )}
        <MenuItem
          icon="ℹ️"
          title="About"
          onPress={() => navigation?.navigate?.("About")}
        />
        <MenuItem
          icon="📞"
          title="Contact"
          onPress={() => navigation?.navigate?.("Contact")}
        />
      </View>

      <Footer navigation={navigation} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 24,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  menuArrow: {
    fontSize: 20,
    color: "#94A3B8",
    fontWeight: "300",
  },
});

export default Account;
