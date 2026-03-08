import axios from "axios";

// Use relative /api in dev (Vite proxy forwards to backend); override with env in production
const baseURL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({
  baseURL,
});

const getCacheKey = (url, config) => {
  const token = localStorage.getItem("token") || "";
  const params = config?.params || null;
  return `${token}|${url}|${JSON.stringify(params)}`;
};

const getCache = new Map();

api.cachedGet = async (
  url,
  config = {},
  { ttlMs = 30_000, force = false, cacheKey } = {},
) => {
  const key = cacheKey || getCacheKey(url, config);
  const now = Date.now();
  const cached = getCache.get(key);

  if (!force && cached && now - cached.timestamp < ttlMs) {
    return cached.promise;
  }

  const promise = api.get(url, config).catch((err) => {
    getCache.delete(key);
    throw err;
  });

  getCache.set(key, { timestamp: now, promise });
  return promise;
};

api.clearCache = () => {
  getCache.clear();
};

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
