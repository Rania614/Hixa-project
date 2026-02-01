import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getInitialContentSnapshot } from "@/services/api";
import { http, setAccessToken } from "@/services/http";

interface LandingContent {
  _id: string;
  header: {
    logoImage: string;
    logo?: string;
  };
  hero: {
    title_en: string;
    title_ar: string;
    subtitle_en: string;
    subtitle_ar: string;
    cta: {
      en: string;
      ar: string;
    };
  };
  about: any;
  services: any;
  projects: any;
  partners: Array<{
    id: string;
    name: {
      en: string;
      ar: string;
    };
    logo: string;
    active: boolean;
  }>;
  jobs: Array<{
    id: string;
    title: {
      en: string;
      ar: string;
    };
    description: {
      en: string;
      ar: string;
    };
    status: string;
    applicationLink?: string;
  }>;
  features: any;
  cta: any;
  footer: any;
}

// User role type - matches backend role values
export type UserRole = "client" | "engineer" | "company" | "admin" | null;

interface AppContextProps {
  language: "ar" | "en";
  setLanguage: (lang: "ar" | "en") => void;
  content: LandingContent | null;
  loading: boolean;
  refresh: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
  isCheckingAuth: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  // Initialize with fallback data immediately to prevent blank screen
  const [content, setContent] = useState<LandingContent | null>(getInitialContentSnapshot());
  const [loading, setLoading] = useState(false); // Start with false since we have fallback data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true); // Track if we're still checking auth
  // Centralized user role state - source of truth from backend
  const [userRole, setUserRole] = useState<UserRole>(null);

  // Set document direction and language on mount and when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Helper function to extract and normalize role from user data
  const extractRole = (userData: any): UserRole => {
    if (!userData || !userData.role) return null;
    
    const role = userData.role.toLowerCase();
    // Normalize role to match backend values
    if (role === 'client') return 'client';
    if (role === 'engineer' || role === 'partner') return 'engineer';
    if (role === 'company') return 'company';
    if (role === 'admin') return 'admin';
    
    return null;
  };

  const fetchLandingContent = async () => {
    try {
      // Don't set loading to true - keep showing fallback data
      // Use mock data instead of trying to fetch from a non-existent API
      const data = getInitialContentSnapshot();
      setContent(data);
    } catch (error) {
      console.error("Error fetching landing content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandingContent();
    
    // Check if user is already authenticated by trying to refresh token
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      
      // Try to refresh token using refreshToken cookie
      // This will automatically get a new access token if refresh token is valid
      try {
        const refreshResponse = await http.post('/auth/refresh', {}, {
          validateStatus: () => true, // Don't throw for any status code
        });
        
        // If status is 200-299, refresh token is valid - user is authenticated
        if (refreshResponse.status >= 200 && refreshResponse.status < 300) {
          // Update access token from response
          const newAccessToken = refreshResponse.data?.accessToken || refreshResponse.data?.token;
          if (newAccessToken) {
            setAccessToken(newAccessToken);
          }
          
          // Update user data and role from response
          if (refreshResponse.data?.user) {
            localStorage.setItem("user", JSON.stringify(refreshResponse.data.user));
            // Extract role from backend response and update context
            const role = extractRole(refreshResponse.data.user);
            setUserRole(role);
          }
          
          setIsAuthenticated(true);
        } else {
          // Refresh token is invalid or expired - user is not authenticated
          setIsAuthenticated(false);
          setUserRole(null);
          setAccessToken(null);
          localStorage.removeItem("user");
        }
      } catch (error: any) {
        // Network error or refresh failed - assume not authenticated
        setIsAuthenticated(false);
        setUserRole(null);
        setAccessToken(null);
        localStorage.removeItem("user");
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <AppContext.Provider value={{ 
      language, 
      setLanguage, 
      content, 
      loading, 
      refresh: fetchLandingContent,
      isAuthenticated,
      setIsAuthenticated,
      isCheckingAuth,
      userRole,
      setUserRole
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
