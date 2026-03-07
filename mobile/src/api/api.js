import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, SAFE_MODE } from "../config/apiConfig";

const PLACEHOLDER_IMG = "https://via.placeholder.com/120x120/f5f5f5/999?text=MK";

const mockCategories = [
  { _id: "cat-01", categoryName: "Vegetables", image: PLACEHOLDER_IMG },
  { _id: "cat-02", categoryName: "Fruits", image: PLACEHOLDER_IMG },
  { _id: "cat-03", categoryName: "Dairy & Eggs", image: PLACEHOLDER_IMG },
  { _id: "cat-04", categoryName: "Bakery", image: PLACEHOLDER_IMG },
  { _id: "cat-05", categoryName: "Beverages", image: PLACEHOLDER_IMG },
  { _id: "cat-06", categoryName: "Snacks", image: PLACEHOLDER_IMG },
];

const mockProducts = [
  {
    _id: "prod-01",
    category: "cat-01",
    name: "Sample Product",
    image: PLACEHOLDER_IMG,
    packSize: "1 kg",
    price: 99,
    stock: 10,
    description: "Sample product for demo",
  },
];

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Prevent requests from hanging forever if server / IP is wrong
  timeout: 8000, // 8 seconds
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    const expiry = await AsyncStorage.getItem("token_expiry");

    if (token && expiry && Date.now() > Number(expiry)) {
      await AsyncStorage.multiRemove(["token", "token_expiry", "role"]);
      return Promise.reject(new axios.Cancel("Token expired"));
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(["token", "token_expiry", "role"]);
    }
    return Promise.reject(err);
  }
);

function mockResponse(data) {
  return Promise.resolve({ data });
}

const api = {
  get: async (url, config) => {
    if (SAFE_MODE) {
      if (url === "/home" || url === "/home/") {
        return mockResponse({ success: true, category: mockCategories });
      }
      if (url.match(/^\/home\/[^/]+$/)) {
        return mockResponse({ success: true, products: mockProducts });
      }
      if (url.match(/^\/search\//)) {
        return mockResponse({ success: true, products: [] });
      }
      if (url === "/cart") {
        return mockResponse({ success: true, cart: [] });
      }
      if (url.match(/^\/cart\//)) {
        return mockResponse({
          sucess: true,
          product: mockProducts[0],
        });
      }
      if (url === "/address") {
        return mockResponse({ success: true, address: [] });
      }
      if (url === "/profile") {
        return mockResponse({
          success: true,
          user: {
            userName: "Demo User",
            email: "demo@example.com",
            phoneNumber: "-",
            role: "user",
            createdAt: new Date().toISOString(),
          },
        });
      }
      if (url === "/orders") {
        return mockResponse({ success: true, orders: [] });
      }
      if (url === "/admin/orders") {
        return mockResponse({ success: true, orders: [] });
      }
      if (url === "/merchant/orders") {
        return mockResponse({ success: true, orders: [] });
      }
      if (url === "/delivery/my") {
        return mockResponse({ success: true, deliveries: [] });
      }
      if (url === "/delivery/profile") {
        return mockResponse({ success: true, deliveryPerson: { name: "Demo Rider", email: "rider@demo.com", phoneNumber: "-", vehicleNumber: "", isActive: true } });
      }
    }
    return axiosInstance.get(url, config);
  },
  post: async (url, data, config) => {
    if (SAFE_MODE) {
      if (url === "/auth/login" || url === "/auth/signup") {
        return Promise.reject({
          response: { data: { message: "Safe mode: Backend not connected" } },
        });
      }
      if (url === "/cart" || url === "/address" || url === "/order") {
        return mockResponse({ success: true, message: "Safe mode" });
      }
    }
    return axiosInstance.post(url, data, config);
  },
  put: async (url, data, config) => {
    if (SAFE_MODE) {
      return mockResponse({ success: true, message: "Safe mode" });
    }
    return axiosInstance.put(url, data, config);
  },
  delete: async (url, config) => {
    if (SAFE_MODE) {
      return mockResponse({ success: true });
    }
    return axiosInstance.delete(url, config);
  },
};

export default api;
