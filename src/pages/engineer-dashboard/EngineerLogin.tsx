import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Wrench, Eye, EyeOff } from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { useNavigate, Link } from 'react-router-dom';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';

const EngineerLogin = () => {
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
    setLoading(true);

    if (!email || !password) {
      setError(language === 'en' 
        ? 'Please enter email and password' 
        : 'الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      setLoading(false);
      return;
    }

    try {
      // Login API call
      const res = await http.post('/auth/login', { email, password });

      // Check if response has token
      if (res.data && res.data.token) {
        // Verify user is engineer (check role)
        const userRole = res.data.user?.role || res.data.role;
        const isEngineer = userRole === 'engineer' || 
                          userRole === 'partner' ||
                          res.data.user?.isEngineer === true ||
                          res.data.isEngineer === true;

        // Reject admin users
        const isAdmin = userRole === 'admin' || 
                       res.data.user?.isAdmin === true || 
                       res.data.isAdmin === true;

        if (isAdmin) {
          setError(language === 'en' 
            ? 'Access denied. Please use the admin login page.' 
            : 'تم الرفض. يرجى استخدام صفحة تسجيل دخول الأدمن.');
          setLoading(false);
          return;
        }

        if (!isEngineer) {
          setError(language === 'en' 
            ? 'Access denied. Engineer credentials required.' 
            : 'تم الرفض. يلزم بيانات اعتماد المهندس.');
          setLoading(false);
          return;
        }

        console.log('Engineer login success:', res.data);

        // Save token
        localStorage.setItem("token", res.data.token);
        
        // Save user data if available
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        // Set authenticated
        setIsAuthenticated(true);

        toast.success(language === 'en' ? 'Login successful' : 'تم تسجيل الدخول بنجاح');

        // Wait a bit to ensure state is updated before navigation
        // This fixes the race condition where navigate() happens before setIsAuthenticated() updates
        setTimeout(() => {
          navigate('/engineer/dashboard');
        }, 100);
      } else {
        setError(language === 'en' 
          ? 'Invalid response from server.' 
          : 'استجابة غير صحيحة من الخادم.');
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
        setError(getErrorMessage(
          language === 'en' 
            ? 'Too many login attempts. Please wait a few minutes and try again.' 
            : 'محاولات تسجيل دخول كثيرة جداً. يرجى الانتظار بضع دقائق والمحاولة مرة أخرى.'
        ));
      } else if (err.response?.status === 401) {
        setError(getErrorMessage(
          language === 'en' 
            ? 'Invalid email or password. Please check your credentials.' 
            : 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق من بيانات الاعتماد.'
        ));
      } else if (err.response?.status === 403) {
        setError(getErrorMessage(
          language === 'en' 
            ? 'Access denied. Engineer credentials required.' 
            : 'تم الرفض. يلزم بيانات اعتماد المهندس.'
        ));
      } else if (err.response?.status >= 500) {
        setError(language === 'en' 
          ? 'Server error. Please try again later.' 
          : 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.');
      } else {
        setError(getErrorMessage(
          language === 'en' 
            ? 'Login failed. Please check your credentials.' 
            : 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.'
        ));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
      <Card className="w-full max-w-md glass-card relative z-10 border-hexa-border">
        <CardHeader className="text-center">
          <div className="mb-2">
            <p className="text-sm font-semibold text-hexa-secondary uppercase tracking-wider">
              {language === 'en' ? 'Engineer Login' : 'تسجيل دخول المهندس'}
            </p>
          </div>
          <div className="mx-auto mb-4 w-16 h-16 bg-hexa-secondary/10 flex items-center justify-center hexagon">
            <HexagonIcon size="xl" className="text-hexa-secondary">
              <Wrench className="h-8 w-8 text-hexa-secondary" />
            </HexagonIcon>
          </div>
          <CardTitle className="text-3xl font-bold text-hexa-text-dark">
            {language === 'en' ? 'Login' : 'تسجيل الدخول'}
          </CardTitle>
          <CardDescription className="text-hexa-text-light">
            {language === 'en' 
              ? 'Enter your credentials to access the engineer dashboard' 
              : 'أدخل بيانات الاعتماد للوصول إلى لوحة تحكم المهندس'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-hexa-text-dark">
                {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
              </label>
              <Input 
                id="email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder={language === 'en' ? "engineer@example.com" : "المهندس@example.com"} 
                autoComplete="email"
                className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                required 
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-hexa-text-dark">
                {language === 'en' ? 'Password' : 'كلمة المرور'}
              </label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={language === 'en' ? "••••••••" : "••••••••"} 
                  autoComplete="current-password"
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11 pr-10"
                  required 
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-hexa-text-light hover:text-hexa-secondary transition-colors"
                  aria-label={showPassword ? (language === 'en' ? "Hide password" : "إخفاء كلمة المرور") : (language === 'en' ? "Show password" : "إظهار كلمة المرور")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {language === 'en' ? 'Signing in...' : 'جاري تسجيل الدخول...'}
                </>
              ) : (
                language === 'en' ? 'Sign In' : 'تسجيل الدخول'
              )}
            </Button>

            <div className="text-center mt-4">
              <Link 
                to="/forgot-password" 
                className="text-sm text-hexa-secondary hover:underline font-medium block mb-3"
              >
                {language === 'en' ? 'Forgot password?' : 'نسيت كلمة المرور؟'}
              </Link>
              <p className="text-sm text-hexa-text-light">
                {language === 'en' 
                  ? "Don't have an account? " 
                  : "ليس لديك حساب؟ "}
                <button
                  type="button"
                  onClick={() => navigate('/auth/partner?mode=register')}
                  className="text-hexa-secondary hover:underline font-medium"
                >
                  {language === 'en' ? 'Register' : 'سجل الآن'}
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineerLogin;

