import { useApp } from '@/context/AppContext';
import { LanguageToggle } from './LanguageToggle';
import { Bell, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useUnreadNotificationsCount } from '@/hooks/useUnreadNotificationsCount';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket';

export const AdminTopBar = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const { unreadCount, refetch: refetchNotificationsCount } = useUnreadNotificationsCount();
  const { unreadCount: unreadMessagesCount } = useUnreadMessagesCount(30000);

  // Listen for new notifications to update the badge in real-time
  useNotificationWebSocket({
    enabled: true,
    onNewNotification: () => {
      // Refresh unread count when new notification arrives
      refetchNotificationsCount();
    },
  });

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-lg flex items-center justify-between px-6">
      <div>
        <h1 className="text-2xl font-bold">
          {language === 'en' ? 'Admin Dashboard' : 'لوحة التحكم'}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Messages */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/messages')}
            title={language === 'en' ? 'Messages' : 'الرسائل'}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          {unreadMessagesCount && unreadMessagesCount.total > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs font-bold shadow-lg border-2 border-background z-[100]"
            >
              {unreadMessagesCount.total > 99 ? '99+' : unreadMessagesCount.total}
            </Badge>
          )}
        </div>
        
        {/* Notifications */}
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
