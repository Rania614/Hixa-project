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
    // Authentication successful - redirect to appropriate dashboard based on role
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
    // Check if user is company by checking partnerType from localStorage or user data
    // Note: Companies are registered as role: "client" in database, so we check for companyName or bio field
    const savedPartnerType = localStorage.getItem('partnerType');
    const bio = userData?.bio || '';
    const hasCompanyName = userData?.companyName !== undefined && userData?.companyName !== null;
    const hasContactPersonInBio = bio && bio.includes('Contact Person:');
    
    const isCompany = partnerType === 'company' || 
                      savedPartnerType === 'company' ||
                      userRole === 'company' || 
                      userRole === 'Company' ||
                      userData?.isCompany === true ||
                      hasCompanyName ||
                      hasContactPersonInBio;
    
    if (role === 'client') {
      navigate('/client/dashboard');
    } else if (role === 'partner') {
      // Check if it's a company first
      if (isCompany) {
        navigate('/company/dashboard');
      } else if (partnerType === 'engineer' || userRole === 'engineer' || userRole === 'Engineer') {
        navigate('/engineer/dashboard');
      } else {
        // Default to engineer dashboard for partner role
        navigate('/engineer/dashboard');
      }
    } else {
      // Default to admin dashboard if role is not specified
      navigate('/admin/dashboard');
    }
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