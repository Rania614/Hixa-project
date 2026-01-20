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
  const { language } = useApp();
  const navigate = useNavigate();

  // Temporarily disable engineer login form
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
      <Card className="w-full max-w-md glass-card relative z-10 border-hexa-border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-hexa-text-dark">
            {language === 'en' ? 'Engineer access disabled' : 'دخول المهندسين مغلق حالياً'}
          </CardTitle>
          <CardDescription className="text-hexa-text-light">
            {language === 'en'
              ? 'Engineer login and registration are currently disabled. Please contact the platform administration.'
              : 'تسجيل الدخول والتسجيل للمهندسين مغلقان حالياً. يرجى التواصل مع إدارة المنصة.'}
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

export default EngineerLogin;

