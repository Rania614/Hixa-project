import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Briefcase,
  Menu,
  X,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { http, setAccessToken } from "@/services/http";

interface DashboardSidebarProps {
  userType: "client" | "engineer" | "company";
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userType }) => {
  const { language } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isClient = userType === "client";
  const isCompany = userType === "company";

  const clientMenuItems = [
    { icon: LayoutDashboard, label: getDashboardText("dashboard", language), path: "/client/dashboard" },
    { icon: FolderKanban, label: getDashboardText("myProjects", language), path: "/client/projects" },
    { icon: Briefcase, label: language === "en" ? "Browse Projects" : "تصفح المشاريع", path: "/client/projects/browse" },
    { icon: MessageSquare, label: getDashboardText("messages", language), path: "/client/messages" },
    { icon: Bell, label: getDashboardText("notifications", language), path: "/client/notifications" },
    { icon: User, label: getDashboardText("profileSettings", language), path: "/client/profile" },
  ];

  const engineerMenuItems = [
    { icon: LayoutDashboard, label: getDashboardText("dashboard", language), path: "/engineer/dashboard" },
    { icon: Briefcase, label: getDashboardText("browseProjects", language), path: "/engineer/available-projects" },
    { icon: FolderKanban, label: getDashboardText("myProjects", language), path: "/engineer/projects" },
    { icon: MessageSquare, label: getDashboardText("messages", language), path: "/engineer/messages" },
    { icon: Bell, label: getDashboardText("notifications", language), path: "/engineer/notifications" },
    // { icon: Image, label: getDashboardText("portfolio", language), path: "/engineer/portfolio" },في مشكلة في رفع الاعمال 
    { icon: User, label: getDashboardText("profilePage", language), path: "/engineer/profile" },
  ];

  const companyMenuItems = [
    { icon: LayoutDashboard, label: getDashboardText("dashboard", language), path: "/company/dashboard" },
    { icon: Briefcase, label: getDashboardText("browseProjects", language), path: "/company/available-projects" },
    { icon: FolderKanban, label: getDashboardText("myProjects", language), path: "/company/projects" },
    { icon: MessageSquare, label: getDashboardText("messages", language), path: "/company/messages" },
    { icon: Bell, label: getDashboardText("notifications", language), path: "/company/notifications" },
    { icon: Image, label: getDashboardText("portfolio", language), path: "/company/portfolio" },
    { icon: User, label: getDashboardText("profilePage", language), path: "/company/profile" },
  ];

  const menuItems = isClient ? clientMenuItems : isCompany ? companyMenuItems : engineerMenuItems;

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear refresh token cookie
      await http.post('/auth/logout').catch(() => {
        // Ignore errors - continue with logout anyway
      });
    } catch (error) {
      // Ignore errors - continue with logout anyway
    } finally {
      // Clear tokens and user data
      setAccessToken(null);
      localStorage.removeItem("user");
      
      // Navigate to Company Landing page for all user types
      navigate("/");
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-hexa-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-hexa-secondary rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">H</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-hexa-secondary">Hexa</h1>
            <p className="text-xs text-hexa-text-light">
              {isClient 
                ? getDashboardText("clientDashboard", language) 
                : isCompany 
                  ? getDashboardText("companyDashboard", language) 
                  : getDashboardText("engineerDashboard", language)}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-hexa-secondary/20 hover:text-hexa-secondary",
                active
                  ? "bg-hexa-secondary text-black shadow-md font-semibold"
                  : "text-hexa-text-light hover:text-hexa-text-dark"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-hexa-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{getDashboardText("logout", language)}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className={cn(
        "lg:hidden fixed top-4 z-50",
        language === "ar" ? "right-4" : "left-4"
      )}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white shadow-lg"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 z-50 w-64 bg-hexa-card shadow-lg lg:shadow-none transition-transform duration-300",
          language === "ar" 
            ? "right-0 border-l border-hexa-border" 
            : "left-0 border-r border-hexa-border",
          isMobileOpen 
            ? "translate-x-0" 
            : language === "ar" 
              ? "translate-x-full lg:translate-x-0" 
              : "-translate-x-full lg:translate-x-0"
        )}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
};

