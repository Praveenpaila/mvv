import axios from "axios";

// Use relative /api in dev (Vite proxy forwards to backend); override with env in production
const baseURL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("token_expiry");

    if (token && expiry && Date.now() > Number(expiry)) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expiry");
      localStorage.removeItem("role");

      window.location.href = "/login";
      return Promise.reject(new axios.Cancel("Token expired"));
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expiry");
      localStorage.removeItem("role");

      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
