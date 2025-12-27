import { http } from './http';

// Types based on the backend structure
export type NotificationType =
  | 'project_approved'
  | 'project_rejected'
  | 'proposal_submitted'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'message_received'
  | 'project_status_changed'
  | 'project_completed'
  | 'review_received'
  | 'system_announcement';

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    projectId?: string;
    proposalId?: string;
    chatRoomId?: string;
    messageId?: string;
    reviewId?: string;
  };
  isRead: boolean;
  readAt?: string | null;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  data: {
    unreadCount: number;
  };
}

export interface MarkAsReadResponse {
  message: string;
  data: Notification;
}

export interface MarkAllAsReadResponse {
  message: string;
  data: {
    updatedCount: number;
  };
}

export interface DeleteReadResponse {
  message: string;
  data: {
    deletedCount: number;
  };
}

// API Functions
export const notificationsApi = {
  // 1. Get all notifications with pagination and filtering
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsResponse> => {
    const response = await http.get('/notifications', { params });
    return response.data;
  },

  // 2. Get unread notifications count
  getUnreadNotificationsCount: async (): Promise<number> => {
    const response = await http.get<UnreadCountResponse>('/notifications/unread/count');
    return response.data.data.unreadCount;
  },

  // 3. Get notification by ID
  getNotificationById: async (notificationId: string): Promise<Notification> => {
    const response = await http.get(`/notifications/${notificationId}`);
    return response.data.data;
  },

  // 4. Mark notification as read
  markNotificationAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await http.patch<MarkAsReadResponse>(`/notifications/${notificationId}/read`);
    return response.data.data;
  },

  // 5. Mark all notifications as read
  markAllNotificationsAsRead: async (): Promise<number> => {
    const response = await http.patch<MarkAllAsReadResponse>('/notifications/read-all');
    return response.data.data.updatedCount;
  },

  // 6. Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await http.delete(`/notifications/${notificationId}`);
  },

  // 7. Delete all read notifications
  deleteAllReadNotifications: async (): Promise<number> => {
    const response = await http.delete<DeleteReadResponse>('/notifications/read/all');
    return response.data.data.deletedCount;
  },
};

export default notificationsApi;

