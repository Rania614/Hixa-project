/**
 * AuthPage Component
 * 
 * Handles authentication flow and redirects based on user.role from backend.
 * No longer uses partnerType, savedPartnerType, hasCompanyName, or bio fields.
 * 
 * Security:
 * - Only uses user.role from backend response (stored in localStorage by AuthModal)
 * - Updates AppContext with userRole after successful authentication
 */

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { UserRole } from '@/context/AppContext';

const AuthPage = () => {
  const { setIsAuthenticated, setUserRole, language } = useApp();
  const navigate = useNavigate();
  const { role } = useParams<{ role: 'client' | 'partner' }>();
  const [searchParams] = useSearchParams();
  
  const [authRole] = useState<'client' | 'partner'>(role === 'client' || role === 'partner' ? role : 'client');
  
  // Check if mode=register is in URL, default to 'login'
  const mode = searchParams.get('mode');
  const initialMode = mode === 'register' ? 'register' : 'login';

  /**
   * Handle successful authentication
   * Determines dashboard path based ONLY on user.role from backend
   */
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    
    // Get user data from localStorage (set by AuthModal after successful login/register)
    const userDataStr = localStorage.getItem('user');
    let userData = null;
    
    if (userDataStr) {
      try {
        userData = JSON.parse(userDataStr);
      } catch (e) {
        // Invalid JSON, will use default redirect
      }
    }
    
    // Extract role from user data (backend response)
    const backendRole = userData?.role?.toLowerCase();
    let normalizedRole: UserRole = null;
    
    if (backendRole === 'client' || backendRole === 'customer') normalizedRole = 'client';
    else if (backendRole === 'engineer' || backendRole === 'partner') normalizedRole = 'engineer';
    else if (backendRole === 'company') normalizedRole = 'company';
    else if (backendRole === 'admin') normalizedRole = 'admin';
    
    // Update context with role
    setUserRole(normalizedRole);
    
    // Determine dashboard path based ONLY on role from backend
    let redirectPath = '/client/login'; // Default: redirect to login if role is unclear
    
    if (normalizedRole === 'admin') {
      redirectPath = '/admin/dashboard';
    } else if (normalizedRole === 'company') {
      redirectPath = '/company/dashboard';
    } else if (normalizedRole === 'engineer') {
      redirectPath = '/engineer/dashboard';
    } else if (normalizedRole === 'client') {
      redirectPath = '/client/dashboard';
    }
    
    // Navigate after a small delay to ensure context is updated
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 100);
  };

  const handleClose = () => {
    // Go back to the previous page or to the home page
    navigate(-1);
  };

  // Temporarily disable self-service registration/login UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Button
        onClick={handleClose}
        variant="ghost"
        className="absolute top-4 left-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === 'ar' ? 'رجوع' : 'Back'}
      </Button>
      <div className="w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">
          {language === 'ar' ? 'التسجيل وتسجيل الدخول مغلقان حالياً' : 'Sign up / login are currently disabled'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === 'ar'
            ? 'يرجى التواصل مع إدارة النظام لفتح حساب أو الحصول على صلاحيات الدخول.'
            : 'Please contact the platform administration to create an account or get access.'}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
