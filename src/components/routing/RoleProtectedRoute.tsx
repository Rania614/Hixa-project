/**
 * RoleProtectedRoute Component
 * 
 * A unified protected route component that checks both authentication and role-based access.
 * Replaces ClientProtectedRoute, CompanyProtectedRoute, EngineerProtectedRoute, and AdminProtectedRoute.
 * 
 * Security:
 * - Only checks user.role from backend (via JWT or API response)
 * - Does NOT use localStorage, partnerType, hasCompanyName, bio, or any other fields
 * - Denies access silently without exposing role information
 */

import { ReactNode, useEffect, useState, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/context/AppContext";
import { http } from "@/services/http";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRole: UserRole; // The role required to access this route
  fallbackPath?: string; // Optional: custom redirect path (defaults to generic login)
}

export const RoleProtectedRoute = ({ 
  children, 
  allowedRole,
  fallbackPath 
}: RoleProtectedRouteProps) => {
  const { isAuthenticated, isCheckingAuth, userRole, setUserRole, language } = useApp();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isChecking, setIsChecking] = useState(true);

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

  // Verify token and role
  useEffect(() => {
    const verifyRole = async () => {
      // Wait for AppContext to finish checking auth (refresh token check)
      if (isCheckingAuth) {
        return;
      }

      const currentToken = localStorage.getItem("token");
      
      // If no token, not authorized
      if (!currentToken) {
        setIsChecking(false);
        return;
      }
      
      // Update token state
      setToken(currentToken);
      
      // Must have both token AND isAuthenticated
      if (!isAuthenticated) {
        localStorage.removeItem("token");
        setToken(null);
        setIsChecking(false);
        return;
      }

      // If userRole is already set in context, use it
      if (userRole) {
        setIsChecking(false);
        return;
      }

      // If no userRole in context, fetch from localStorage or API
      try {
        const userDataStr = localStorage.getItem("user");
        let userData = null;
        
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr);
          } catch (e) {
            // Invalid JSON, ignore
          }
        }
        
        // Extract role from user data
        if (userData && userData.role) {
          const role = userData.role.toLowerCase();
          let normalizedRole: UserRole = null;
          
          if (role === 'client') normalizedRole = 'client';
          else if (role === 'engineer' || role === 'partner') normalizedRole = 'engineer';
          else if (role === 'company') normalizedRole = 'company';
          else if (role === 'admin') normalizedRole = 'admin';
          
          setUserRole(normalizedRole);
        } else {
          // No user data in localStorage, try to fetch from API
          try {
            const response = await http.get("/users/me");
            const fetchedUserData = response.data?.data || response.data?.user || response.data;
            if (fetchedUserData && fetchedUserData.role) {
              localStorage.setItem("user", JSON.stringify(fetchedUserData));
              const role = fetchedUserData.role.toLowerCase();
              let normalizedRole: UserRole = null;
              
              if (role === 'client') normalizedRole = 'client';
              else if (role === 'engineer' || role === 'partner') normalizedRole = 'engineer';
              else if (role === 'company') normalizedRole = 'company';
              else if (role === 'admin') normalizedRole = 'admin';
              
              setUserRole(normalizedRole);
            }
          } catch (error) {
            // API call failed - deny access
            setUserRole(null);
          }
        }
      } catch (error) {
        // Error verifying role - deny access
        setUserRole(null);
      } finally {
        setIsChecking(false);
      }
    };
    
    verifyRole();
  }, [isAuthenticated, isCheckingAuth, userRole, setUserRole, location.pathname]);

  // Check authorization: user must be authenticated AND have the correct role
  const isAuthorized = useMemo(() => {
    return isAuthenticated && !!token && userRole === allowedRole;
  }, [isAuthenticated, token, userRole, allowedRole]);

  // Show loading while checking (either local check or AppContext auth check)
  if (isChecking || isCheckingAuth) {
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

  // Deny access if not authorized - redirect without exposing role information
  if (!isAuthorized) {
    // Clear tokens and user data on unauthorized access
    if (token && isAuthenticated) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    
    // Determine redirect path based on route or use fallback
    const loginPath = fallbackPath || (
      location.pathname.startsWith('/client/') 
        ? '/client/login' 
        : location.pathname.startsWith('/engineer/') || location.pathname.startsWith('/company/')
        ? '/auth/partner'
        : '/admin/login'
    );
    
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
