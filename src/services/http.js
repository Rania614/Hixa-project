// src/services/http.ts
import axios from "axios";

// -------------------------------
// Base URL
// -------------------------------
let baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
baseURL = baseURL.trim();
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

  // Remove leading slash to avoid double slashes in URL
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }

  // Log request for debugging
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

    // Handle optional 404 errors
    if (error.response?.status === 404) {
      console.warn("⚠️ 404 Not Found (optional endpoint):", error.config.url);
      return Promise.resolve({ data: null });
    }

    return Promise.reject(error);
  }
);
