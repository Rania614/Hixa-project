import { useState, useEffect, useCallback } from 'react';
import {
  notificationsApi,
  Notification,
  NotificationsResponse,
} from '@/services/notificationsApi';

interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Custom hook for managing notifications
 * 
 * Features:
 * - Fetches notifications with pagination
 * - Auto-refresh at specified interval
 * - Mark notification as read
 * - Delete notification
 * - Pagination controls
 */
export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const {
    page: initialPage = 1,
    limit = 20,
    unreadOnly = false,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<NotificationsResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await notificationsApi.getNotifications({
        page,
        limit,
        unreadOnly,
      });
      setNotifications(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'فشل في جلب الإشعارات';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const updated = await notificationsApi.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? updated : n))
      );
      return updated;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'فشل في تحديد الإشعار كمقروء';
      console.error('Error marking notification as read:', err);
      throw new Error(errorMessage);
    }
  }, []);

  const removeNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      
      // Update meta if needed
      if (meta) {
        setMeta({
          ...meta,
          total: Math.max(0, meta.total - 1),
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'فشل في حذف الإشعار';
      console.error('Error deleting notification:', err);
      throw new Error(errorMessage);
    }
  }, [meta]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    notifications,
    meta,
    loading,
    error,
    page,
    goToPage,
    markAsRead,
    removeNotification,
    refetch: fetchNotifications,
  };
};

