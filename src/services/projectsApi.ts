import { http } from './http';

export interface Project {
  _id: string;
  id?: string;
  title: string;
  description: string;
  country?: string;
  city?: string;
  location?: string;
  category: string;
  requirements: string;
  projectType: string;
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  startDate?: string;
  deadline?: string;
  tags?: string[];
  status: string;
  client?: {
    _id: string;
    name: string;
    email: string;
    avatar?: any;
  };
  assignedEngineer?: {
    _id: string;
    name: string;
    email: string;
    avatar?: any;
  };
  progress?: number;
  attachments?: Array<{
    _id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>;
  proposalsCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectsResponse {
  data: Project[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ProjectStatistics {
  totalProjects?: number;
  total?: number;
  byStatus?: {
    "Pending Review"?: number;
    "Approved"?: number;
    "Waiting for Engineers"?: number;
    "In Progress"?: number;
    "Completed"?: number;
    "Cancelled"?: number;
  };
  byCategory?: {
    residential?: number;
    commercial?: number;
    industrial?: number;
    infrastructure?: number;
  };
  byProjectType?: {
    new?: number;
    renovation?: number;
    maintenance?: number;
    consultation?: number;
  };
  totalProposals?: number;
  averageBudget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  totalSpent?: number;
  activeProjects?: number;
  // Fallback fields
  draft?: number;
  pendingReview?: number;
  waitingForEngineers?: number;
  inProgress?: number;
  completed?: number;
  rejected?: number;
}

export interface ChatRoom {
  _id: string;
  project?: {
    _id: string;
    title: string;
  };
  type: 'group' | 'direct' | 'project' | 'admin-client' | 'admin-engineer';
  participants: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
      avatar?: any;
    };
    role: string;
    joinedAt: string;
  }>;
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: string;
  };
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatRoomsResponse {
  data: ChatRoom[];
  chatRooms?: ChatRoom[];
}

// API Functions
export const projectsApi = {
  // Get all projects with pagination and filters
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    projectType?: string;
    search?: string;
    city?: string;
    country?: string;
    category?: string;
  }): Promise<ProjectsResponse> => {
    const response = await http.get('/projects', { params });
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
        meta: response.data.meta,
      };
    }
    
    if (response.data?.projects && Array.isArray(response.data.projects)) {
      return {
        data: response.data.projects,
        pagination: response.data.pagination,
        meta: response.data.meta,
      };
    }
    
    return { data: [] };
  },

  // Get project by ID
  getProjectById: async (projectId: string): Promise<Project> => {
    const response = await http.get(`/projects/${projectId}`);
    return response.data?.data || response.data;
  },

  // Get project statistics
  getStatistics: async (): Promise<ProjectStatistics> => {
    try {
      const response = await http.get('/projects/statistics');
      return response.data?.data || response.data || {};
    } catch (error: any) {
      // Return empty stats if endpoint doesn't exist
      if (error.response?.status === 404) {
        return {
          totalProjects: 0,
          total: 0,
          byStatus: {},
          byCategory: {},
          byProjectType: {},
          totalProposals: 0,
          activeProjects: 0,
        };
      }
      throw error;
    }
  },

  // Get chat rooms
  getChatRooms: async (params?: {
    projectId?: string;
  }): Promise<ChatRoomsResponse> => {
    try {
      const response = await http.get('/chat-rooms', { params });
      
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data;
      }
      
      if (response.data?.chatRooms && Array.isArray(response.data.chatRooms)) {
        return { data: response.data.chatRooms };
      }
      
      return { data: [] };
    } catch (error: any) {
      // Return empty array if endpoint doesn't exist
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },
};

export default projectsApi;

