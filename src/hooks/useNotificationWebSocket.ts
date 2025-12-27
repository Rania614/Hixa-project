import { useEffect, useCallback, useRef } from 'react';
import { socketService, SocketNotificationEvent } from '@/services/socketService';
import type { Notification as NotificationType } from '@/services/notificationsApi';

interface UseNotificationWebSocketOptions {
  onNewNotification?: (notification: NotificationType) => void;
  enabled?: boolean;
}

/**
 * Custom hook for WebSocket integration with notifications
 * 
 * Features:
 * - Listens for real-time notification events
 * - Handles new notification callbacks
 * - Automatically connects to socket if not connected
 */
export const useNotificationWebSocket = (
  options: UseNotificationWebSocketOptions = {}
) => {
  const { onNewNotification, enabled = true } = options;
  const callbackRef = useRef(onNewNotification);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onNewNotification;
  }, [onNewNotification]);

  // Handle new notification event
  const handleNewNotification = useCallback((data: SocketNotificationEvent) => {
    console.log('New notification received via WebSocket:', data);
    
    // Call the callback if provided
    if (callbackRef.current) {
      callbackRef.current(data.notification);
    }

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(data.notification.title, {
          body: data.notification.message,
          icon: '/favicon.ico',
          tag: data.notification._id, // Prevent duplicate notifications
        });
      } catch (error) {
        console.error('Error showing browser notification:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Connect socket if not connected
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Subscribe to new notification events
    socketService.on('new_notification', handleNewNotification);

    // Cleanup on unmount
    return () => {
      socketService.off('new_notification', handleNewNotification);
    };
  }, [enabled, handleNewNotification]);

  return {
    isConnected: socketService.isConnected(),
  };
};

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  return false;
};

