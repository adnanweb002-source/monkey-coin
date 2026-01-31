import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const BE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: BE_URL,
  timeout: 30000,
  withCredentials: true, // 🔴 REQUIRED FOR COOKIES
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * RESPONSE INTERCEPTOR
 * Handles expired access token → refresh via cookie
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // 🔑 refresh token is already in cookie
        await api.post("/auth/refresh");

        // retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // refresh failed → logout
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Helper to extract error message export
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
export default api;
