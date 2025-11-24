import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AuthPage = () => {
  const { setIsAuthenticated } = useApp();
  const navigate = useNavigate();
  const { role } = useParams<{ role: 'client' | 'partner' }>();
  
  const [authRole] = useState<'client' | 'partner'>(role === 'client' || role === 'partner' ? role : 'client');

  const handleAuthSuccess = () => {
    // Authentication successful - redirect to dashboard
    setIsAuthenticated(true);
    navigate('/admin/dashboard');
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
        />
      </div>
    </div>
  );
};

export default AuthPage;