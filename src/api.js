import axios from "axios";
import { getNafathIdFromJWT } from "./utils/jwt";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  },
});

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // only add x-nafath-id for user-permissions endpoint
    const url = (config.url || "").toLowerCase();
    const needsNafath = url.includes("/auth/user-permissions") || (config.baseURL && (config.baseURL + url).toLowerCase().includes("/auth/user-permissions"));

    if (needsNafath) {
      const jwt = localStorage.getItem("userId");
      if (jwt) {
        const nafathId = getNafathIdFromJWT(jwt);
        if (nafathId) {
          config.headers["x-nafath-id"] = jwt;
        }
      }
    } else {
      // ensure header is not sent for other endpoints
      if (config.headers["x-nafath-id"]) {
        delete config.headers["x-nafath-id"];
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "Request timeout. The server is taking too long to respond.";
    }

    if (error.message === "Network Error") {
      error.message = "Network error. Please check your internet connection.";
    }

    if (error.response?.status === 401) {
      if (import.meta.env.DEV) {
        console.error("🔒 Unauthorized - token may be expired");
      }
    }

    if (import.meta.env.DEV) {
      console.error("❌ API Error:", {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url
      });
    }

    return Promise.reject(error);
  }
);

export default api;
