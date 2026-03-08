import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import colors from "../theme/colors";

const MainLayout = ({ children, navigation, setToken, token, safeMode }) => {
  if (!navigation) return <>{children}</>;
  return (
    <SafeAreaView style={styles.layout} edges={["top"]}>
      {safeMode && (
        <View style={styles.safeModeBanner}>
          <Text style={styles.safeModeText}>Demo mode – Backend not connected</Text>
        </View>
      )}
      <Header navigation={navigation} setToken={setToken} token={token} />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeModeBanner: {
    backgroundColor: "#F59E0B",
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  safeModeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  layout: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});

export default MainLayout;
