import axios from "axios";

let baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// Normalize baseURL - fix double /api/api and remove trailing slashes
baseURL = baseURL.trim();
// Fix /api/api pattern (could be /api/api/ or /api/api at end, or anywhere)
baseURL = baseURL.replace(/\/api\/api(\/|$)/g, '/api$1');
// Remove trailing slashes
baseURL = baseURL.replace(/\/+$/, '');

console.log("🌐 HTTP Service initialized with baseURL:", baseURL);

export const http = axios.create({
  baseURL: baseURL + '/',
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
  
  // Normalize URL to avoid double slashes
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }
  
  // Log request for debugging
  const fullURL = config.baseURL && config.url 
    ? `${config.baseURL}${config.url}`
    : `${config.baseURL}${config.url}`;
    
  console.log(`📤 HTTP Request: ${config.method?.toUpperCase()} ${fullURL}`, {
    baseURL: config.baseURL,
    url: config.url,
    fullURL: fullURL,
    hasToken: !!token,
    tokenLength: token?.length,
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
    // Log error details for debugging
    if (error.response) {
      console.error(`❌ HTTP Error: ${error.response.status} ${error.response.statusText}`, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    if (error.response?.status === 401) {
      // Token is invalid or expired
      console.warn("🔒 401 Unauthorized - Token invalid or expired");
      localStorage.removeItem("token");
      // Redirect to appropriate login page based on current route
      const pathname = window.location.pathname;
      if (pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else if (pathname.startsWith('/engineer')) {
        window.location.href = '/engineer/login';
      } else if (pathname.startsWith('/client')) {
        window.location.href = '/client/login';
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error("🚫 403 Forbidden - Access denied", {
        url: error.config?.url,
        user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
        token: localStorage.getItem("token") ? "exists" : "missing",
      });
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
        /^\/project-rooms\/[^/]+\/chat-rooms$/, // Chat rooms endpoint - may not exist yet
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