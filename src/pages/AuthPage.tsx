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

  const handleAuthSuccess = () => {
    // Authentication successful - redirect to appropriate dashboard based on role
    setIsAuthenticated(true);
    
    if (role === 'client') {
      navigate('/client/dashboard');
    } else if (role === 'partner') {
      navigate('/engineer/dashboard');
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