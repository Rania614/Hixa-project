import { io, Socket } from 'socket.io-client';
import { Message } from './messagesApi';
import type { Notification as NotificationType } from './notificationsApi';

let socket: Socket | null = null;

export interface SocketMessageEvent {
  message: Message;
  chatRoomId: string;
}

export interface SocketUnreadUpdateEvent {
  chatRoomId: string;
  unreadCount: number;
}

export interface SocketNotificationEvent {
  notification: NotificationType;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      // Don't log warning if there's no token - user might not be logged in
      return null;
    }

    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    // Extract base URL for socket (remove /api if present)
    let socketURL = baseURL.trim().replace(/\/api\/?$/, '');
    
    // Fix: localhost doesn't support HTTPS - convert https://localhost to http://localhost
    if (socketURL.startsWith('https://localhost') || socketURL.startsWith('https://127.0.0.1')) {
      console.warn("⚠️ Detected HTTPS on localhost - converting to HTTP for socket");
      socketURL = socketURL.replace(/^https:\/\//, 'http://');
    }
    
    // If baseURL is a full URL (like https://hixa.onrender.com/api), use it directly
    // If it's relative (like /api), use window.location.origin
    if (socketURL.startsWith('http://') || socketURL.startsWith('https://')) {
      // Already a full URL - use as is
      socketURL = socketURL.replace(/\/+$/, ''); // Remove trailing slashes
    } else if (socketURL.startsWith('/')) {
      // Relative path - use current origin
      socketURL = window.location.origin;
    } else {
      // Fallback to current origin
      socketURL = window.location.origin;
    }
    
    console.log('🔌 Socket connecting to:', socketURL);

    this.socket = io(socketURL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      autoConnect: true,
      forceNew: false
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      // Only log if it was a manual disconnect or server error
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        console.log('❌ Socket disconnected:', reason);
      }
      // Don't log for transport errors (they're expected during reconnection)
    });

    let lastErrorTime = 0;
    let errorCount = 0;
    this.socket.on('connect_error', (error) => {
      errorCount++;
      const now = Date.now();
      
      // Only log errors if they're not too frequent (max once per 30 seconds)
      // And only log first few errors to avoid spam
      if (now - lastErrorTime > 30000 && errorCount <= 3) {
        console.warn('Socket connection error (will retry silently):', error.message);
        lastErrorTime = now;
      }
      
      // Reset error count after successful connection
      this.socket?.once('connect', () => {
        errorCount = 0;
      });
    });

    // Set up global listeners
    this.setupGlobalListeners();

    return this.socket;
  }

  private setupGlobalListeners() {
    if (!this.socket) return;

    // Listen for new messages
    this.socket.on('new_message', (data: SocketMessageEvent) => {
      this.emit('new_message', data);
    });

    // Listen for message updates (edit, delete, reaction)
    this.socket.on('message_updated', (data: { message: Message; chatRoomId: string }) => {
      this.emit('message_updated', data);
    });

    this.socket.on('message_deleted', (data: { messageId: string; chatRoomId: string }) => {
      this.emit('message_deleted', data);
    });

    this.socket.on('reaction_updated', (data: { message: Message; chatRoomId: string }) => {
      this.emit('reaction_updated', data);
    });

    // Listen for unread count updates
    this.socket.on('unreadUpdate', (data: SocketUnreadUpdateEvent) => {
      this.emit('unreadUpdate', data);
    });

    // Listen for new notifications
    this.socket.on('new_notification', (data: SocketNotificationEvent) => {
      this.emit('new_notification', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Join a chat room
  joinChatRoom(chatRoomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_room', chatRoomId);
      console.log('Joined chat room:', chatRoomId);
    }
  }

  // Leave a chat room
  leaveChatRoom(chatRoomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', chatRoomId);
      console.log('Left chat room:', chatRoomId);
    }
  }

  // Join a room (alias for joinChatRoom for backward compatibility)
  joinRoom(roomId: string) {
    this.joinChatRoom(roomId);
  }

  // Leave a room (alias for leaveChatRoom for backward compatibility)
  leaveRoom(roomId: string) {
    this.leaveChatRoom(roomId);
  }

  // Emit typing indicator
  emitTyping(chatRoomId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { chatRoomId, isTyping });
    }
  }

  // Subscribe to events
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // Unsubscribe from events
  off(event: string, callback?: Function) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  // Emit event to all listeners
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket event callback:', error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();

