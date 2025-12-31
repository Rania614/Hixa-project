import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { User, Loader2, Eye, EyeOff } from 'lucide-react';

const ClientLogin = () => {
  const { setIsAuthenticated, language } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(language === 'en' ? 'Please enter email and password' : 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    try {
      setLoading(true);
      const response = await http.post('/auth/login', { email, password });

      // Check if response has token and user is client
      if (response.data && response.data.token) {
        // Verify user is client (check role)
        const userRole = response.data.user?.role || response.data.role;
        const isClient = userRole === 'client' || userRole === 'Client';

        if (!isClient) {
          setError(language === 'en' ? 'Access denied. Client credentials required.' : 'تم رفض الوصول. يلزم بيانات اعتماد العميل.');
          return;
        }

        console.log('Client login success:', response.data);

        // Save token
        localStorage.setItem('token', response.data.token);

        // Save user data if available
        const userData = response.data.user;
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }

        // Set authenticated
        setIsAuthenticated(true);

        // Redirect to client dashboard
        navigate('/client/dashboard');
      } else {
        setError(language === 'en' ? 'Invalid response from server.' : 'استجابة غير صحيحة من الخادم.');
      }
    } catch (err: any) {
      console.error('Login failed:', err.response || err.message);
      
      // Extract error message
      const getErrorMessage = (defaultMsg: string) => {
        if (!err.response?.data) return defaultMsg;
        
        if (typeof err.response.data === 'string') {
          return err.response.data;
        }
        
        return err.response.data.message || 
               err.response.data.error || 
               err.response.data.msg || 
               defaultMsg;
      };

      const errorMessage = getErrorMessage(
        language === 'en' 
          ? 'Login failed. Please check your credentials.' 
          : 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.'
      );
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md glass-card shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mb-2">
            <p className="text-sm font-semibold text-gold uppercase tracking-wider">
              {language === 'en' ? 'Client Login' : 'تسجيل دخول العميل'}
            </p>
          </div>
          <div className="mx-auto w-20 h-20 bg-gold/10 flex items-center justify-center hexagon">
            <User className="h-10 w-10 text-gold" />
          </div>
          <CardTitle className="text-3xl font-bold">
            {language === 'en' ? 'Login' : 'تسجيل الدخول'}
          </CardTitle>
          <CardDescription className="text-base">
            {language === 'en' 
              ? 'Sign in to access your client dashboard' 
              : 'قم بتسجيل الدخول للوصول إلى لوحة تحكم العميل'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'en' ? 'you@example.com' : 'بريدك@example.com'}
                className="bg-secondary/50"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {language === 'en' ? 'Password' : 'كلمة المرور'}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'en' ? '••••••••' : '••••••••'}
                  className="bg-secondary/50 pr-10"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? (language === 'en' ? "Hide password" : "إخفاء كلمة المرور") : (language === 'en' ? "Show password" : "إظهار كلمة المرور")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'en' ? 'Signing in...' : 'جاري تسجيل الدخول...'}
                </>
              ) : (
                language === 'en' ? 'Sign In' : 'تسجيل الدخول'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? "Don't have an account? " : "ليس لديك حساب؟ "}
              <button
                type="button"
                onClick={() => navigate('/auth/client?mode=register')}
                className="text-gold hover:text-gold-dark font-medium underline"
              >
                {language === 'en' ? 'Sign up' : 'سجل الآن'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;

