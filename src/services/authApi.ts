/**
 * Authentication API Service
 * 
 * Handles all authentication-related API calls:
 * - Login (unified for all roles)
 * - Registration (Client, Engineer, Company)
 */

import { http, setAccessToken } from './http';
import { toast } from '@/components/ui/sonner';

// ============================================
// TypeScript Interfaces
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CompanyRegistrationRequest {
  companyName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
}

export interface EngineerRegistrationRequest {
  fullName: string;
  specialization: string;
  licenseNumber: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
}

export interface ClientRegistrationRequest {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    role: 'client' | 'engineer' | 'admin' | 'company';
    isActive?: boolean;
    specializations?: string[];
    nationalId?: string;
    companyName?: string;
    contactPersonName?: string;
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Login - Unified for all roles
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await http.post<AuthResponse>('/auth/login', data);
    
    // Store token and user data
    if (response.data.token) {
      setAccessToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'حدث خطأ أثناء تسجيل الدخول';
    throw new Error(errorMessage);
  }
};

/**
 * Register Company
 */
export const registerCompany = async (data: CompanyRegistrationRequest): Promise<AuthResponse> => {
  try {
    const response = await http.post<AuthResponse>('/auth/register/company', data);
    
    // Store token and user data
    if (response.data.token) {
      setAccessToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        'حدث خطأ أثناء تسجيل الشركة';
    throw new Error(errorMessage);
  }
};

/**
 * Register Engineer
 */
export const registerEngineer = async (data: EngineerRegistrationRequest): Promise<AuthResponse> => {
  try {
    const response = await http.post<AuthResponse>('/auth/register/engineer', data);
    
    // Store token and user data
    if (response.data.token) {
      setAccessToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        'حدث خطأ أثناء تسجيل المهندس';
    throw new Error(errorMessage);
  }
};

/**
 * Register Client
 */
export const registerClient = async (data: ClientRegistrationRequest): Promise<AuthResponse> => {
  try {
    const response = await http.post<AuthResponse>('/auth/register/client', data);
    
    // Store token and user data
    if (response.data.token) {
      setAccessToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        'حدث خطأ أثناء تسجيل العميل';
    throw new Error(errorMessage);
  }
};

/**
 * Get redirect path based on user role
 */
export const getDashboardPath = (role: string): string => {
  const normalizedRole = role?.toLowerCase();
  
  if (normalizedRole === 'admin') return '/admin/dashboard';
  if (normalizedRole === 'company') return '/company/dashboard';
  if (normalizedRole === 'engineer') return '/engineer/dashboard';
  if (normalizedRole === 'client') return '/client/dashboard';
  
  // Default fallback
  return '/client/dashboard';
};

