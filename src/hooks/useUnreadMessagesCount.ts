import { useState, useEffect, useCallback } from 'react';
import { messagesApi } from '@/services/messagesApi';

interface UnreadCount {
  total: number;
  unreadCounts: Array<{
    chatRoom: string;
    count: number;
  }>;
}

/**
 * Custom hook for managing unread messages count
 * 
 * Features:
 * - Fetches unread messages count
 * - Auto-refreshes at specified interval
 * - Returns loading and error states
 */
export const useUnreadMessagesCount = (refreshInterval: number = 60000) => {
  const [unreadCount, setUnreadCount] = useState<UnreadCount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await messagesApi.getUnreadMessagesCount();
      setUnreadCount(result);
    } catch (err: any) {
      // Don't show error for 429 (Too Many Requests) - just log it silently
      if (err.response?.status === 429) {
        console.warn('Rate limit exceeded for unread messages count. Will retry later.');
        // Don't set error state for rate limiting - it will retry automatically
        setLoading(false);
        return;
      }
      
      // Don't show error for CORS/Network errors (502, ERR_NETWORK, CORS issues)
      // These are usually temporary server issues
      if (
        err.code === 'ERR_NETWORK' || 
        err.message?.includes('CORS') ||
        err.message?.includes('Network Error') ||
        err.response?.status === 502 || // Bad Gateway
        err.response?.status === 503 || // Service Unavailable
        err.response?.status === 504    // Gateway Timeout
      ) {
        console.warn('Network/CORS error fetching unread count. Will retry later.', {
          code: err.code,
          status: err.response?.status,
          message: err.message
        });
        // Don't set error state for network issues - it will retry automatically
        setLoading(false);
        return;
      }
      
      // Only set error for actual API errors (not network/CORS issues)
      const errorMessage = err.response?.data?.message || err.message || 'فشل في جلب عدد الرسائل غير المقروءة';
      setError(errorMessage);
      console.error('Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    
    // Auto-refresh every refreshInterval (default: 60 seconds / 1 minute)
    const interval = setInterval(fetchUnreadCount, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval, fetchUnreadCount]);

  return { 
    unreadCount, 
    loading, 
    error, 
    refetch: fetchUnreadCount 
  };
};

