import React, { useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import colors from "../theme/colors";
import { useScrollToTopOnFocus } from "../hooks/useScrollToTopOnFocus";

const MenuItem = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuTitle}>{title}</Text>
    <Text style={styles.menuArrow}>{">"}</Text>
  </TouchableOpacity>
);

const Account = ({ navigation }) => {
  const { token } = useAuth();
  const scrollRef = useRef(null);
  useScrollToTopOnFocus(scrollRef);

  return (
    <ScrollView
      ref={scrollRef}
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
              icon={"\u{1F464}"}
              title="Profile"
              onPress={() => navigation?.navigate?.("Profile")}
            />
            <MenuItem
              icon={"\u{1F4E6}"}
              title="My Orders"
              onPress={() => navigation?.navigate?.("MyOrder")}
            />
          </>
        ) : (
          <MenuItem
            icon={"\u{1F510}"}
            title="Login / Sign up"
            onPress={() => navigation?.navigate?.("Login")}
          />
        )}
        <MenuItem
          icon={"\u2139\uFE0F"}
          title="About"
          onPress={() => navigation?.navigate?.("About")}
        />
        <MenuItem
          icon={"\u{1F4DE}"}
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
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  menuArrow: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "700",
  },
});

export default Account;
