import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdminHome from "./AdminHome";
import AdminUpload from "./AdminUpload";
import AdminOrders from "./AdminOrders";
import AdminManage from "./AdminManage";
import AdminRiders from "./AdminRiders";

const Tab = createBottomTabNavigator();

function TabIcon({ emoji }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function AdminDashboard({ navigation, setToken, setRole }) {
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
        headerStyle: { backgroundColor: "#6366F1" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800", fontSize: 18 },
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Logout</Text>
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#E2E8F0",
          height: 62,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{ tabBarLabel: "Dashboard", tabBarIcon: () => <TabIcon emoji="📊" />, headerTitle: "Admin Dashboard" }}
      >
        {(props) => <AdminHome {...props} navigation={props.navigation} />}
      </Tab.Screen>

      <Tab.Screen
        name="Upload"
        options={{ tabBarLabel: "Upload", tabBarIcon: () => <TabIcon emoji="➕" />, headerTitle: "Upload Product" }}
        component={AdminUpload}
      />

      <Tab.Screen
        name="Orders"
        options={{ tabBarLabel: "Orders", tabBarIcon: () => <TabIcon emoji="📋" />, headerTitle: "Orders" }}
      >
        {(props) => <AdminOrders {...props} />}
      </Tab.Screen>

      <Tab.Screen
        name="Riders"
        options={{ tabBarLabel: "Riders", tabBarIcon: () => <TabIcon emoji="🚚" />, headerTitle: "Delivery Persons" }}
        component={AdminRiders}
      />

      <Tab.Screen
        name="Manage"
        options={{ tabBarLabel: "Manage", tabBarIcon: () => <TabIcon emoji="🛍" />, headerTitle: "Manage Products" }}
        component={AdminManage}
      />
    </Tab.Navigator>
  );
}
