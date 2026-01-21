import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { useMemo, useState, useEffect } from "react";
import { http } from "./services/http";
import { SEOHead } from "@/components/SEOHead";
import { RoleProtectedRoute } from "@/components/routing/RoleProtectedRoute";

import Landing from "./pages/PlatformLanding";
import AdminLogin from "./pages/admin-dashboard/AdminLogin";
import AdminDashboard from "./pages/admin-dashboard/AdminDashboard";
import AdminAnalytics from "./pages/admin-dashboard/AdminAnalytics";
import ContentManagement from "./pages/admin-dashboard/ContentManagement";
import Orders from "./pages/admin-dashboard/Orders";
import PartnerRequests from "./pages/admin-dashboard/PartnerRequests";
import Subscribers from "./pages/admin-dashboard/Subscribers";
import AdminMessages from "./pages/admin-dashboard/AdminMessages";
import AdminUsers from "./pages/admin-dashboard/AdminUsers";
import AdminProjects from "./pages/admin-dashboard/AdminProjects";
import AdminProjectDetails from "./pages/admin-dashboard/AdminProjectDetails";
import AdminProjectProposals from "./pages/admin-dashboard/AdminProjectProposals";
import AdminSettings from "./pages/admin-dashboard/AdminSettings";
import AdminNotifications from "./pages/admin-dashboard/AdminNotifications";
import NotFound from "./pages/NotFound";
import CompanyLanding from "./pages/CompanyLanding";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Client Dashboard
import ClientLogin from "./pages/client-dashboard/ClientLogin";
import ClientDashboard from "./pages/client-dashboard/ClientDashboard";
import ClientProjects from "./pages/client-dashboard/ClientProjects";
import ClientBrowseProjects from "./pages/client-dashboard/ClientBrowseProjects";
import ClientMessages from "./pages/client-dashboard/ClientMessages";
import ClientNotifications from "./pages/client-dashboard/ClientNotifications";
import ClientContracts from "./pages/client-dashboard/ClientContracts";
import ClientProfile from "./pages/client-dashboard/ClientProfile";
import ProjectDetails from "./pages/client-dashboard/ProjectDetails";
import CreateProject from "./pages/client-dashboard/CreateProject";
import EngineerProfileView from "./pages/client-dashboard/EngineerProfileView";

// Engineer Dashboard
import EngineerLogin from "./pages/engineer-dashboard/EngineerLogin";
import EngineerDashboard from "./pages/engineer-dashboard/EngineerDashboard";
import AvailableProjects from "./pages/engineer-dashboard/AvailableProjects";
import EngineerProjects from "./pages/engineer-dashboard/EngineerProjects";
import EngineerMessages from "./pages/engineer-dashboard/EngineerMessages";
import EngineerNotifications from "./pages/engineer-dashboard/EngineerNotifications";
import EngineerPortfolio from "./pages/engineer-dashboard/EngineerPortfolio";
import AddWork from "./pages/engineer-dashboard/AddWork";
import WorkDetails from "./pages/engineer-dashboard/WorkDetails";
import EngineerProfile from "./pages/engineer-dashboard/EngineerProfile";
import EngineerProjectDetails from "./pages/engineer-dashboard/EngineerProjectDetails";
import SubmitProposal from "./pages/engineer-dashboard/SubmitProposal";

// Company Dashboard
import CompanyLogin from "./pages/company-dashboard/CompanyLogin";
import CompanyDashboard from "./pages/company-dashboard/CompanyDashboard";
import CompanyProjects from "./pages/company-dashboard/CompanyProjects";
import CompanyMessages from "./pages/company-dashboard/CompanyMessages";
import CompanyNotifications from "./pages/company-dashboard/CompanyNotifications";
import CompanyProfile from "./pages/company-dashboard/CompanyProfile";
import CompanyPortfolio from "./pages/company-dashboard/CompanyPortfolio";
import CompanyAvailableProjects from "./pages/company-dashboard/CompanyAvailableProjects";
import CompanyProjectDetails from "./pages/company-dashboard/CompanyProjectDetails";
import CompanySubmitProposal from "./pages/company-dashboard/CompanySubmitProposal";

const queryClient = new QueryClient();

