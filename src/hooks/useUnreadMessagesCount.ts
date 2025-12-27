import { useState, useEffect } from 'react';
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
export const useUnreadMessagesCount = (refreshInterval: number = 30000) => {
  const [unreadCount, setUnreadCount] = useState<UnreadCount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await messagesApi.getUnreadMessagesCount();
      setUnreadCount(result);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'فشل في جلب عدد الرسائل غير المقروءة';
      setError(errorMessage);
      console.error('Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Auto-refresh every refreshInterval (default: 30 seconds)
    const interval = setInterval(fetchUnreadCount, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { 
    unreadCount, 
    loading, 
    error, 
    refetch: fetchUnreadCount 
  };
};

