import React from "react";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Bell, MessageSquare, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { useNotificationWebSocket } from "@/hooks/useNotificationWebSocket";

interface DashboardTopBarProps {
  userType: "client" | "engineer";
}

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({ userType }) => {
  const { language, setLanguage } = useApp();
  const navigate = useNavigate();
  const { unreadCount, refetch: refetchCount } = useUnreadNotificationsCount({ autoRefresh: true });

  // WebSocket integration for real-time notifications
  useNotificationWebSocket({
    enabled: true,
    onNewNotification: () => {
      // Refresh unread count when a new notification arrives
      refetchCount();
    },
  });

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  return (
    <header className="h-16 bg-hexa-card border-b border-hexa-border flex items-center px-6 shadow-sm" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Actions */}
      <div className={`flex items-center gap-4 ${language === "ar" ? "mr-auto" : "ml-auto"}`}>
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary"
        >
          <Globe className="w-5 h-5" />
        </Button>

        {/* Messages */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary">
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Badge className={`absolute -top-1 rounded-full h-6 min-w-[24px] px-1.5 flex items-center justify-center bg-hexa-secondary text-black text-xs font-bold shadow-lg border-2 border-hexa-card z-10 ${language === "ar" ? "left-0" : "right-0"}`}>
            3
          </Badge>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary"
            onClick={() => navigate(userType === "client" ? "/client/notifications" : "/engineer/notifications")}
          >
            <Bell className="w-5 h-5" />
          </Button>
          {unreadCount > 0 && (
            <Badge className={`absolute -top-1 rounded-full h-6 min-w-[24px] px-1.5 flex items-center justify-center bg-hexa-secondary text-black text-xs font-bold shadow-lg border-2 border-hexa-card z-10 ${language === "ar" ? "left-0" : "right-0"}`}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-hexa-secondary text-black">
                  {userType === "client" ? "C" : "E"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block font-medium">
                {userType === "client" ? "Client" : "Engineer"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={language === "ar" ? "start" : "end"} className="w-56 bg-hexa-card border-hexa-border">
            <DropdownMenuLabel className="text-hexa-text-dark">{getDashboardText("profile", language)}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-hexa-border" />
            <DropdownMenuItem className="text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary">{getDashboardText("settings", language)}</DropdownMenuItem>
            <DropdownMenuItem className="text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary">{getDashboardText("profile", language)}</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-hexa-border" />
            <DropdownMenuItem className="text-red-400 hover:bg-red-900/20 hover:text-red-300">
              {getDashboardText("logout", language)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