// ProtectedRoute component - checks both authentication state and token
// Redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCheckingAuth } = useApp();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isChecking, setIsChecking] = useState(true);
  
  // Update token when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    
    // Check token on mount and when isAuthenticated changes
    handleStorageChange();
    
    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);
  
  // Verify token is valid on mount and when dependencies change
  useEffect(() => {
    const verifyToken = () => {
      // Wait for AppContext to finish checking auth (refresh token check)
      if (isCheckingAuth) {
        // Still checking - wait
        return;
      }
      
      const currentToken = localStorage.getItem("token");
      
      // If no token, not authorized - redirect immediately
      if (!currentToken) {
        setIsChecking(false);
        return;
      }
      
      // Update token state
      setToken(currentToken);
      
      // CRITICAL: Must have both token AND isAuthenticated to be authorized
      // Now that auth check is complete, we can make a decision
      if (!isAuthenticated) {
        // User is not authenticated - clear token and redirect
        localStorage.removeItem("token");
        setToken(null);
        setIsChecking(false);
        return;
      }
      
      // Both token and isAuthenticated exist - allow access
      setIsChecking(false);
    };
    
    verifyToken();
  }, [isAuthenticated, isCheckingAuth, location.pathname]);
  
  // Use useMemo to prevent unnecessary re-renders
  const isAuthorized = useMemo(() => {
    // Must have both authentication state and valid token
    return isAuthenticated && !!token;
  }, [isAuthenticated, token]);
  
  // Show loading while checking (either local check or AppContext auth check)
  if (isChecking || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // Must have both authentication state and valid token
  if (!isAuthorized) {
    // Redirect to appropriate login page based on route
    const loginPath = location.pathname.startsWith('/client/') 
      ? '/client/login' 
      : location.pathname.startsWith('/engineer/') || location.pathname.startsWith('/company/')
      ? '/auth/partner'
      : '/admin/login';
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }
  
  return <>{children}</>;
};

// Old Protected Route components removed - replaced with RoleProtectedRoute
// The old components (ClientProtectedRoute, AdminProtectedRoute, CompanyProtectedRoute, EngineerProtectedRoute)
// have been replaced with the unified RoleProtectedRoute component that uses userRole from AppContext

// PublicRoute component - redirects to dashboard if already authenticated
// Redirects to admin login if not authenticated or not an admin
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, language } = useApp();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Update token when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);
  
  // Verify token and admin role
  useEffect(() => {
    const verifyAdminAuth = async () => {
      const currentToken = localStorage.getItem("token");
      
      // If no token, not authorized - redirect immediately
      if (!currentToken) {
        setIsChecking(false);
        setIsAdmin(false);
        return;
      }
      
      // Update token state
      setToken(currentToken);
      
      // Must have both token AND isAuthenticated
      if (!isAuthenticated) {
        localStorage.removeItem("token");
        setToken(null);
        setIsChecking(false);
        setIsAdmin(false);
        return;
      }
      
      // Check if user is admin by verifying role from localStorage or API
      try {
        const userDataStr = localStorage.getItem("user");
        let userData = null;
        
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr);
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
        
        // If no user data in localStorage, try to fetch from API
        if (!userData) {
          try {
            const response = await http.get("/admin/me");
            userData = response.data?.user || response.data?.data || response.data;
            if (userData) {
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (error: any) {
            console.warn("Could not fetch user data:", error);
            setIsChecking(false);
            setIsAdmin(true);
            return;
          }
        }
        
        // Verify user is admin
        if (userData) {
          const userRole = userData.role || "";
          const userIsAdmin = userRole === "admin" || 
                            userRole === "Admin" ||
                            userData.isAdmin === true;
          setIsAdmin(userIsAdmin);
        } else {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error verifying admin role:", error);
        setIsAdmin(true);
      } finally {
        setIsChecking(false);
      }
    };
    
    verifyAdminAuth();
  }, [isAuthenticated, location.pathname]);
  
  // Check authorization
  const isAuthorized = useMemo(() => {
    return isAuthenticated && !!token && isAdmin;
  }, [isAuthenticated, token, isAdmin]);
  
  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-muted-foreground">
            {language === "en" ? "Checking authentication..." : "جارٍ التحقق من المصادقة..."}
          </p>
        </div>
      </div>
    );
  }
  
  // Redirect to admin login if not authorized
  if (!isAuthorized) {
    if (token && isAuthenticated && !isAdmin) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  
  return <>{children}</>;
};

