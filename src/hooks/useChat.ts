import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService, TypingEvent } from '@/services/socketService';
import { messagesApi, Message, ChatRoom } from '@/services/messagesApi';
import { isValidObjectId } from '@/lib/objectId';

interface UseChatOptions {
  chatRoomId: string | null;
  enabled?: boolean;
}

interface TypingUser {
  userId: string;
  userName?: string;
  isTyping: boolean;
}

/**
 * Custom hook for managing chat functionality
 * 
 * Features:
 * - Fetches and manages messages
 * - Handles real-time message updates via Socket.io
 * - Manages typing indicators
 * - Handles pagination
 * - Automatically joins/leaves rooms
 * - Cleans up on unmount or room change
 */
export const useChat = ({ chatRoomId, enabled = true }: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const currentRoomRef = useRef<string | null>(null);

  /**
   * Fetch messages for the current chat room
   * @param targetPage - Page number to fetch (defaults to current page or 1 if reset)
   * @param reset - If true, reset to page 1 and replace messages
   */
  const fetchMessages = useCallback(async (targetPage?: number, reset = false) => {
    if (!chatRoomId || !enabled) return;

    // Validate chatRoomId is a valid MongoDB ObjectId
    // Backend uses MongoDB ObjectIds, NOT numeric IDs
    if (!isValidObjectId(chatRoomId)) {
      const errorMsg = `Invalid chatRoomId: "${chatRoomId}". Expected MongoDB ObjectId (24-character hex string).`;
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : (targetPage ?? page);
      const response = await messagesApi.getMessages(chatRoomId, currentPage, 50);
      
      // Messages are returned from oldest to newest
      // We need to display them in chronological order
      const sortedMessages = [...response.messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      if (reset) {
        setMessages(sortedMessages);
        setPage(1);
      } else {
        // Prepend older messages for pagination
        setMessages((prev) => {
          // Avoid duplicates
          const existingIds = new Set(prev.map(m => m._id));
          const newMessages = sortedMessages.filter(m => !existingIds.has(m._id));
          return [...newMessages, ...prev];
        });
        // Update page state if targetPage was provided
        if (targetPage !== undefined) {
          setPage(targetPage);
        }
      }

      setHasMore(response.page < response.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [chatRoomId, enabled, page]);

  /**
   * Load more messages (pagination)
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore && chatRoomId) {
      const nextPage = page + 1;
      fetchMessages(nextPage, false);
    }
  }, [loading, hasMore, chatRoomId, page, fetchMessages]);

  /**
   * Send a message
   * Note: Do NOT optimistically add message - rely on Socket.io event
   */
  const sendMessage = useCallback(async (content: string, type: 'text' | 'file' = 'text') => {
    if (!chatRoomId || !content.trim()) return;

    // Validate chatRoomId is a valid MongoDB ObjectId
    if (!isValidObjectId(chatRoomId)) {
      const errorMsg = `Cannot send message: Invalid chatRoomId "${chatRoomId}". Expected MongoDB ObjectId.`;
      console.error(errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setSending(true);
      setError(null);
      
      // Send via REST API
      await messagesApi.sendMessage(chatRoomId, content, type);
      
      // The message will be received via Socket.io "new_message" event
      // No need to manually add it to state
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  }, [chatRoomId]);

  /**
   * Handle new message from Socket.io
   */
  const handleNewMessage = useCallback((data: { message: Message; chatRoomId: string }) => {
    // Only add message if it's for the current room
    if (data.chatRoomId === chatRoomId) {
      setMessages((prev) => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(m => m._id === data.message._id);
        if (exists) return prev;
        
        // Add new message and sort chronologically
        const updated = [...prev, data.message];
        return updated.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    }
  }, [chatRoomId]);

  /**
   * Handle typing indicator from Socket.io
   */
  const handleUserTyping = useCallback((data: TypingEvent) => {
    // Only handle typing for current room
    if (data.roomId !== chatRoomId) return;

    setTypingUsers((prev) => {
      const updated = new Map(prev);
      
      if (data.isTyping) {
        updated.set(data.userId, {
          userId: data.userId,
          userName: data.userName,
          isTyping: true,
        });
        
        // Clear existing timeout
        const existingTimeout = typingTimeoutRef.current.get(data.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
        
        // Set timeout to remove typing indicator after 3 seconds
        const timeout = setTimeout(() => {
          setTypingUsers((current) => {
            const updated = new Map(current);
            updated.delete(data.userId);
            return updated;
          });
          typingTimeoutRef.current.delete(data.userId);
        }, 3000);
        
        typingTimeoutRef.current.set(data.userId, timeout);
      } else {
        updated.delete(data.userId);
        const timeout = typingTimeoutRef.current.get(data.userId);
        if (timeout) {
          clearTimeout(timeout);
          typingTimeoutRef.current.delete(data.userId);
        }
      }
      
      return updated;
    });
  }, [chatRoomId]);

  /**
   * Emit typing indicator
   */
  const emitTyping = useCallback((isTyping: boolean) => {
    if (chatRoomId) {
      socketService.emitTyping(chatRoomId, isTyping);
    }
  }, [chatRoomId]);

  // Set up Socket.io connection and listeners
  useEffect(() => {
    if (!enabled || !chatRoomId) return;

    // Validate chatRoomId is a valid MongoDB ObjectId before connecting
    // Backend uses MongoDB ObjectIds, NOT numeric IDs
    if (!isValidObjectId(chatRoomId)) {
      console.error('Cannot connect socket: Invalid chatRoomId', chatRoomId);
      setError(`Invalid chat room ID: "${chatRoomId}". Expected MongoDB ObjectId.`);
      return;
    }

    // Connect socket if not connected
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Join the room with validated ObjectId
    try {
      socketService.joinRoom(chatRoomId);
      currentRoomRef.current = chatRoomId;
    } catch (error) {
      console.error('Failed to join socket room:', error);
      setError('Failed to connect to chat room');
    }

    // Handle message updates
    const handleMessageUpdated = useCallback((data: { message: Message; chatRoomId: string }) => {
      if (data.chatRoomId === chatRoomId) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === data.message._id ? data.message : msg))
        );
      }
    }, [chatRoomId]);

    const handleMessageDeleted = useCallback((data: { messageId: string; chatRoomId: string }) => {
      if (data.chatRoomId === chatRoomId) {
        setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
      }
    }, [chatRoomId]);

    const handleReactionUpdated = useCallback((data: { message: Message; chatRoomId: string }) => {
      if (data.chatRoomId === chatRoomId) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === data.message._id ? data.message : msg))
        );
      }
    }, [chatRoomId]);

    // Set up event listeners
    socketService.on('new_message', handleNewMessage);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('message_updated', handleMessageUpdated);
    socketService.on('message_deleted', handleMessageDeleted);
    socketService.on('reaction_updated', handleReactionUpdated);

    // Fetch initial messages
    fetchMessages(undefined, true);

    // Cleanup function
    return () => {
      // Remove event listeners
      socketService.off('new_message', handleNewMessage);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('message_updated', handleMessageUpdated);
      socketService.off('message_deleted', handleMessageDeleted);
      socketService.off('reaction_updated', handleReactionUpdated);

      // Leave room
      if (currentRoomRef.current) {
        socketService.leaveRoom(currentRoomRef.current);
        currentRoomRef.current = null;
      }

      // Clear typing timeouts
      typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
      setTypingUsers(new Map());
    };
  }, [chatRoomId, enabled, handleNewMessage, handleUserTyping, handleMessageUpdated, handleMessageDeleted, handleReactionUpdated, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sending,
    typingUsers: Array.from(typingUsers.values()),
    hasMore,
    sendMessage,
    loadMore,
    emitTyping,
    refetch: () => fetchMessages(undefined, true),
  };
};

