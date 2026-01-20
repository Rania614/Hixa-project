import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !email.trim()) {
      setError(isAr ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(isAr ? 'البريد الإلكتروني غير صحيح' : 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      
      // Send password reset request to backend
      const response = await http.post('/auth/forgot-password', { email });
      
      setSuccess(true);
      toast.success(
        isAr 
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' 
          : 'Password reset link has been sent to your email'
      );
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      let errorMessage = isAr 
        ? 'حدث خطأ أثناء إرسال البريد الإلكتروني' 
        : 'An error occurred while sending the email';
      
      // Handle API errors
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 429) {
        errorMessage = isAr 
          ? 'تم إرسال طلبات كثيرة. يرجى المحاولة لاحقاً' 
          : 'Too many requests. Please try again later';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
          </CardTitle>
          <CardDescription>
            {isAr 
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور' 
              : 'Enter your email address and we\'ll send you a link to reset your password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isAr ? 'تم الإرسال بنجاح!' : 'Email Sent Successfully!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAr 
                    ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}. يرجى التحقق من بريدك الإلكتروني.` 
                    : `A password reset link has been sent to ${email}. Please check your email.`}
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  {isAr 
                    ? 'إذا لم تجد البريد، تحقق من مجلد الرسائل غير المرغوب فيها (Spam)' 
                    : 'If you don\'t see the email, check your spam folder'}
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  onClick={() => navigate('/auth/partner')}
                  className="w-full"
                >
                  {isAr ? 'العودة إلى تسجيل الدخول' : 'Back to Login'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full"
                >
                  {isAr ? 'إرسال مرة أخرى' : 'Send Again'}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={isAr ? 'example@email.com' : 'Enter your email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isAr ? 'جاري الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {isAr ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link 
                  to="/auth/partner" 
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  {isAr ? 'العودة إلى تسجيل الدخول' : 'Back to Login'}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
