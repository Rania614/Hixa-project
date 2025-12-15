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
      
      // Patterns for expected 404 endpoints (optional endpoints that may not exist)
      const expected404Patterns = [
        /^\/auth\/verify$/,
        /^\/admin\/me$/,
        /^\/content\/services-details/,
        /^\/content\/services\/details$/,
        /^\/content\/services\/item\d+$/, // Service items: /content/services/item1, item2, etc.
        /^\/content\/services\/item\d+\/details\/detail\d+$/, // Service details like /content/services/item3/details/detail4
        /^\/content\/upload-image/,
        /^\/content\/upload$/,
        /^\/upload-image/,
        /^\/upload$/,
      ];
      
      // Check if this URL matches any expected 404 pattern
      const isExpected404 = expected404Patterns.some(pattern => pattern.test(url));
      
      if (isExpected404) {
        // Silently handle 404 for these optional/expected endpoints
        // Don't log to console - these are expected 404s
        error.silent = true;
      } else {
        // Log other 404 errors normally (these might indicate actual problems)
        // But only log if not already marked as silent
        if (!error.silent) {
          console.error('404 Error:', error.config?.url);
        }
      }
    }
    return Promise.reject(error);
  }
);