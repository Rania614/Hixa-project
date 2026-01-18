// src/services/http.ts
import axios from "axios";

// -------------------------------
// Base URL
// -------------------------------
let baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
baseURL = baseURL.trim();

// Fix: localhost doesn't support HTTPS - convert https://localhost to http://localhost
if (baseURL.startsWith('https://localhost') || baseURL.startsWith('https://127.0.0.1')) {
  console.warn("⚠️ Detected HTTPS on localhost - converting to HTTP");
  baseURL = baseURL.replace(/^https:\/\//, 'http://');
}

// Keep /api/api if it exists (don't remove double /api/api)
// Only remove trailing slashes
baseURL = baseURL.replace(/\/+$/, ''); // remove trailing slashes

console.log("🌐 HTTP Service initialized with baseURL:", baseURL);

// -------------------------------
// Access Token Storage (in-memory + localStorage for backward compatibility)
// -------------------------------
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

// -------------------------------
// Axios instance
// -------------------------------
export const http = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Send cookies (including refreshToken HttpOnly cookie)
});

// -------------------------------
// Request Interceptor
// -------------------------------
http.interceptors.request.use((config) => {
  // Use in-memory token first, fallback to localStorage
  const token = accessToken || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Handle FormData - let browser set Content-Type with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  // Handle URL construction - preserve /api/api if baseURL has it
  // Normalize URL to avoid double slashes
  if (config.url) {
    // Remove leading slash from url
    config.url = config.url.replace(/^\/+/, '');
  }

  // Build full URL properly
  let fullURL = '';
  if (config.baseURL && config.url) {
    // Ensure baseURL doesn't end with / and url doesn't start with /
    const cleanBaseURL = config.baseURL.replace(/\/+$/, '');
    const cleanURL = config.url.replace(/^\/+/, '');
    fullURL = `${cleanBaseURL}/${cleanURL}`;
  } else if (config.baseURL) {
    fullURL = config.baseURL;
  } else if (config.url) {
    fullURL = config.url;
  }

  console.log(`📤 HTTP Request: ${config.method?.toUpperCase()} ${fullURL}`, {
    baseURL: config.baseURL,
    url: config.url,
    fullURL: fullURL,
    hasToken: !!token,
    tokenLength: token?.length,
    origin: window.location.origin,
    data: config.data instanceof FormData ? '[FormData]' : config.data,
  });

  return config;
}, (error) => Promise.reject(error));

