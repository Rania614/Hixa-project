import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AuthPage = () => {
  const { setIsAuthenticated } = useApp();
  const navigate = useNavigate();
  const { role } = useParams<{ role: 'client' | 'partner' }>();
  const [searchParams] = useSearchParams();
  
  const [authRole] = useState<'client' | 'partner'>(role === 'client' || role === 'partner' ? role : 'client');
  
  // Check if mode=register is in URL, default to 'login'
  const mode = searchParams.get('mode');
  const initialMode = mode === 'register' ? 'register' : 'login';

  const handleAuthSuccess = (partnerType?: 'engineer' | 'company') => {
    // Authentication successful - redirect to appropriate dashboard based on ACTUAL user role
    setIsAuthenticated(true);
    
    // Check user data from localStorage to determine actual role
    const userDataStr = localStorage.getItem('user');
    let userData = null;
    if (userDataStr) {
      try {
        userData = JSON.parse(userDataStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    const userRole = userData?.role || '';
    const savedPartnerType = localStorage.getItem('partnerType');
    const bio = userData?.bio || '';
    const hasCompanyName = userData?.companyName !== undefined && userData?.companyName !== null;
    const hasContactPersonInBio = bio && bio.includes('Contact Person:');
    
    // Determine if user is company (companies may have role: "client" in database)
    const isCompany = partnerType === 'company' || 
                      savedPartnerType === 'company' ||
                      userRole === 'company' || 
                      userRole === 'Company' ||
                      userData?.isCompany === true ||
                      hasCompanyName ||
                      hasContactPersonInBio;
    
    // Determine if user is engineer
    const isEngineer = partnerType === 'engineer' ||
                       savedPartnerType === 'engineer' ||
                       userRole === 'engineer' || 
                       userRole === 'Engineer' ||
                       userRole === 'partner' ||
                       userData?.isEngineer === true;
    
    // Determine if user is admin
    const isAdmin = userRole === 'admin' || 
                   userRole === 'Admin' ||
                   userData?.isAdmin === true;
    
    // Determine redirect path
    let redirectPath = '/client/dashboard'; // Default fallback
    
    if (isAdmin) {
      redirectPath = '/admin/dashboard';
    } else if (isCompany) {
      redirectPath = '/company/dashboard';
    } else if (isEngineer) {
      redirectPath = '/engineer/dashboard';
    } else if (userRole === 'client' || userRole === 'Client') {
      redirectPath = '/client/dashboard';
    } else {
      // Fallback: try to determine from URL role if user role is unclear
      if (role === 'client') {
        redirectPath = '/client/dashboard';
      } else if (role === 'partner') {
        // Default to engineer dashboard for partner role if unclear
        redirectPath = '/engineer/dashboard';
      }
    }
    
    // Log for debugging
    console.log('🔍 Redirecting user:', {
      userRole,
      partnerType,
      savedPartnerType,
      isCompany,
      isEngineer,
      isAdmin,
      hasCompanyName,
      redirectPath,
      userData,
      token: localStorage.getItem('token') ? 'exists' : 'missing'
    });
    
    // Use window.location.href for reliable redirect that forces page reload
    // This ensures ProtectedRoute will check authentication state after reload
    window.location.href = redirectPath;
  };

  const handleClose = () => {
    // Go back to the previous page or to the home page
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Button
        onClick={handleClose}
        variant="ghost"
        className="absolute top-4 left-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="w-full max-w-md">
        <AuthModal 
          isOpen={true}
          onClose={handleClose}
          onAuthSuccess={handleAuthSuccess}
          role={authRole}
          initialMode={initialMode}
        />
      </div>
    </div>
  );
};

export default AuthPage;