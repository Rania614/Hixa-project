import { useApp } from '@/context/AppContext';
import { LanguageToggle } from './LanguageToggle';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useUnreadNotificationsCount } from '@/hooks/useUnreadNotificationsCount';

export const AdminTopBar = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const { unreadCount } = useUnreadNotificationsCount();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-lg flex items-center justify-between px-6">
      <div>
        <h1 className="text-2xl font-bold">
          {language === 'en' ? 'Admin Dashboard' : 'لوحة التحكم'}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/notifications')}
            title={language === 'en' ? 'Notifications' : 'الإشعارات'}
          >
            <Bell className="h-5 w-5" />
          </Button>
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs font-bold shadow-lg border-2 border-background z-[100]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
        <LanguageToggle />
      </div>
    </header>
  );
};
