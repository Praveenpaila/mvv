import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider, useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import store from "./src/store";
import api from "./src/api/api";
import { SAFE_MODE } from "./src/config/apiConfig";
import { AuthContext } from "./src/context/AuthContext";
import { addCat } from "./src/store/category";
import { addToCart } from "./src/store/cart";
import MainLayout from "./src/components/MainLayout";

import Home from "./src/screens/Home";
import Category from "./src/screens/Category";
import ProductItem from "./src/screens/ProductItem";
import Cart from "./src/screens/Cart";
import Address from "./src/screens/Address";
import Login from "./src/screens/Login";
import Signup from "./src/screens/Signup";
import BestSeller from "./src/screens/BestSeller";
import Search from "./src/screens/Search";
import Buynow from "./src/screens/Buynow";
import MyOrder from "./src/screens/MyOrder";
import Profile from "./src/screens/Profile";
import About from "./src/screens/About";
import Contact from "./src/screens/Contact";
import Default from "./src/screens/Default";
import Account from "./src/screens/Account";
import AdminDashboard from "./src/screens/admin/AdminDashboard";
import MerchantDashboard from "./src/screens/merchant/MerchantDashboard";
import DeliveryDashboard from "./src/screens/delivery/DeliveryDashboard";
import SecurityLogin from "./src/screens/security/SecurityLogin";
import SecurityDashboard from "./src/screens/security/SecurityDashboard";
import colors from "./src/theme/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppContent() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        const [storedToken, storedRole] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("role"),
        ]);
        if (storedToken) setToken(storedToken);
        if (storedRole) setRole(storedRole);
      } catch (e) {
        console.log("Init error", e);
      } finally {
        setIsReady(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (token) AsyncStorage.setItem("token", token);
    else AsyncStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (role) AsyncStorage.setItem("role", role);
    else AsyncStorage.removeItem("role");
  }, [role]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await api.get("/home");
        if (res.data?.category) dispatch(addCat(res.data.category));
        else dispatch(addCat([]));
      } catch (err) {
        if (!SAFE_MODE) {
          Toast.show({ type: "error", text1: "Backend not connected" });
        }
        dispatch(addCat([]));
      }
    };
    getCategories();
  }, [dispatch]);

  useEffect(() => {
    const loadCart = async () => {
      if (!token) return;
      try {
        const res = await api.get("/cart");
        if (res.data?.success && Array.isArray(res.data.cart)) {
          res.data.cart.forEach((item) => {
            // Backend may return productId as populated object or raw id
            const productId = item.productId && typeof item.productId === "object" && item.productId._id != null
              ? item.productId._id
              : item.productId;
            if (productId != null) {
              dispatch(
                addToCart({ _id: String(productId), quantity: item.quantity }),
              );
            }
          });
        }
      } catch (err) {
        console.log("Cart load failed", err);
      }
    };
    loadCart();
  }, [dispatch, token]);

  if (!isReady) return null;

  return (
    <AuthContext.Provider value={{ token, setToken, role, setRole }}>
      <AppNavigator token={token} setToken={setToken} role={role} setRole={setRole} />
    </AuthContext.Provider>
  );
}