// CompanyProtectedRoute component - checks authentication AND verifies user is company
// Redirects to company login if not authenticated or not a company
const CompanyProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, language } = useApp();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isChecking, setIsChecking] = useState(true);
  const [isCompany, setIsCompany] = useState(false);
  
  // Update token when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);
  
  // Verify token and company role
  useEffect(() => {
    const verifyCompanyAuth = async () => {
      const currentToken = localStorage.getItem("token");
      
      // If no token, not authorized - redirect immediately
      if (!currentToken) {
        setIsChecking(false);
        setIsCompany(false);
        return;
      }
      
      // Update token state
      setToken(currentToken);
      
      // Must have both token AND isAuthenticated
      if (!isAuthenticated) {
        localStorage.removeItem("token");
        setToken(null);
        setIsChecking(false);
        setIsCompany(false);
        return;
      }
      
      // Check if user is company by verifying role from localStorage or API
      try {
        const userDataStr = localStorage.getItem("user");
        let userData = null;
        
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr);
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
        
        // If no user data in localStorage, try to fetch from API
        if (!userData) {
          try {
            const response = await http.get("/users/me");
            userData = response.data?.data || response.data?.user || response.data;
            if (userData) {
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (error: any) {  
            setIsChecking(false);
            setIsCompany(true);
            return;
          }
        }
        
        // Verify user is company
        if (userData) {
          const userRole = userData.role || "";
          const bio = userData.bio || '';
          const hasCompanyName = userData.companyName !== undefined && userData.companyName !== null;
          const hasContactPersonInBio = bio && bio.includes('Contact Person:');
          const savedPartnerType = localStorage.getItem('partnerType');
          
          const userIsCompany = savedPartnerType === 'company' ||
                                userRole === 'company' || 
                                userRole === 'Company' ||
                                userData.isCompany === true ||
                                hasCompanyName ||
                                hasContactPersonInBio;
          setIsCompany(userIsCompany);
        } else {
          setIsCompany(true);
        }
      } catch (error) {
        console.error("Error verifying company role:", error);
        setIsCompany(true);
      } finally {
        setIsChecking(false);
      }
    };
    
    verifyCompanyAuth();
  }, [isAuthenticated, location.pathname]);
  
  // Check authorization
  const isAuthorized = useMemo(() => {
    return isAuthenticated && !!token && isCompany;
  }, [isAuthenticated, token, isCompany]);
  
  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-muted-foreground">
            {language === "en" ? "Checking authentication..." : "جارٍ التحقق من المصادقة..."}
          </p>
        </div>
      </div>
    );
  }
  
  // Redirect to company login if not authorized
  if (!isAuthorized) {
    if (token && isAuthenticated && !isCompany) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return <Navigate to="/auth/partner" replace state={{ from: location }} />;
  }
  
  return <>{children}</>;
};

// EngineerProtectedRoute component - checks authentication AND verifies user is engineer
// Redirects to engineer login if not authenticated or not an engineer
const EngineerProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, language } = useApp();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isChecking, setIsChecking] = useState(true);
  const [isEngineer, setIsEngineer] = useState(false);
  
  // Update token when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);
  
  // Verify token and engineer role
  useEffect(() => {
    const verifyEngineerAuth = async () => {
      const currentToken = localStorage.getItem("token");
      
      // If no token, not authorized - redirect immediately
      if (!currentToken) {
        setIsChecking(false);
        setIsEngineer(false);
        return;
      }
      
      // Update token state
      setToken(currentToken);
      
      // Must have both token AND isAuthenticated
      if (!isAuthenticated) {
        localStorage.removeItem("token");
        setToken(null);
        setIsChecking(false);
        setIsEngineer(false);
        return;
      }
      
      // Check if user is engineer by verifying role from localStorage or API
      try {
        const userDataStr = localStorage.getItem("user");
        let userData = null;
        
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr);
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
        
        // If no user data in localStorage, try to fetch from API
        if (!userData) {
          try {
            const response = await http.get("/auth/me");
            userData = response.data?.user || response.data?.data || response.data;
            if (userData) {
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (error: any) {
            console.warn("Could not fetch user data:", error);
            // If API call fails but token exists, allow access (backend will verify)
            setIsChecking(false);
            setIsEngineer(true);
            return;
          }
        }
        
        // Verify user is engineer
        if (userData) {
          const userRole = userData.role || "";
          const userIsEngineer = userRole === "engineer" || 
                                userRole === "partner" ||
                                userData.isEngineer === true;
          setIsEngineer(userIsEngineer);
        } else {
          // If no user data but token exists, allow access (backend will verify)
          setIsEngineer(true);
        }
      } catch (error) {
        console.error("Error verifying engineer role:", error);
        // On error, allow access (backend will verify)
        setIsEngineer(true);
      } finally {
        setIsChecking(false);
      }
    };
    
    verifyEngineerAuth();
  }, [isAuthenticated, location.pathname]);
  
  // Check authorization
  const isAuthorized = useMemo(() => {
    return isAuthenticated && !!token && isEngineer;
  }, [isAuthenticated, token, isEngineer]);
  
  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-muted-foreground">
            {language === "en" ? "Checking authentication..." : "جارٍ التحقق من المصادقة..."}
          </p>
        </div>
      </div>
    );
  }
  
  // Redirect to engineer login if not authorized
  if (!isAuthorized) {
    // If not engineer, clear token and redirect
    if (token && isAuthenticated && !isEngineer) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return <Navigate to="/auth/partner" replace state={{ from: location }} />;
  }
  
  return <>{children}</>;
};

