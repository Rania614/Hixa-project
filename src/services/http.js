import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
console.log("🌐 HTTP Service initialized with baseURL:", baseURL);

export const http = axios.create({
  baseURL: baseURL,
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
  
  // Log request for debugging
  console.log(`📤 HTTP Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
    baseURL: config.baseURL,
    url: config.url,
    fullURL: `${config.baseURL}${config.url}`,
    data: config.data,
  });
  
  return config;
});

// Handle 401 errors - redirect to login if token is invalid
// Suppress 404 errors from console (they're expected for optional endpoints)
http.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log(`✅ HTTP Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("token");
      // Redirect to login page
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    // Suppress 404 errors from console for optional endpoints
    // These endpoints may not be implemented yet or are expected to not exist
    if (error.response?.status === 404) {
      const url = error.config?.url || '';
      const expected404Endpoints = [
        '/auth/verify',
        '/admin/me',
        '/content/services-details', // Expected to not exist - we use /content instead
        '/content/upload-image', // Expected to not exist - we try multiple upload endpoints
        '/content/upload', // Expected to not exist - we try multiple upload endpoints
        '/upload-image', // Expected to not exist - we try multiple upload endpoints
        '/upload', // Expected to not exist - we try multiple upload endpoints
      ];
      
      if (expected404Endpoints.some(endpoint => url.includes(endpoint))) {
        // Silently handle 404 for these optional/expected endpoints
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