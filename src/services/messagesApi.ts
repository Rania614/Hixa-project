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

export interface Message {
  _id: string;
  chatRoom: string;
  sender: string;
  senderName?: string;
  senderRole?: string;
  content: string;
  type: 'text' | 'file' | 'system';
  attachments?: MessageAttachment[];
  readBy: MessageReadBy[];
  createdAt: string;
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
    const response = await http.get(`/project-rooms/${projectRoomId}/chat-rooms`);
    return response.data?.data || response.data || [];
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
    return response.data?.data || response.data || { messages: [], total: 0, page: 1, totalPages: 1 };
  },

  // Send a message
  sendMessage: async (
    chatRoomId: string,
    content: string,
    type: 'text' | 'file' = 'text',
    attachments?: File[]
  ): Promise<Message> => {
    if (attachments && attachments.length > 0) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('chatRoom', chatRoomId);
      formData.append('content', content);
      formData.append('type', type);
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await http.post(`/messages`, formData);
      return response.data?.data || response.data;
    } else {
      // Use JSON for text messages
      const response = await http.post(`/messages`, {
        chatRoom: chatRoomId,
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
  }
};

