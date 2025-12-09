import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { useMemo, useState, useEffect } from "react";

import Landing from "./pages/PlatformLanding";
import AdminLogin from "./pages/admin-dashboard/AdminLogin";
import AdminDashboard from "./pages/admin-dashboard/AdminDashboard";
import ContentManagement from "./pages/admin-dashboard/ContentManagement";
import Orders from "./pages/admin-dashboard/Orders";
import Subscribers from "./pages/admin-dashboard/Subscribers";
import AdminMessages from "./pages/admin-dashboard/AdminMessages";
import NotFound from "./pages/NotFound";
import CompanyLanding from "./pages/CompanyLanding";
import AuthPage from "./pages/AuthPage";

// Client Dashboard
import ClientDashboard from "./pages/client-dashboard/ClientDashboard";
import ClientProjects from "./pages/client-dashboard/ClientProjects";
import ClientMessages from "./pages/client-dashboard/ClientMessages";
import ClientNotifications from "./pages/client-dashboard/ClientNotifications";
import ClientContracts from "./pages/client-dashboard/ClientContracts";
import ClientProfile from "./pages/client-dashboard/ClientProfile";
import ProjectDetails from "./pages/client-dashboard/ProjectDetails";
import CreateProject from "./pages/client-dashboard/CreateProject";
import EngineerProfileView from "./pages/client-dashboard/EngineerProfileView";

// Engineer Dashboard
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

const queryClient = new QueryClient();

// ProtectedRoute component - checks both authentication state and token
// Redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useApp();
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
      const currentToken = localStorage.getItem("token");
      
      // If no token, not authorized - redirect immediately
      if (!currentToken) {
        setIsChecking(false);
        // Clear authentication state if no token
        if (isAuthenticated) {
          // This shouldn't happen, but clear it just in case
        }
        return;
      }
      
      // Update token state
      setToken(currentToken);
      
      // CRITICAL: Must have both token AND isAuthenticated to be authorized
      // If token exists but isAuthenticated is false, token is invalid
      if (!isAuthenticated) {
        // Token exists but user is not authenticated - clear token and redirect
        localStorage.removeItem("token");
        setToken(null);
        setIsChecking(false);
        return;
      }
      
      // Both token and isAuthenticated exist - allow access
      setIsChecking(false);
    };
    
    verifyToken();
  }, [isAuthenticated, location.pathname]);
  
  // Use useMemo to prevent unnecessary re-renders
  const isAuthorized = useMemo(() => {
    // Must have both authentication state and valid token
    return isAuthenticated && !!token;
  }, [isAuthenticated, token]);
  
  // Show loading while checking
  if (isChecking) {
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
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  
  return <>{children}</>;
};

// PublicRoute component - redirects to dashboard if already authenticated
// Used for login and auth pages
// BUT: /platform should be accessible even if authenticated
const PublicRoute = ({ children, allowWhenAuthenticated = false }: { children: React.ReactNode; allowWhenAuthenticated?: boolean }) => {
  const { isAuthenticated } = useApp();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  
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
  
  // If already authenticated, redirect to dashboard (unless allowWhenAuthenticated is true)
  const isAuthorized = useMemo(() => {
    return isAuthenticated && !!token;
  }, [isAuthenticated, token]);
  
  // If allowWhenAuthenticated is true (e.g., for /platform), allow access even if authenticated
  if (allowWhenAuthenticated) {
    return <>{children}</>;
  }
  
  // For login/auth pages, redirect to dashboard if already authenticated
  if (isAuthorized) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  return (
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
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content"
        element={
          <ProtectedRoute>
            <ContentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subscribers"
        element={
          <ProtectedRoute>
            <Subscribers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute>
            <AdminMessages />
          </ProtectedRoute>
        }
      />
      
      {/* Client Dashboard Routes */}
      <Route path="/client/dashboard" element={<ClientDashboard />} />
      <Route path="/client/projects" element={<ClientProjects />} />
      <Route path="/client/projects/new" element={<CreateProject />} />
      <Route path="/client/projects/:id" element={<ProjectDetails />} />
      <Route path="/client/engineers/:id" element={<EngineerProfileView />} />
      <Route path="/client/messages" element={<ClientMessages />} />
      <Route path="/client/notifications" element={<ClientNotifications />} />
      <Route path="/client/contracts" element={<ClientContracts />} />
      <Route path="/client/profile" element={<ClientProfile />} />
      
      {/* Engineer Dashboard Routes */}
      <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
      <Route path="/engineer/available-projects" element={<AvailableProjects />} />
      <Route path="/engineer/projects" element={<EngineerProjects />} />
      <Route path="/engineer/projects/:id" element={<EngineerProjectDetails />} />
      <Route path="/engineer/projects/:id/proposal" element={<SubmitProposal />} />
      <Route path="/engineer/messages" element={<EngineerMessages />} />
      <Route path="/engineer/notifications" element={<EngineerNotifications />} />
      <Route path="/engineer/portfolio" element={<EngineerPortfolio />} />
      <Route path="/engineer/portfolio/add" element={<AddWork />} />
      <Route path="/engineer/portfolio/:id" element={<WorkDetails />} />
      <Route path="/engineer/profile" element={<EngineerProfile />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
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