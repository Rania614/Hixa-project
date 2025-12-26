import { http } from './http';

export interface UserProfile {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  nationalId?: string;
  country?: string;
  city?: string;
  location?: string;
  bio?: string;
  specializations?: string[];
  certifications?: Array<{ name: string; year: string }>;
  averageRating?: number;
  reviewsCount?: number;
  avatar?: {
    url: string;
    uploadedAt: string;
  };
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  location?: string;
  bio?: string;
  specializations?: string[];
  certifications?: Array<{ name: string; year: string }>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ProfileResponse {
  data: UserProfile;
}

export interface UpdateProfileResponse {
  message: string;
  data: UserProfile;
}

export interface ChangePasswordResponse {
  message: string;
}

// API Functions
export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await http.get<ProfileResponse>('/users/me');
    // Handle nested response structure
    return response.data?.data || response.data;
  },

  // Update user profile
  updateProfile: async (
    data: ProfileUpdateData,
    avatarFile?: File
  ): Promise<UserProfile> => {
    if (avatarFile) {
      // Use FormData for file upload
      const formData = new FormData();
      
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof ProfileUpdateData];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle arrays (specializations, certifications)
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      formData.append('avatar', avatarFile);
      
      // http.js interceptor will handle Content-Type for FormData automatically
      const response = await http.put<UpdateProfileResponse>(
        '/users/me',
        formData
      );
      
      return response.data.data;
    } else {
      // Use JSON for text-only updates
      const response = await http.put<UpdateProfileResponse>(
        '/users/me',
        data
      );
      
      return response.data.data;
    }
  },

  // Change password
  changePassword: async (
    passwords: ChangePasswordData
  ): Promise<ChangePasswordResponse> => {
    const response = await http.put<ChangePasswordResponse>(
      '/users/me/change-password',
      passwords
    );
    
    return response.data;
  },
};

export default profileApi;

