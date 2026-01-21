/**
 * trackEvent Utility
 * 
 * Sends user events to the analytics API
 * Fails silently and does not block the UI
 */

interface TrackEventParams {
  event: string;
  page: string;
  userId?: string;
  data?: Record<string, any>;
}

/**
 * Gets or creates a session ID and stores it in localStorage
 */
const getSessionId = (): string => {
  const STORAGE_KEY = 'analytics_session_id';
  const EXPIRE_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { sessionId, timestamp } = JSON.parse(stored);
      const now = Date.now();
      
      // If session is still valid (less than 30 minutes old), return it
      if (now - timestamp < EXPIRE_TIME) {
        return sessionId;
      }
    }
    
    // Create new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      sessionId: newSessionId,
      timestamp: Date.now()
    }));
    
    return newSessionId;
  } catch (error) {
    // If localStorage fails, generate a temporary session ID
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

/**
 * Tracks an event by sending it to the analytics API
 * 
 * @param params - Event tracking parameters
 * @returns Promise that resolves when event is tracked (or silently fails)
 */
export const trackEvent = async (params: TrackEventParams): Promise<void> => {
  const { event, page, userId, data } = params;
  
  try {
    const sessionId = getSessionId();
    
    // Get userId from localStorage if not provided
    let finalUserId = userId;
    if (!finalUserId) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          finalUserId = user._id || user.id || undefined;
        }
      } catch (e) {
        // Silently ignore parsing errors
      }
    }
    
    const payload = {
      event,
      page,
      sessionId,
      userId: finalUserId,
      data: data || {},
      timestamp: new Date().toISOString(),
    };
    
    // Send to API - use fetch directly to avoid axios interceptors
    // and ensure it fails silently
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    const url = baseURL.replace(/\/+$/, '') + '/api/track';
    
    // Use fetch with timeout and don't wait for response
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // Don't include credentials to avoid token issues
      // This is a tracking endpoint that should work without auth
      keepalive: true, // Keep request alive even if page unloads
    }).catch(() => {
      // Silently ignore all errors
      // This ensures the UI is never blocked by tracking failures
    });
    
  } catch (error) {
    // Silently ignore all errors
    // Tracking should never break the application
    if (process.env.NODE_ENV === 'development') {
      console.debug('Event tracking failed (silently ignored):', error);
    }
  }
};