function MainTabs({ token, setToken, setRole }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: () => <TabIcon icon={"\u{1F3E0}"} />,
        }}
      >
        {(props) => (
          <MainLayout
            navigation={props.navigation}
            setToken={setToken}
            token={token}
            safeMode={SAFE_MODE}
          >
            <Home {...props} />
          </MainLayout>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="ExploreTab"
        options={{
          tabBarLabel: "Explore",
          tabBarIcon: () => <TabIcon icon={"\u2728"} />,
        }}
      >
        {(props) => (
          <MainLayout
            navigation={props.navigation}
            setToken={setToken}
            token={token}
            safeMode={SAFE_MODE}
          >
            <BestSeller {...props} />
          </MainLayout>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="CartTab"
        options={{
          tabBarLabel: "Cart",
          tabBarIcon: () => <TabIcon icon={"\u{1F6D2}"} />,
        }}
      >
        {(props) => (
          <MainLayout
            navigation={props.navigation}
            setToken={setToken}
            token={token}
            safeMode={SAFE_MODE}
          >
            <Cart {...props} />
          </MainLayout>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="AccountTab"
        options={{
          tabBarLabel: "Account",
          tabBarIcon: () => <TabIcon icon={"\u{1F464}"} />,
        }}
      >
        {(props) => (
          <MainLayout
            navigation={props.navigation}
            setToken={setToken}
            token={token}
            safeMode={SAFE_MODE}
          >
            <Account {...props} />
          </MainLayout>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function TabIcon({ icon }) {
  const { Text } = require("react-native");
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}

function AppNavigator({ token, setToken, setRole, role }) {
  const getInitialRoute = () => {
    if (token && role) {
      const roleRoutes = {
        admin: "AdminPanel",
        merchant: "MerchantPanel",
        deliveryPerson: "DeliveryPanel",
        security: "SecurityPanel",
      };
      return roleRoutes[role] || "Main";
    }
    return "Main";
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Main">
          {(props) => (
            <MainTabs
              {...props}
              token={token}
              setToken={setToken}
              setRole={setRole}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Category">
          {(props) => (
            <MainLayout
              navigation={props.navigation}
              setToken={setToken}
              token={token}
              safeMode={SAFE_MODE}
            >
              <Category {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="ProductItem">
          {(props) => (
            <MainLayout
              navigation={props.navigation}
              setToken={setToken}
              token={token}
              safeMode={SAFE_MODE}
            >
              <ProductItem {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Address">
          {(props) => (
            <MainLayout
              navigation={props.navigation}
              setToken={setToken}
              token={token}
              safeMode={SAFE_MODE}
            >
              <Address {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Search">
          {(props) => (
            <MainLayout
              navigation={props.navigation}
              setToken={setToken}
              token={token}
              safeMode={SAFE_MODE}
            >
              <Search {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Buynow" component={Buynow} />
        <Stack.Screen name="MyOrder">
          {(props) => (
            <MainLayout
              navigation={props.navigation}
              setToken={setToken}
              token={token}
              safeMode={SAFE_MODE}
            >
              <MyOrder {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {(props) => (
            <MainLayout
              navigation={props.navigation}
              setToken={setToken}
              token={token}
              safeMode={SAFE_MODE}
            >
              <Profile {...props} setToken={setToken} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="About">
          {(props) => (
            <MainLayout
              navigation={props.navigation}
              setToken={setToken}
              token={token}
              safeMode={SAFE_MODE}
            >
              <About {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Contact">
          {(props) => (
            <MainLayout
              navigation={props.navigation}
              setToken={setToken}
              token={token}
              safeMode={SAFE_MODE}
            >
              <Contact {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Login">
          {(props) => (
            <Login
              {...props}
              setToken={setToken}
              setRole={setRole}
              navigation={props.navigation}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Signup">
          {(props) => (
            <Signup
              {...props}
              setToken={setToken}
              setRole={setRole}
              navigation={props.navigation}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Default" component={Default} />

        {/* Role-based panels */}
        <Stack.Screen name="AdminPanel">
          {(props) => (
            <AdminDashboard
              {...props}
              setToken={setToken}
              setRole={setRole}
              navigation={props.navigation}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="MerchantPanel">
          {(props) => (
            <MerchantDashboard
              {...props}
              setToken={setToken}
              setRole={setRole}
              navigation={props.navigation}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="DeliveryPanel">
          {(props) => (
            <DeliveryDashboard
              {...props}
              setToken={setToken}
              setRole={setRole}
              navigation={props.navigation}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SecurityPanel">
          {(props) => (
            <SecurityDashboard
              {...props}
              navigation={props.navigation}
              setToken={setToken}
              setRole={setRole}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SecurityLogin">
          {(props) => (
            <SecurityLogin
              {...props}
              navigation={props.navigation}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
      <Toast />
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}


