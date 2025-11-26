import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

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
  const token = localStorage.getItem("token");
  
  // Must have both authentication state and valid token
  if (!isAuthenticated || !token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      <Route path="/" element={<CompanyLanding />} />
      <Route
        path="/platform"
        element={isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Landing />}
      />
      <Route path="/auth/:role" element={<AuthPage />} />
      <Route
        path="/admin/login"
        element={isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />}
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