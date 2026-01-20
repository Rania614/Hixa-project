import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { User, Loader2, Eye, EyeOff } from 'lucide-react';

const ClientLogin = () => {
  const { language } = useApp();
  const navigate = useNavigate();

  // Temporarily disable client login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md glass-card shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold">
            {language === 'en' ? 'Client access disabled' : 'دخول العملاء مغلق حالياً'}
          </CardTitle>
          <CardDescription className="text-base">
            {language === 'en'
              ? 'Client login and registration are currently disabled. Please contact the platform administration.'
              : 'تسجيل الدخول والتسجيل للعملاء مغلقان حالياً. يرجى التواصل مع إدارة المنصة.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4"
          >
            {language === 'en' ? 'Back to home' : 'العودة إلى الرئيسية'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;

