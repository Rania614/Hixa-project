import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ---------- AXIOS INSTANCE WITH INTERCEPTOR ----------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------------------------------------

const AdminLogin = () => {
  const { setIsAuthenticated } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      // Only allow admin login - verify credentials with API
      // Try different possible login endpoints
      let res;
      const loginEndpoints = [
        { path: '/auth/login', name: '/auth/login' },
        { path: '/admin/login', name: '/admin/login' },
        { path: '/login', name: '/login' },
      ];
      
      let lastError: any = null;
      for (const endpoint of loginEndpoints) {
        try {
          console.log(`🔄 Trying login endpoint: ${endpoint.name}`);
          res = await api.post(endpoint.path, { email, password });
          console.log(`✅ Login successful via ${endpoint.name}`);
          break; // Success, exit loop
        } catch (err: any) {
          lastError = err;
          console.log(`❌ ${endpoint.name} failed:`, err.response?.status || err.message);
          // If it's not a 404, don't try other endpoints (it's a real error like 401)
          if (err.response?.status !== 404) {
            throw err;
          }
        }
      }
      
      // If we tried all endpoints and none worked, throw the last error
      if (!res) {
        throw lastError || new Error('All login endpoints failed');
      }

      // Check if response has token and user is admin
      if (res.data && res.data.token) {
        // Verify user is admin (check role or isAdmin flag)
        const isAdmin = res.data.user?.role === 'admin' || 
                       res.data.user?.isAdmin === true || 
                       res.data.isAdmin === true ||
                       res.data.role === 'admin';

        if (!isAdmin) {
          setError('Access denied. Admin credentials required.');
          return;
        }

        console.log('Admin login success:', res.data);

        // Save token
        localStorage.setItem("token", res.data.token);

        // Set authenticated
        setIsAuthenticated(true);

        navigate('/admin/dashboard');
      } else {
        setError('Invalid response from server.');
      }
    } catch (err: any) {
      console.error('Login failed:', err.response || err.message);
      
      // Extract error message - server may return it as string or in object
      const getErrorMessage = (defaultMsg: string) => {
        if (!err.response?.data) return defaultMsg;
        
        // If data is a string, use it directly
        if (typeof err.response.data === 'string') {
          return err.response.data;
        }
        
        // If data is an object, check for message or error fields
        return err.response.data?.message || 
               err.response.data?.error || 
               defaultMsg;
      };
      
      // Handle different error types
      if (err.response?.status === 429) {
        setError(getErrorMessage('Too many login attempts. Please wait a few minutes and try again.'));
      } else if (err.response?.status === 401) {
        setError(getErrorMessage('Invalid email or password. Please check your credentials.'));
      } else if (err.response?.status === 403) {
        setError(getErrorMessage('Access denied. Admin credentials required.'));
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(getErrorMessage('Login failed. Please check your credentials.'));
      }
    }
  };

  // Removed useEffect to prevent infinite loop
  // Navigation is handled in handleLogin after successful authentication
  // and by AppRoutes when isAuthenticated changes

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <Card className="w-full max-w-md glass-card relative z-10">
        <CardHeader className="text-center">
          <div className="mb-2">
            <p className="text-sm font-semibold text-gold uppercase tracking-wider">
              Admin Login
            </p>
          </div>
          <div className="mx-auto mb-4 w-16 h-16 bg-gold/10 flex items-center justify-center hexagon">
            <HexagonIcon size="xl" className="text-gold">
              <Lock className="h-8 w-8 text-gold" />
            </HexagonIcon>
          </div>
          <CardTitle className="text-3xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="h@example.com" 
              autoComplete="email"
              required 
            />
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              autoComplete="current-password"
              required 
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full bg-gold">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
