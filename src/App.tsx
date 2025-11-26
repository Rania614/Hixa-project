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
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useApp();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  
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
  
  // Use useMemo to prevent unnecessary re-renders
  const isAuthorized = useMemo(() => {
    return isAuthenticated && !!token;
  }, [isAuthenticated, token]);
  
  // Must have both authentication state and valid token
  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  // Memoize route elements to prevent unnecessary re-renders
  const platformElement = useMemo(() => {
    return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Landing />;
  }, [isAuthenticated]);

  const loginElement = useMemo(() => {
    return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />;
  }, [isAuthenticated]);

  return (
    <Routes location={location}>
      <Route path="/" element={<CompanyLanding />} />
      <Route path="/platform" element={platformElement} />
      <Route path="/auth/:role" element={<AuthPage />} />
      <Route path="/admin/login" element={loginElement} />
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