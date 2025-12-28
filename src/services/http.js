// src/services/http.ts
import axios from "axios";

// -------------------------------
// Base URL
// -------------------------------
let baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
baseURL = baseURL.trim();
// Keep /api/api if it exists (don't remove double /api/api)
// Only remove trailing slashes
baseURL = baseURL.replace(/\/+$/, ''); // remove trailing slashes

console.log("🌐 HTTP Service initialized with baseURL:", baseURL);

// -------------------------------
// Axios instance
// -------------------------------
export const http = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// -------------------------------
// Request Interceptor
// -------------------------------
http.interceptors.request.use((config) => {
  // Add Authorization token if exists
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Handle FormData - let browser set Content-Type with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  // Handle URL construction - preserve /api/api if baseURL has it
  // Remove leading slash from url to avoid triple slashes, but keep baseURL as is
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }

  // Log request for debugging
  // Build full URL: baseURL already includes /api/api if needed
  const fullURL = config.baseURL && config.url
    ? `${config.baseURL}/${config.url}`
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
}, (error) => Promise.reject(error));

// -------------------------------
// Response Interceptor
// -------------------------------
http.interceptors.response.use(
  (response) => {
    // Log successful response (optional)
    console.log(`✅ HTTP Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn("🔒 401 Unauthorized - Token invalid or expired");
      localStorage.removeItem("token");

      const pathname = window.location.pathname;
      if (pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else if (pathname.startsWith('/engineer')) {
        window.location.href = '/engineer/login';
      } else if (pathname.startsWith('/client')) {
        window.location.href = '/client/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      const backendMessage = error.response?.data?.message || "";
      const pathname = window.location.pathname;
      
      // Log with context
      console.warn("🚫 403 Forbidden:", {
        url: error.config?.url,
        message: backendMessage,
        pathname: pathname
      });

      // For certain endpoints, 403 might mean user needs to re-authenticate
      // or doesn't have the right role
      const requiresReauth = [
        '/proposals/my',
        '/users/me',
        '/projects/my'
      ];
      
      const needsReauth = requiresReauth.some(endpoint => 
        error.config?.url?.includes(endpoint)
      );

      if (needsReauth) {
        // Check if it's a role issue
        if (backendMessage.toLowerCase().includes('engineer') || 
            backendMessage.toLowerCase().includes('مهندسين') ||
            backendMessage.toLowerCase().includes('role')) {
          // User might be logged in with wrong role
          if (pathname.startsWith('/engineer')) {
            console.warn("User may not have engineer role, redirecting to login");
            setTimeout(() => {
              localStorage.removeItem("token");
              window.location.href = '/engineer/login';
            }, 2000);
          }
        } else if (backendMessage.toLowerCase().includes('active') || 
                   backendMessage.toLowerCase().includes('مفعّل')) {
          // Account not activated - don't redirect, just show error
          console.warn("Account not activated");
        }
      }

      // Don't reject immediately - let the component handle it
      // This allows components to show custom error messages
    }

    // Handle optional 404 errors
    // Some endpoints may return 404 which is expected (e.g., chat-rooms that don't exist yet)
    if (error.response?.status === 404) {
      // Only log if it's not a known optional endpoint
      const optionalEndpoints = [
        '/project-rooms/',
        '/chat-rooms/',
        '/messages/unread/count'
      ];
      const isOptionalEndpoint = optionalEndpoints.some(endpoint => 
        error.config?.url?.includes(endpoint)
      );
      
      if (!isOptionalEndpoint) {
        console.warn("⚠️ 404 Not Found:", error.config?.url);
      }
      // Return null data instead of rejecting to allow graceful handling
      return Promise.resolve({ data: null });
    }

    return Promise.reject(error);
  }
);
