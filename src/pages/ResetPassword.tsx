import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { Lock, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError(isAr ? 'رمز إعادة التعيين غير موجود' : 'Reset token is missing');
      toast.error(isAr ? 'الرابط غير صحيح' : 'Invalid link');
    }
  }, [token, isAr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(isAr ? 'رمز إعادة التعيين غير موجود' : 'Reset token is missing');
      return;
    }

    if (!password || !confirmPassword) {
      setError(isAr ? 'يرجى إدخال كلمة المرور وتأكيدها' : 'Please enter and confirm your password');
      return;
    }

    if (password.length < 8) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }

    // Basic password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setError(
        isAr 
          ? 'كلمة المرور يجب أن تحتوي على حرف كبير، حرف صغير، ورقم واحد على الأقل' 
          : 'Password must contain uppercase, lowercase, and a number'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(isAr ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      // Reset password via API
      await http.post('/auth/reset-password', { token, password });
      
      setSuccess(true);
      toast.success(
        isAr 
          ? 'تم إعادة تعيين كلمة المرور بنجاح' 
          : 'Password has been reset successfully'
      );
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/client/login');
      }, 2000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      
      let errorMessage = isAr 
        ? 'حدث خطأ أثناء إعادة تعيين كلمة المرور' 
        : 'An error occurred while resetting password';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4" dir={isAr ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isAr ? 'رابط غير صحيح' : 'Invalid Link'}
            </CardTitle>
            <CardDescription>
              {isAr 
                ? 'رمز إعادة التعيين غير موجود أو غير صحيح' 
                : 'Reset token is missing or invalid'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/forgot-password">
              <Button className="w-full">
                {isAr ? 'العودة إلى صفحة إعادة التعيين' : 'Back to Reset Password'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4" dir={isAr ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isAr ? 'تم بنجاح!' : 'Success!'}
            </CardTitle>
            <CardDescription>
              {isAr 
                ? 'تم إعادة تعيين كلمة المرور بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول...' 
                : 'Password has been reset successfully. Redirecting to login...'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {isAr 
              ? 'أدخل كلمة المرور الجديدة' 
              : 'Enter your new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isAr ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoFocus
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? (isAr ? "إخفاء كلمة المرور" : "Hide password") : (isAr ? "إظهار كلمة المرور" : "Show password")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={isAr ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? (isAr ? "إخفاء كلمة المرور" : "Hide password") : (isAr ? "إظهار كلمة المرور" : "Show password")}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isAr ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                </>
              )}
            </Button>

            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                {isAr ? 'العودة إلى صفحة إعادة التعيين' : 'Back to Reset Request'}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