// PublicRoute component - redirects to dashboard if already authenticated
// Used for login and auth pages
// BUT: /platform should be accessible even if authenticated
const PublicRoute = ({ children, allowWhenAuthenticated = false }: { children: React.ReactNode; allowWhenAuthenticated?: boolean }) => {
  const { isAuthenticated, isCheckingAuth, userRole } = useApp();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  
  // Update token when localStorage changes or when isAuthenticated changes
  useEffect(() => {
    const updateToken = () => {
      const currentToken = localStorage.getItem("token");
      setToken(currentToken);
    };
    
    // Check immediately
    updateToken();
    
    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', updateToken);
    
    // Also check when isAuthenticated changes (token might be set by setAccessToken)
    const intervalId = setInterval(updateToken, 100); // Check every 100ms while checking auth
    
    return () => {
      window.removeEventListener('storage', updateToken);
      clearInterval(intervalId);
    };
  }, [isAuthenticated, isCheckingAuth]);
  
  // Wait for auth check to complete
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // If allowWhenAuthenticated is true (e.g., for /platform), allow access even if authenticated
  // BUT: For /auth/partner, if user is authenticated, redirect to appropriate dashboard
  if (allowWhenAuthenticated) {
    // Check if user is authenticated and on /auth/partner - redirect to dashboard
    const currentToken = localStorage.getItem("token");
    if (isAuthenticated && currentToken && location.pathname === '/auth/partner') {
      // Use userRole from context (source of truth from backend)
      let dashboardPath = '/admin/dashboard'; // Default fallback
      
      if (userRole === 'admin') {
        dashboardPath = '/admin/dashboard';
      } else if (userRole === 'company') {
        dashboardPath = '/company/dashboard';
      } else if (userRole === 'engineer') {
        dashboardPath = '/engineer/dashboard';
      } else if (userRole === 'client') {
        dashboardPath = '/client/dashboard';
      }
      
      return <Navigate to={dashboardPath} replace />;
    }
    
    // For other routes with allowWhenAuthenticated (like /platform), allow access
    return <>{children}</>;
  }
  
  // If already authenticated, redirect to dashboard
  // Check localStorage directly for token to ensure we have the latest value
  const currentToken = localStorage.getItem("token");
  const isAuthorized = isAuthenticated && !!currentToken;
  
  console.log("🔍 PublicRoute check:", { 
    pathname: location.pathname, 
    isAuthenticated, 
    hasToken: !!currentToken, 
    isAuthorized,
    allowWhenAuthenticated 
  });
  
  // For login/auth pages, redirect to dashboard if already authenticated
  if (isAuthorized) {
    // Use userRole from context (source of truth from backend)
    let dashboardPath = '/admin/dashboard'; // Default fallback
    
    // First check if on specific login page - redirect to that dashboard
    if (location.pathname.includes('/company/login')) {
      dashboardPath = '/company/dashboard';
    } else if (location.pathname.includes('/client/login')) {
      dashboardPath = '/client/dashboard';
    } else if (location.pathname.includes('/engineer/login')) {
      dashboardPath = '/engineer/dashboard';
    } else if (location.pathname.includes('/admin/login')) {
      dashboardPath = '/admin/dashboard';
    } else {
      // If on generic auth page, determine dashboard from userRole in context
      if (userRole === 'admin') {
        dashboardPath = '/admin/dashboard';
      } else if (userRole === 'company') {
        dashboardPath = '/company/dashboard';
      } else if (userRole === 'engineer') {
        dashboardPath = '/engineer/dashboard';
      } else if (userRole === 'client') {
        dashboardPath = '/client/dashboard';
      }
    }
    
    return <Navigate to={dashboardPath} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  return (
    <>
      <SEOHead />
      <Routes location={location}>
      <Route path="/" element={<CompanyLanding />} />
      <Route 
        path="/platform" 
        element={
          <PublicRoute allowWhenAuthenticated={true}>
            <Landing />
          </PublicRoute>
        } 
      />
      <Route 
        path="/auth/:role" 
        element={
          <PublicRoute allowWhenAuthenticated={true}>
            <AuthPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } 
      />
      {/* Admin routes - Hidden from UI but accessible via direct URL */}
      <Route 
        path="/admin/login" 
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        } 
      />
      <Route
        path="/admin/dashboard"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <AdminAnalytics />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/content"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <ContentManagement />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <Orders />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/partner-requests"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <PartnerRequests />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/subscribers"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <Subscribers />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <AdminMessages />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <AdminNotifications />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <AdminUsers />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <AdminProjects />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/projects/:id"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <AdminProjectDetails />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/projects/:id/proposals"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <AdminProjectProposals />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RoleProtectedRoute allowedRole="admin">
            <AdminSettings />
          </RoleProtectedRoute>
        }
      />
      
      {/* Client Dashboard Routes */}
      <Route 
        path="/client/login" 
        element={
          <PublicRoute>
            <ClientLogin />
          </PublicRoute>
        } 
      />
      <Route 
        path="/client/dashboard" 
        element={
          <RoleProtectedRoute allowedRole="client">
            <ClientDashboard />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/client/projects" 
        element={
          <RoleProtectedRoute allowedRole="client">
            <ClientProjects />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/client/projects/browse" 
        element={
          <RoleProtectedRoute allowedRole="client">
            <ClientBrowseProjects />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/client/projects/new" 
        element={
          <RoleProtectedRoute allowedRole="client">
            <CreateProject />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/client/projects/:id" 
        element={
          <RoleProtectedRoute allowedRole="client">
            <ProjectDetails />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/client/engineers/:id" 
        element={
          <RoleProtectedRoute allowedRole="client">
            <EngineerProfileView />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/client/messages" 
        element={
          <RoleProtectedRoute allowedRole="client">
            <ClientMessages />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/client/notifications" 
        element={
          <RoleProtectedRoute allowedRole="client">
            <ClientNotifications />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/client/contracts" 
        element={
          <RoleProtectedRoute allowedRole="client">
            <ClientContracts />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/client/profile" 
        element={
          <RoleProtectedRoute allowedRole="client">
            <ClientProfile />
          </RoleProtectedRoute>
        } 
      />
      
      {/* Engineer Dashboard Routes */}
      <Route 
        path="/engineer/login" 
        element={
          <PublicRoute>
            <EngineerLogin />
          </PublicRoute>
        } 
      />
      <Route 
        path="/engineer/dashboard" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <EngineerDashboard />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/available-projects" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <AvailableProjects />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/projects" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <EngineerProjects />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/projects/:id" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <EngineerProjectDetails />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/projects/:id/proposal" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <SubmitProposal />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/messages" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <EngineerMessages />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/notifications" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <EngineerNotifications />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/portfolio" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <EngineerPortfolio />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/portfolio/add" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <AddWork />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/portfolio/:id/edit" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <AddWork />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/portfolio/:id" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <WorkDetails />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/engineer/profile" 
        element={
          <RoleProtectedRoute allowedRole="engineer">
            <EngineerProfile />
          </RoleProtectedRoute>
        } 
      />
      
      {/* Company Dashboard Routes */}
      <Route 
        path="/company/login" 
        element={
          <PublicRoute>
            <CompanyLogin />
          </PublicRoute>
        } 
      />
      <Route 
        path="/company/dashboard" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <CompanyDashboard />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/available-projects" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <CompanyAvailableProjects />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/projects" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <CompanyProjects />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/projects/:id" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <CompanyProjectDetails />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/projects/:id/proposal" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <CompanySubmitProposal />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/messages" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <CompanyMessages />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/notifications" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <CompanyNotifications />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/portfolio" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <CompanyPortfolio />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/portfolio/add" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <AddWork />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/portfolio/:id/edit" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <AddWork />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/portfolio/:id" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <WorkDetails />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/company/profile" 
        element={
          <RoleProtectedRoute allowedRole="company">
            <CompanyProfile />
          </RoleProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          {/* Toasters */}
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;