import axios from "axios";
import { getNafathIdFromJWT } from "./utils/jwt"; // Add this import at the top

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://dev-api.wedo.solutions:3000/api";

// Create axios instance with increased timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "Connection": "keep-alive",
  },
});

// Add request interceptor to include auth token AND x-nafath-id
api.interceptors.request.use(
  (config) => {
    // Add auth token (IMPORTANT - you were missing this)
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add x-nafath-id header
    const jwt = localStorage.getItem("userId");
    if (jwt) {
      const nafathId = getNafathIdFromJWT(jwt);
      if (nafathId) {
        config.headers["x-nafath-id"] = jwt; // Send the JWT itself, as required by backend
      }
    }



    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

//response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      console.error("⏱️ Request timeout - server took too long to respond");
      error.message = "Request timeout. The server is taking too long to respond.";
    }
    
    // Handle network errors
    if (error.message === "Network Error") {
      console.error("🌐 Network error - check your internet connection");
      error.message = "Network error. Please check your internet connection.";
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error("🔒 Unauthorized - token may be expired");
      // Optional: Redirect to login
      // localStorage.clear();
      // window.location.href = "/login";
    }

    console.error("❌ API Error:", {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });

    return Promise.reject(error);
  }
);

export default api;