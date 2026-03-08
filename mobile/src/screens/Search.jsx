import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DisplayProducts from "./DisplayProducts";
import api from "../api/api";
import colors from "../theme/colors";
import { useScrollToTopOnFocus } from "../hooks/useScrollToTopOnFocus";

const Search = ({ route, navigation }) => {
  const initialQuery = route.params?.q || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const scrollRef = useRef(null);
  useScrollToTopOnFocus(scrollRef);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setItems([]);
        setHasSearched(false);
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) {
      setItems([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.get(`/search/${encodeURIComponent(query.trim())}`);
      if (res.data?.products) {
        setItems(res.data.products);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.log("Search error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search products..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus={!initialQuery}
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          activeOpacity={0.7}
        >
          <Text style={styles.searchIcon}>{"\u{1F50D}"}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : hasSearched && items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>{"\u{1F50D}"}</Text>
          <Text style={styles.empty}>No products found</Text>
          <Text style={styles.emptySubtext}>
            Try searching with different keywords
          </Text>
        </View>
      ) : !hasSearched ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>{"\u{1F50D}"}</Text>
          <Text style={styles.empty}>Start searching for products</Text>
          <Text style={styles.emptySubtext}>
            Enter a product name above to search
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.resultCount}>
            Found {items.length} {items.length === 1 ? "product" : "products"}
          </Text>
          <View style={styles.grid}>
            {items.map((item, idx) => (
              <DisplayProducts
                key={item._id != null ? String(item._id) : `search-${idx}`}
                item={item}
                navigation={navigation}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBtn: {
    marginLeft: 10,
    width: 42,
    height: 42,
    backgroundColor: colors.primary,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    fontSize: 18,
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  resultCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  empty: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default Search;
