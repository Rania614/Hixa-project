/**
 * UnifiedAuth Component
 * 
 * Unified authentication page with tabs for Login and Registration
 * Features:
 * - Login/Register toggle
 * - Role-based registration tabs (Client, Engineer, Company)
 * - Clean, modern UI with Tailwind CSS
 * - Responsive design
 * - RTL support for Arabic
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { RegistrationForm } from './RegistrationForm';
import { useApp } from '@/context/AppContext';

interface UnifiedAuthProps {
  defaultMode?: 'login' | 'register';
  defaultRole?: 'client' | 'engineer' | 'company';
  onClose?: () => void;
  showBackButton?: boolean;
}

export const UnifiedAuth: React.FC<UnifiedAuthProps> = ({
  defaultMode = 'login',
  defaultRole = 'client',
  onClose,
  showBackButton = true,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const navigate = useNavigate();
  const { language } = useApp();

  const handleSuccess = () => {
    // Navigation is handled by the forms themselves
    // This callback can be used for additional actions if needed
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Back Button */}
      {showBackButton && (
        <Button
          onClick={handleBack}
          variant="ghost"
          size="sm"
          className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} flex items-center gap-2`}
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL && 'rotate-180'}`} />
          {language === 'ar' ? 'رجوع' : 'Back'}
        </Button>
      )}

      {/* Auth Card */}
      <Card className="w-full max-w-md shadow-xl border-gold/20">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">
            {language === 'ar' ? 'منصة الهندسة' : 'Engineering Platform'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? language === 'ar'
                ? 'تسجيل الدخول إلى حسابك'
                : 'Sign in to your account'
              : language === 'ar'
              ? 'إنشاء حساب جديد'
              : 'Create a new account'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as 'login' | 'register')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {language === 'ar' ? 'التسجيل' : 'Register'}
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-6">
              <LoginForm 
                onSuccess={handleSuccess} 
                onSwitchToRegister={() => setMode('register')}
              />
            </TabsContent>

            {/* Registration Tab */}
            <TabsContent value="register" className="mt-6">
              <RegistrationForm onSuccess={handleSuccess} defaultRole={defaultRole} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

