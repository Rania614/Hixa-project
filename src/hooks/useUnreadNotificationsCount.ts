import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '@/services/notificationsApi';

interface UseUnreadNotificationsCountOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Custom hook for managing unread notifications count
 * 
 * Features:
 * - Fetches unread notifications count
 * - Auto-refreshes at specified interval
 * - Returns loading and error states
 */
export const useUnreadNotificationsCount = (
  options: UseUnreadNotificationsCountOptions = {}
) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const count = await notificationsApi.getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'فشل في جلب عدد الإشعارات';
      setError(errorMessage);
      console.error('Error fetching unread count:', err);
      // Don't set error state for 404 - it's expected when there are no notifications
      if (err.response?.status !== 404) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    if (!autoRefresh) return;

    const interval = setInterval(fetchCount, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchCount]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchCount,
  };
};

