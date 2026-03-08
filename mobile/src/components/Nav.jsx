import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Pressable,
} from "react-native";
import { useDispatch } from "react-redux";
import { clearCart } from "../store/cart";

const PLACEHOLDER_LOGO =
  "https://via.placeholder.com/40x40/2ecc71/ffffff?text=MK";

const Nav = ({ navigation, setToken, token }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = React.useState("");

  const logoutHandler = () => {
    setToken?.(null);
    dispatch(clearCart());
    navigation?.replace?.("Login");
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation?.navigate?.("Search", { q: searchQuery.trim() });
    }
  };

  if (!navigation) return null;

  return (
    <View style={styles.nav}>
      <TouchableOpacity
        style={styles.logo}
        onPress={() => navigation?.navigate?.("Main", { screen: "HomeTab" })}
      >
        <Image
          source={{ uri: PLACEHOLDER_LOGO }}
          style={styles.logoImg}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>MVV</Text>
      </TouchableOpacity>

      <View style={styles.search}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <View style={styles.links}>
        <TouchableOpacity
          onPress={() => navigation?.navigate?.("Main", { screen: "HomeTab" })}
        >
          <Text style={styles.link}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation?.navigate?.("Main", { screen: "ExploreTab" })}
        >
          <Text style={styles.link}>BestSeller</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.navigate?.("About")}>
          <Text style={styles.link}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.navigate?.("Contact")}>
          <Text style={styles.link}>Contact</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        {token ? (
          <>
            <Pressable
              onPress={() => navigation?.navigate?.("Profile")}
              style={styles.profileBtn}
            >
              <Text style={styles.icon}>👤</Text>
            </Pressable>
            <TouchableOpacity
              onPress={() => navigation?.navigate?.("Main", { screen: "CartTab" })}
              style={styles.cartBtn}
            >
              <Text style={styles.icon}>🛒</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation?.navigate?.("MyOrder")}
              style={styles.profileBtn}
            >
              <Text style={styles.icon}>📦</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logoutHandler}>
              <Text style={styles.logout}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={() => navigation?.navigate?.("Login")}>
            <Text style={styles.login}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexWrap: "wrap",
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  search: {
    flex: 1,
    minWidth: 120,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  links: {
    flexDirection: "row",
  },
  link: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileBtn: {
    padding: 4,
  },
  cartBtn: {
    padding: 4,
  },
  icon: {
    fontSize: 20,
  },
  logout: {
    fontSize: 13,
    color: "#e74c3c",
    fontWeight: "600",
  },
  login: {
    fontSize: 14,
    color: "#2ecc71",
    fontWeight: "600",
  },
});

export default Nav;

