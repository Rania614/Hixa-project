import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getInitialContentSnapshot } from "@/services/api";
import { http } from "@/services/http";

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

interface AppContextProps {
  language: "ar" | "en";
  setLanguage: (lang: "ar" | "en") => void;
  content: LandingContent | null;
  loading: boolean;
  refresh: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"ar" | "en">("en");
  // Initialize with fallback data immediately to prevent blank screen
  const [content, setContent] = useState<LandingContent | null>(getInitialContentSnapshot());
  const [loading, setLoading] = useState(false); // Start with false since we have fallback data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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
    
    // Check if user is already authenticated by verifying token with API
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Try to verify token with API - check if admin is authenticated
          try {
            await http.get('/auth/verify');
            setIsAuthenticated(true);
          } catch (verifyError: any) {
            // If verify endpoint doesn't exist (404), try admin/me endpoint
            if (verifyError.response?.status === 404) {
              try {
                await http.get('/admin/me');
                setIsAuthenticated(true);
              } catch (meError: any) {
                // If both endpoints don't exist (404), keep token (fallback for development)
                if (meError.response?.status === 404) {
                  // Endpoints don't exist - keep token for development
                  // Silently handle 404 - endpoints may not be implemented yet
                  setIsAuthenticated(true);
                } else if (meError.response?.status === 401 || meError.response?.status === 403) {
                  // Token is invalid
                  localStorage.removeItem("token");
                  setIsAuthenticated(false);
                } else {
                  // Other error, keep token (fallback)
                  setIsAuthenticated(true);
                }
              }
            } else if (verifyError.response?.status === 401 || verifyError.response?.status === 403) {
              // Token is invalid
              localStorage.removeItem("token");
              setIsAuthenticated(false);
            } else {
              // Other error, keep token (fallback)
              setIsAuthenticated(true);
            }
          }
        } catch (error: any) {
          // Network error or other issue - check if it's a 404 (endpoint doesn't exist)
          if (error.response?.status === 404) {
            // Endpoint doesn't exist - keep token for development
            // Silently handle 404 - endpoints may not be implemented yet
            setIsAuthenticated(true);
          } else {
            // Other network error - keep token for now
            // Only log non-404 errors
            if (error.response?.status !== 404) {
              console.warn('Auth check failed:', error.message || error);
            }
            setIsAuthenticated(true);
          }
        }
      } else {
        setIsAuthenticated(false);
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
      setIsAuthenticated
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