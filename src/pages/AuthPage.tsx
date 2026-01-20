/**
 * AuthPage Component
 * 
 * Unified authentication page for all roles (Client, Engineer, Company)
 * Features:
 * - Login/Register tabs
 * - Role-based registration (Client, Engineer, Company tabs)
 * - Smart redirect based on user.role from backend
 * - RTL support for Arabic
 */

import { useSearchParams } from 'react-router-dom';
import { UnifiedAuth } from '@/components/auth/UnifiedAuth';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  
  // Get mode from URL (login or register)
  const mode = searchParams.get('mode');
  const defaultMode = mode === 'register' ? 'register' : 'login';
  
  // Get role from URL (client, engineer, company)
  const role = searchParams.get('role');
  const defaultRole = role === 'engineer' || role === 'company' 
    ? (role as 'engineer' | 'company')
    : 'client';

  return (
    <UnifiedAuth 
      defaultMode={defaultMode}
      defaultRole={defaultRole}
    />
  );
};

export default AuthPage;
