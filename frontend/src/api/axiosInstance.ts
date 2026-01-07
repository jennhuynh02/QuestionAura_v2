import axios from "axios";
import { getDemoToken } from "../contexts/authStore";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add demo token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const demoToken = getDemoToken();
  if (demoToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${demoToken}`;
  }
  return config;
});

export default axiosInstance;
