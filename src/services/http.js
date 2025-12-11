import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header automatically
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData - let browser set it automatically with boundary
  if (config.data instanceof FormData) {
    // Remove Content-Type header to let browser set it with proper boundary
    delete config.headers['Content-Type'];
    // Also remove from common headers if exists
    if (config.headers.common) {
      delete config.headers.common['Content-Type'];
    }
  }
  return config;
});

// Handle 401 errors - redirect to login if token is invalid
// Suppress 404 errors from console (they're expected for optional endpoints)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("token");
      // Redirect to login page
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    // Suppress 404 errors from console for optional endpoints (auth/verify, admin/me)
    // These endpoints may not be implemented yet
    if (error.response?.status === 404) {
      const url = error.config?.url || '';
      if (url.includes('/auth/verify') || url.includes('/admin/me')) {
        // Silently handle 404 for these optional endpoints
        // Mark error as silent to prevent console logging
        error.silent = true;
        // Don't log to console - these are expected 404s
      } else {
        // Log other 404 errors normally
        console.error('404 Error:', error.config?.url);
      }
    }
    return Promise.reject(error);
  }
);