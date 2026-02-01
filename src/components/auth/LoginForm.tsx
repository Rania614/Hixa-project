/**
 * LoginForm Component
 * 
 * Unified login form for all roles (Client, Engineer, Company)
 * Features:
 * - Email and Password fields
 * - Remember Me checkbox (extends token to 30 days)
 * - Loading states
 * - Error handling
 * - Smart redirect based on user role after login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { loginSchema, type LoginFormData } from '@/lib/validation';
import { login, getDashboardPath } from '@/services/authApi';
import { useApp } from '@/context/AppContext';
import { toast } from '@/components/ui/sonner';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated, setUserRole, language } = useApp();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await login(data);
      
      // Update context
      setIsAuthenticated(true);
      
      // Extract and normalize role
      const userRole = response.user?.role?.toLowerCase();
      let normalizedRole: 'client' | 'engineer' | 'company' | 'admin' | null = null;
      
      if (userRole === 'client') normalizedRole = 'client';
      else if (userRole === 'engineer' || userRole === 'partner') normalizedRole = 'engineer';
      else if (userRole === 'company') normalizedRole = 'company';
      else if (userRole === 'admin') normalizedRole = 'admin';
      
      setUserRole(normalizedRole);
      
      // Show success message
      toast.success(
        language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful',
        {
          description: language === 'ar' 
            ? `مرحباً ${response.user.name}` 
            : `Welcome ${response.user.name}`,
        }
      );
      
      // Get redirect path based on role
      const redirectPath = getDashboardPath(response.user.role);
      
      // Call optional success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirect after short delay
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 500);
      
    } catch (error: any) {
      // Handle errors
      const errorMessage = error.message || 
        (language === 'ar' 
          ? 'حدث خطأ أثناء تسجيل الدخول' 
          : 'An error occurred during login');
      
      toast.error(errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
                  {...field}
                  className="w-full"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                    {...field}
                    className="w-full pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember Me */}
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  {language === 'ar' ? 'تذكرني (30 يوم)' : 'Remember Me (30 days)'}
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' 
                    ? 'تمديد جلسة تسجيل الدخول إلى 30 يوم' 
                    : 'Extend login session to 30 days'}
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gold hover:bg-gold-dark text-black font-semibold hexagon-none rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...'}
            </>
          ) : (
            language === 'ar' ? 'تسجيل الدخول' : 'Login'
          )}
        </Button>

        {/* Forgot password link */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="mt-2 text-xs text-muted-foreground hover:text-gold transition-colors underline-offset-4 hover:underline"
          >
            {language === 'ar' ? 'هل نسيت كلمة المرور؟' : 'Forgot your password?'}
          </button>
        </div>

        {/* Don't have an account link */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => {
              if (onSwitchToRegister) {
                onSwitchToRegister();
              }
            }}
            className="text-sm text-muted-foreground hover:text-gold transition-colors underline-offset-4 hover:underline"
          >
            {language === 'ar' ? 'ليس لدي حساب' : "Don't have an account?"}
          </button>
        </div>
      </form>
    </Form>
  );
};

