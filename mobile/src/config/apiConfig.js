/**
 * API Base URL Configuration - connects to same backend as web app
 *
 * SAFE_MODE = true: App works offline, no backend connection. Uses mock data.
 * SAFE_MODE = false: Connects to backend. Ensure backend is running.
 *
 * - Android Emulator: 10.0.2.2 (localhost from emulator's perspective)
 * - iOS Simulator: localhost
 * - Physical Device: Set USE_DEVICE_IP = true and replace DEVICE_IP with your
 *   computer's IP (e.g., 192.168.1.5) - ensure backend and phone are on same network
 */
import { Platform } from "react-native";

export const SAFE_MODE = false;

// Physical device: set true and use your computer's IP (run ipconfig to find it)
const USE_DEVICE_IP = true;
const DEVICE_IP = "172.18.210.46"; // Wi‑Fi IPv4 from ipconfig (gitam.edu)

const getBaseURL = () => {
  try {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      if (USE_DEVICE_IP) {
        return `http://${DEVICE_IP}:3000/api`;
      }
      if (Platform?.OS === "android") {
        return "http://10.0.2.2:3000/api";
      }
      return "http://localhost:3000/api";
    }
  } catch (e) {
    console.warn("apiConfig error:", e);
  }
  return "http://localhost:3000/api";
};

export const API_BASE_URL = getBaseURL();

// Security / Watchman backend (separate server on port 5005)
const getSecurityURL = () => {
  try {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      if (USE_DEVICE_IP) return `http://${DEVICE_IP}:5005`;
      if (Platform?.OS === "android") return "http://10.0.2.2:5005";
      return "http://localhost:5005";
    }
  } catch (e) {}
  return "http://localhost:5005";
};

export const SECURITY_API_URL = getSecurityURL();

// Razorpay Key ID (same as website - from Razorpay Dashboard)
// Use test key for development; replace with live key in production
export const RAZORPAY_KEY_ID = "rzp_test_SHwgaPZxmn05yq";
