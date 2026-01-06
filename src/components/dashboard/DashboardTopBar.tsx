import React, { useState, useEffect } from "react";
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
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount";
import { http } from "@/services/http";

interface DashboardTopBarProps {
  userType: "client" | "engineer" | "company";
}

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({ userType }) => {
  const { language, setLanguage } = useApp();
  const navigate = useNavigate();
  const { unreadCount, refetch: refetchCount } = useUnreadNotificationsCount({ autoRefresh: true });
  const { unreadCount: unreadMessagesCount, refetch: refetchMessagesCount } = useUnreadMessagesCount(60000); // Refresh every 60 seconds / 1 minute
  const [userName, setUserName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");

  // Load user data to display name
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Try to get user from localStorage first
        const userStr = localStorage.getItem("user");
        let userData = null;
        
        if (userStr) {
          try {
            userData = JSON.parse(userStr);
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }

        // If no user in localStorage, try to fetch from API
        if (!userData) {
          try {
            // Try multiple endpoints based on user type
            const endpoints = userType === "company" 
              ? ["/users/me", "/auth/me"]
              : ["/auth/me", "/users/me"];
            
            let lastError;
            for (const endpoint of endpoints) {
              try {
                const response = await http.get(endpoint);
                userData = response.data?.data || response.data?.user || response.data;
                if (userData) {
                  localStorage.setItem("user", JSON.stringify(userData));
                  break; // Success, exit loop
                }
              } catch (err: any) {
                lastError = err;
                continue; // Try next endpoint
              }
            }
            
            if (!userData && lastError) {
              console.warn("Could not fetch user data from any endpoint:", lastError);
            }
          } catch (error: any) {
            console.warn("Could not fetch user data:", error);
          }
        }

        // Extract name based on user type
        if (userData) {
          let name = "";
          let initials = "";

          if (userType === "company") {
            // For company, prefer companyName, then name
            name = userData.companyName || userData.name || "Company";
            // Get first 2 characters, handling Arabic and English
            const trimmedName = name.trim();
            if (trimmedName.length >= 2) {
              initials = trimmedName.substring(0, 2).toUpperCase();
            } else {
              initials = trimmedName.substring(0, 1).toUpperCase() || "Co";
            }
          } else if (userType === "engineer") {
            // For engineer, try multiple name fields
            name = userData.name || 
                   userData.fullName || 
                   userData.username || 
                   userData.email?.split('@')[0] || 
                   "Engineer";
            const trimmedName = name.trim();
            initials = trimmedName.substring(0, 1).toUpperCase() || "E";
          } else {
            // For client, try multiple name fields
            name = userData.name || 
                   userData.fullName || 
                   userData.username || 
                   userData.email?.split('@')[0] || 
                   "Client";
            const trimmedName = name.trim();
            initials = trimmedName.substring(0, 1).toUpperCase() || "C";
          }

          setUserName(name);
          setUserInitials(initials);
        } else {
          // Fallback to default values
          setUserName(userType === "client" ? "Client" : userType === "company" ? "Company" : "Engineer");
          setUserInitials(userType === "client" ? "C" : userType === "company" ? "Co" : "E");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        // Fallback to default values
        setUserName(userType === "client" ? "Client" : userType === "company" ? "Company" : "Engineer");
        setUserInitials(userType === "client" ? "C" : userType === "company" ? "Co" : "E");
      }
    };

    loadUserData();
  }, [userType]);

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

  const handleProfileClick = () => {
    if (userType === "client") navigate("/client/profile");
    else if (userType === "company") navigate("/company/profile");
    else navigate("/engineer/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (userType === "client") navigate("/client/login");
    else if (userType === "company") navigate("/company/login");
    else navigate("/engineer/login");
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary"
            onClick={() => {
              if (userType === "client") navigate("/client/messages");
              else if (userType === "company") navigate("/company/messages");
              else navigate("/engineer/messages");
            }}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          {unreadMessagesCount && unreadMessagesCount.total > 0 && (
            <Badge className={`absolute -top-1 rounded-full h-6 min-w-[24px] px-1.5 flex items-center justify-center bg-hexa-secondary text-black text-xs font-bold shadow-lg border-2 border-hexa-card z-10 ${language === "ar" ? "left-0" : "right-0"}`}>
              {unreadMessagesCount.total > 99 ? "99+" : unreadMessagesCount.total}
            </Badge>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary"
            onClick={() => {
              if (userType === "client") navigate("/client/notifications");
              else if (userType === "company") navigate("/company/notifications");
              else navigate("/engineer/notifications");
            }}
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
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block font-medium">
                {userName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={language === "ar" ? "start" : "end"} className="w-56 bg-hexa-card border-hexa-border">
            <DropdownMenuLabel className="text-hexa-text-dark">{getDashboardText("profile", language)}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-hexa-border" />
            <DropdownMenuItem 
              className="text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary cursor-pointer"
              onClick={handleProfileClick}
            >
              {getDashboardText("profile", language)}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-hexa-border" />
            <DropdownMenuItem 
              className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
              onClick={handleLogout}
            >
              {getDashboardText("logout", language)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