// -------------------------------
// Response Interceptor
// -------------------------------
http.interceptors.response.use(
  (response) => {
    console.log(`✅ HTTP Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    
    // Update access token if response contains a new one (from login/register/refresh)
    if (response.data?.accessToken || response.data?.token) {
      const newToken = response.data.accessToken || response.data.token;
      setAccessToken(newToken);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't retry refresh token endpoint to avoid infinite loop
      if (originalRequest.url?.includes('/auth/refresh')) {
        console.warn("🔒 401 on refresh endpoint - Clearing tokens and redirecting");
        setAccessToken(null);
        localStorage.removeItem("user");

        const pathname = window.location.pathname;
        if (pathname.startsWith('/admin')) window.location.href = '/admin/login';
        else if (pathname.startsWith('/engineer') || pathname.startsWith('/company')) window.location.href = '/auth/partner';
        else if (pathname.startsWith('/client')) window.location.href = '/client/login';
        return Promise.reject(error);
      }

      try {
        console.log("🔄 Attempting to refresh access token...");
        // Try to get new access token using refresh token from cookie
        const refreshResponse = await http.post('/auth/refresh');
        
        if (refreshResponse.data?.accessToken || refreshResponse.data?.token) {
          const newAccessToken = refreshResponse.data.accessToken || refreshResponse.data.token;
          setAccessToken(newAccessToken);
          
          // Update user data if provided
          if (refreshResponse.data?.user) {
            localStorage.setItem("user", JSON.stringify(refreshResponse.data.user));
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log("✅ Token refreshed, retrying original request");
          return http(originalRequest);
        }
      } catch (refreshError) {
        console.warn("❌ Failed to refresh token:", refreshError);
        // Refresh failed - clear tokens and redirect to login
        setAccessToken(null);
        localStorage.removeItem("user");

        const pathname = window.location.pathname;
        if (pathname.startsWith('/admin')) window.location.href = '/admin/login';
        else if (pathname.startsWith('/engineer') || pathname.startsWith('/company')) window.location.href = '/auth/partner';
        else if (pathname.startsWith('/client')) window.location.href = '/client/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      const backendMessage = error.response?.data?.message || "";
      const pathname = window.location.pathname;
      console.warn("🚫 403 Forbidden:", { url: error.config?.url, message: backendMessage, pathname });

      const requiresReauth = ['/proposals/my','/users/me','/projects/my'];
      const needsReauth = requiresReauth.some(endpoint => error.config?.url?.includes(endpoint));

      if (needsReauth) {
        if (backendMessage.toLowerCase().includes('engineer') || backendMessage.toLowerCase().includes('مهندسين') || backendMessage.toLowerCase().includes('role')) {
          if (pathname.startsWith('/engineer')) {
            console.warn("User may not have engineer role, redirecting to login");
            setTimeout(() => {
              localStorage.removeItem("token");
              window.location.href = '/engineer/login';
            }, 2000);
          }
        } else if (backendMessage.toLowerCase().includes('active') || backendMessage.toLowerCase().includes('مفعّل')) {
          console.warn("Account not activated");
        }
      }
    }

    if (error.response?.status === 404) {
      const optionalEndpoints = ['/project-rooms/','/chat-rooms/','/messages/unread/count'];
      const isOptionalEndpoint = optionalEndpoints.some(endpoint => error.config?.url?.includes(endpoint));
      if (!isOptionalEndpoint) console.warn("⚠️ 404 Not Found:", error.config?.url);
      return Promise.resolve({ data: null });
    }

    // Handle 429 Too Many Requests - Rate Limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'] || error.response?.headers?.['Retry-After'];
      const retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : 5000; // Default 5 seconds
      
      // Check if this request has already been retried
      const retryCount = error.config.__retryCount || 0;
      const maxRetries = 2; // Maximum 2 retries
      
      if (retryCount < maxRetries) {
        console.warn(`⏳ 429 Too Many Requests - Retrying (${retryCount + 1}/${maxRetries}) after ${retryDelay}ms:`, error.config?.url);
        
        // Mark this request as retried
        error.config.__retryCount = retryCount + 1;
        
        // Wait before retrying with exponential backoff
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(http.request(error.config));
          }, retryDelay * (retryCount + 1)); // Exponential backoff: 5s, 10s, 15s
        });
      } else {
        console.error("❌ 429 Too Many Requests - Max retries reached:", error.config?.url);
        // Return a graceful error response instead of rejecting
        return Promise.reject({
          ...error,
          isRateLimitError: true,
          message: 'Too many requests. Please wait a moment and try again.',
        });
      }
    }

    // Handle Network Errors (ERR_NETWORK, ECONNREFUSED, etc.)
    if (!error.response) {
      // Network error - no response from server
      const errorMessage = error.message || 'Network Error';
      const errorCode = error.code || 'ERR_NETWORK';
      
      const attemptedURL = error.config?.baseURL && error.config?.url 
        ? `${error.config.baseURL.replace(/\/+$/, '')}/${error.config.url.replace(/^\/+/, '')}` 
        : error.config?.url || 'unknown';
      
      // Only log network errors in development or for non-optional endpoints
      // For optional endpoints like /messages/unread/count, log as warning instead
      const isOptionalEndpoint = error.config?.url?.includes('unread/count') || 
                                 error.config?.url?.includes('notifications');
      
      if (isOptionalEndpoint) {
        // For optional endpoints, just log a warning (less verbose)
        console.warn("⚠️ Network error for optional endpoint:", error.config?.url);
      } else {
        // For required endpoints, log full error details
        console.error("🌐 Network Error:", {
          message: errorMessage,
          code: errorCode,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          attemptedURL: attemptedURL,
          currentOrigin: window.location.origin,
          envBaseURL: import.meta.env.VITE_API_BASE_URL,
        });

        // Check if it's a CORS error
        if (errorMessage.includes('CORS') || errorMessage.includes('cors') || errorCode === 'ERR_NETWORK') {
          console.error("🚫 CORS or Network Error - Possible causes:");
          console.error("  1. Server is not running");
          console.error("  2. CORS not configured correctly");
          console.error("  3. Wrong baseURL:", baseURL);
          console.error("  4. Network connectivity issue");
          console.error("  5. Firewall blocking the request");
          console.error("🚫 Current baseURL:", baseURL);
          console.error("🚫 Attempted URL:", attemptedURL);
          console.error("🚫 Current origin:", window.location.origin);
        }
      }

      // Check if it's a timeout
      if (errorCode === 'ECONNABORTED' || errorMessage.includes('timeout')) {
        console.error("⏱️ Request timeout - Server took too long to respond");
        console.error("⏱️ Try increasing timeout or check server performance");
      }

      // Check if it's connection refused
      if (errorCode === 'ECONNREFUSED' || errorMessage.includes('refused')) {
        console.error("🔌 Connection Refused - Server might not be running");
        console.error("🔌 Check if the server is running on:", baseURL);
      }

      // Don't reject for network errors in some cases - let the component handle it
      // But log it for debugging
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: errorMessage,
        code: errorCode,
        attemptedURL: attemptedURL,
      });
    }

    return Promise.reject(error);
  }
);
