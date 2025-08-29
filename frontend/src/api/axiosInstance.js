import axios from "axios";
import { BASE_URL } from "./api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor to refresh token on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        const res = await axios.post(`${BASE_URL}api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;

        // Save new token
        localStorage.setItem("access_token", newAccess);

        // Update headers
        axiosInstance.defaults.headers["Authorization"] = `Bearer ${newAccess}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        console.log("Generated new Access token");

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (err) {
        // 🔥 Token refresh failed (expired or invalid)
        console.error("Refresh token expired or invalid. Logging out...");

        // OPTIONAL: Hit backend logout endpoint (if session tracking)
        try {
          await axios.post(`${BASE_URL}api/logout/`, null, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
        } catch (logoutErr) {
          console.warn("Backend logout failed or not required.");
        }

        // Clear tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
