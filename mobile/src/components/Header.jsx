import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useSelector } from "react-redux";
import colors from "../theme/colors";

const LOGO = require("../../assets/mkLogo.png");

const Header = ({ navigation, token, showSearch = true }) => {
  const cartCount = useSelector((state) =>
    (state.cart.cart || []).reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0,
    ),
  );

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.logoRow}
          onPress={() => navigation?.navigate?.("Main", { screen: "HomeTab" })}
          activeOpacity={0.7}
        >
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={styles.logoText}>MVV</Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          {token ? (
            <>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation?.navigate?.("Main", { screen: "CartTab" })}
                activeOpacity={0.7}
              >
                <Text style={styles.icon}>{"\u{1F6D2}"}</Text>
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartCount > 9 ? "9+" : cartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation?.navigate?.("Profile")}
                activeOpacity={0.7}
              >
                <Text style={styles.icon}>{"\u{1F464}"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation?.navigate?.("Login")}
              activeOpacity={0.8}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showSearch && (
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation?.navigate?.("Search", { q: "" })}
          activeOpacity={0.8}
        >
          <Text style={styles.searchIcon}>{"\u{1F50D}"}</Text>
          <Text style={styles.searchPlaceholder}>Search products...</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    borderRadius: 20,
  },
  icon: {
    fontSize: 21,
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 4,
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
  },
  loginText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default Header;
