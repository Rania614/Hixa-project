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
import Subscribers from "./pages/admin-dashboard/Subscribers";
import NotFound from "./pages/NotFound";
import CompanyLanding from "./pages/CompanyLanding";
import AuthPage from "./pages/AuthPage";

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
        path="/admin/subscribers"
        element={
          <ProtectedRoute>
            <Subscribers />
          </ProtectedRoute>
        }
      />
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
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;