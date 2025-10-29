import axios from "axios";
import { getNafathIdFromJWT } from "./utils/jwt";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// || "https://dev-api.wedo.solutions:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const jwt = localStorage.getItem("userId");
    if (jwt) {
      const nafathId = getNafathIdFromJWT(jwt);
      if (nafathId) {
        config.headers["x-nafath-id"] = jwt;
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
      // Redirect to login- optional
      // localStorage.clear();
      // window.location.href = "/login";
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