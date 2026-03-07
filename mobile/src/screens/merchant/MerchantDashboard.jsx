import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MerchantHome from "./MerchantHome";
import MerchantUpload from "./MerchantUpload";
import MerchantOrders from "./MerchantOrders";

const Tab = createBottomTabNavigator();

function TabIcon({ emoji }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function MerchantDashboard({ navigation, setToken, setRole }) {
  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "role", "token_expiry"]);
    setToken?.(null);
    setRole?.(null);
    navigation.replace("Login");
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#8B5CF6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800", fontSize: 18 },
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Logout</Text>
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: "#8B5CF6",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#E2E8F0", height: 62, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="MDashboard"
        options={{ tabBarLabel: "Dashboard", tabBarIcon: () => <TabIcon emoji="📊" />, headerTitle: "Merchant Panel" }}
      >
        {(props) => <MerchantHome {...props} navigation={props.navigation} />}
      </Tab.Screen>

      <Tab.Screen
        name="MUpload"
        options={{ tabBarLabel: "Upload", tabBarIcon: () => <TabIcon emoji="➕" />, headerTitle: "Upload Product" }}
        component={MerchantUpload}
      />

      <Tab.Screen
        name="MOrders"
        options={{ tabBarLabel: "Orders", tabBarIcon: () => <TabIcon emoji="📋" />, headerTitle: "My Orders" }}
        component={MerchantOrders}
      />
    </Tab.Navigator>
  );
}
