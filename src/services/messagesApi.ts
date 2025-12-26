import { http } from './http';

// Types based on the backend structure
export interface ProjectRoom {
  _id: string;
  project: string;
  projectTitle: string;
  lastActivityAt: string;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface ChatRoomParticipant {
  user: string;
  role: 'admin' | 'client' | 'engineer';
  joinedAt: string;
  lastReadAt?: string;
}

export interface LastMessage {
  content: string;
  sender: string;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  project: string;
  projectRoom: string;
  type: 'admin-engineer' | 'admin-client' | 'group';
  engineer?: string;
  participants: ChatRoomParticipant[];
  lastMessage?: LastMessage;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface MessageAttachment {
  url: string;
  filename: string;
  type: string;
  size: number;
}

export interface MessageReadBy {
  user: string;
  readAt: string;
}

export interface MessageReaction {
  user: {
    _id: string;
    name: string;
    avatar?: { url: string };
  };
  emoji: string;
}

export interface Message {
  _id: string;
  chatRoom: string;
  sender: string | {
    _id: string;
    name: string;
    email?: string;
    role?: string;
    avatar?: { url: string };
  };
  senderName?: string;
  senderRole?: string;
  content: string;
  type: 'text' | 'file' | 'system';
  attachments?: MessageAttachment[];
  readBy: MessageReadBy[];
  isEdited?: boolean;
  isDeleted?: boolean;
  reactions?: MessageReaction[];
  createdAt: string;
  updatedAt?: string;
}

// API Functions
export const messagesApi = {
  // Get all project rooms (Admin sees all)
  getProjectRooms: async (): Promise<ProjectRoom[]> => {
    const response = await http.get('/project-rooms');
    return response.data?.data || response.data || [];
  },

  // Get chat rooms for a specific project room
  getChatRooms: async (projectRoomId: string): Promise<ChatRoom[]> => {
    try {
      const response = await http.get(`/project-rooms/${projectRoomId}/chat-rooms`);
      // http.js interceptor handles 404 and returns { data: null }
      if (!response || !response.data) {
        return [];
      }
      return response.data?.data || response.data || [];
    } catch (error: any) {
      // Additional safety check - if http.js didn't handle it
      if (error.response?.status === 404) {
        // 404 is expected when chat rooms don't exist yet
        return [];
      }
      // Re-throw other errors
      throw error;
    }
  },

  // Get messages for a chat room with pagination
  getMessages: async (
    chatRoomId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: Message[]; total: number; page: number; totalPages: number }> => {
    const response = await http.get(`/messages/room/${chatRoomId}`, {
      params: { page, limit }
    });
    
    console.log('📥 Raw API response:', response.data);
    
    // Backend sends: { data: [...], meta: {...} }
    if (response.data?.data && Array.isArray(response.data.data)) {
      // Response has { data: [...], meta: {...} }
      const messages = response.data.data;
      const meta = response.data.meta || {};
      console.log('📥 Parsed messages:', messages.length, 'meta:', meta);
      return {
        messages,
        total: meta.total || messages.length,
        page: meta.page || page,
        totalPages: meta.pages || meta.totalPages || 1
      };
    } else if (response.data?.messages && Array.isArray(response.data.messages)) {
      // Response has { messages: [...], meta: {...} }
      const meta = response.data.meta || {};
      console.log('📥 Parsed messages (alternative structure):', response.data.messages.length);
      return {
        messages: response.data.messages,
        total: meta.total || response.data.messages.length,
        page: meta.page || page,
        totalPages: meta.pages || meta.totalPages || 1
      };
    } else if (Array.isArray(response.data)) {
      // Response is directly an array
      console.log('📥 Parsed messages (direct array):', response.data.length);
      return {
        messages: response.data,
        total: response.data.length,
        page: page,
        totalPages: 1
      };
    }
    
    // Default empty response
    console.warn('⚠️ Unknown response structure, returning empty');
    return { messages: [], total: 0, page: 1, totalPages: 1 };
  },

  // Send a message
  sendMessage: async (
    chatRoomId: string,
    content: string,
    type: 'text' | 'file' = 'text',
    attachments?: File[],
    onProgress?: (progress: number) => void
  ): Promise<Message> => {
    if (attachments && attachments.length > 0) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('chatRoomId', chatRoomId); // Backend expects 'chatRoomId'
      formData.append('content', content || ''); // Empty string if no content
      formData.append('type', type);
      
      // Append each file with the correct field name 'attachments'
      attachments.forEach((file) => {
        formData.append('attachments', file, file.name);
      });

      console.log('📎 Sending FormData with attachments:', {
        chatRoomId,
        content,
        type,
        attachmentsCount: attachments.length,
        fileNames: attachments.map(f => f.name)
      });

      const response = await http.post(`/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      if (onProgress) onProgress(100);
      return response.data?.data || response.data;
    } else {
      // Use JSON for text messages
      const response = await http.post(`/messages`, {
        chatRoomId: chatRoomId, // Backend expects 'chatRoomId'
        content,
        type,
      });
      return response.data?.data || response.data;
    }
  },

  // Mark message as read
  markMessageAsRead: async (messageId: string): Promise<void> => {
    await http.put(`/messages/${messageId}/read`);
  },

  // Mark all messages in a chat room as read
  markChatRoomAsRead: async (chatRoomId: string): Promise<void> => {
    try {
      // Try to use a dedicated endpoint if available
      await http.put(`/chat-rooms/${chatRoomId}/read`);
    } catch (error) {
      // Fallback: mark individual messages
      try {
        const messagesResponse = await http.get(`/messages/room/${chatRoomId}`, {
          params: { page: 1, limit: 100 }
        });
        const messages = messagesResponse.data?.data?.messages || messagesResponse.data?.messages || [];
        
        // Mark unread messages as read
        // Note: This requires userId to be available from the backend
        const unreadMessages = messages.filter((msg: Message) => {
          // Check if message is unread (no readBy entries or current user hasn't read)
          return msg.readBy.length === 0;
        });

        await Promise.all(
          unreadMessages.map((msg: Message) => http.put(`/messages/${msg._id}/read`).catch(() => {}))
        );
      } catch (err) {
        // Silently fail - this is not critical
        console.warn('Failed to mark chat room as read:', err);
      }
    }
  },

  // Get unread messages count
  getUnreadMessagesCount: async (): Promise<{
    total: number;
    unreadCounts: Array<{
      chatRoom: string;
      count: number;
    }>;
  }> => {
    const response = await http.get('/messages/unread/count');
    return response.data?.data || { total: 0, unreadCounts: [] };
  },

  // Update a message
  updateMessage: async (messageId: string, content: string): Promise<Message> => {
    const response = await http.put(`/messages/${messageId}`, { content });
    return response.data?.data || response.data;
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<void> => {
    await http.delete(`/messages/${messageId}`);
  },

  // Toggle reaction on a message
  toggleReaction: async (messageId: string, emoji: string): Promise<Message> => {
    const response = await http.post(`/messages/${messageId}/reaction`, { emoji });
    return response.data?.data || response.data;
  },

  // Search messages in a chat room
  searchMessages: async (
    roomId: string,
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: Message[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> => {
    const response = await http.get('/messages/search', {
      params: { roomId, query, page, limit },
    });
    return response.data || { data: [], meta: { total: 0, page: 1, limit: 20, pages: 1 } };
  },
};

