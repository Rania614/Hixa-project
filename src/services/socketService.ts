import { io, Socket } from 'socket.io-client';
import { Message } from './messagesApi';

let socket: Socket | null = null;

export interface SocketMessageEvent {
  message: Message;
  chatRoomId: string;
}

export interface SocketUnreadUpdateEvent {
  chatRoomId: string;
  unreadCount: number;
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
      console.warn('No token found, cannot connect to socket');
      return null;
    }

    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    const socketURL = baseURL.replace('/api', ''); // Remove /api from base URL for socket

    this.socket = io(socketURL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
      timeout: 5000,
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      // Only log if it was a manual disconnect
      if (this.socket?.disconnected) {
        console.log('❌ Socket disconnected');
      }
    });

    let lastErrorTime = 0;
    this.socket.on('connect_error', (error) => {
      // Only log errors if they're not too frequent (max once per 10 seconds)
      const now = Date.now();
      if (now - lastErrorTime > 10000) {
        console.warn('Socket connection error (will retry silently)');
        lastErrorTime = now;
      }
      // Don't spam console with repeated errors
    });

    // Set up global listeners
    this.setupGlobalListeners();

    return this.socket;
  }

  private setupGlobalListeners() {
    if (!this.socket) return;

    // Listen for new messages
    this.socket.on('newMessage', (data: SocketMessageEvent) => {
      this.emit('newMessage', data);
    });

    // Listen for unread count updates
    this.socket.on('unreadUpdate', (data: SocketUnreadUpdateEvent) => {
      this.emit('unreadUpdate', data);
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
      this.socket.emit('joinChatRoom', chatRoomId);
      console.log('Joined chat room:', chatRoomId);
    }
  }

  // Leave a chat room
  leaveChatRoom(chatRoomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leaveChatRoom', chatRoomId);
      console.log('Left chat room:', chatRoomId);
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

