import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Settings,
  LogOut,
  FileEdit,
  Mail,
  ShoppingCart,
  ChevronsLeft,
  ChevronsRight,
  PanelLeftClose,
  PanelRightClose,
  Bell,
  Handshake
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useApp } from '@/context/AppContext';
import { Button } from './ui/button';
import { HexagonIcon } from './ui/hexagon-icon';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { http, setAccessToken } from '@/services/http';

export const AdminSidebar = () => {
  const { setIsAuthenticated, language } = useApp();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check localStorage for saved state
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

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
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      // Navigate to admin login page
      navigate('/admin/login');
    }
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  // Navigation items
  const navItems = [
    {
      to: "/admin/dashboard",
      icon: LayoutDashboard,
      label: language === 'en' ? 'Dashboard Overview' : 'نظرة عامة على لوحة التحكم'
    },
    // {
    //   to: "/admin/analytics",
    //   icon: BarChart3,
    //   label: language === 'en' ? 'Analytics' : 'التحليلات'
    // },
    {
      to: "/admin/content",
      icon: FileEdit,
      label: language === 'en' ? 'Landing Page Content' : 'تحكم محتوى الصفحة الرئيسية'
    },
    {
      to: "/admin/orders",
      icon: ShoppingCart,
      label: language === 'en' ? 'Service Orders' : 'طلبات الخدمات'
    },
    {
      to: "/admin/partner-requests",
      icon: Handshake,
      label: language === 'en' ? 'Partner Requests' : 'طلبات الشراكة'
    },
    {
      to: "/admin/subscribers",
      icon: Mail,
      label: language === 'en' ? 'Subscribers' : 'المشتركون'
    },
    // {
    //   to: "/admin/notifications",
    //   icon: Bell,
    //   label: language === 'en' ? 'Notifications' : 'الإشعارات'
    // },
    {
      to: "/admin/users",
      icon: Users,
      label: language === 'en' ? 'User Management' : 'إدارة المستخدمين'
    },
    {
      to: "/admin/projects",
      icon: Briefcase,
      label: language === 'en' ? 'Project Management' : 'إدارة المشاريع'
    },
    {
      to: "/admin/messages",
      icon: MessageSquare,
      label: language === 'en' ? 'Messages' : 'الرسائل'
    },
    
    
    // {
    //   to: "/admin/settings",
    //   icon: Settings,
    //   label: language === 'en' ? 'Settings' : 'الإعدادات'
    // }
  ];

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-56'} bg-sidebar border-r border-sidebar-border/50 h-screen sticky top-0 flex flex-col transition-all duration-300 relative group`}>
      <div className={`p-5 border-b border-sidebar-border/50 ${isCollapsed ? 'px-3' : ''} relative`}>
        <div className="flex items-center justify-between gap-2">
          {isCollapsed ? (
            <div className="text-xl font-bold text-gradient text-center w-full">
              H
            </div>
          ) : (
            <div className="text-xl font-bold text-gradient flex-1">
              {language === 'en' ? 'HIXA Admin' : 'مسؤول HIXA'}
            </div>
          )}
          {/* Toggle Button - Inside header bar */}
          <button
            onClick={toggleSidebar}
            className={`w-8 h-8 rounded-lg bg-sidebar-accent/80 border border-sidebar-border/50 flex items-center justify-center hover:bg-sidebar-accent transition-all duration-200 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}
            aria-label={isCollapsed ? (language === 'en' ? 'Expand sidebar' : 'توسيع القائمة') : (language === 'en' ? 'Collapse sidebar' : 'طي القائمة')}
          >
            {language === 'ar' ? (
              <ChevronsRight className={`h-5 w-5 text-sidebar-foreground/80 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
            ) : (
              <ChevronsLeft className={`h-5 w-5 text-sidebar-foreground/80 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3'} py-2.5 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors relative group/item`}
            activeClassName="bg-yellow-400/8 text-yellow-400/80 font-medium"
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate">{item.label}</span>
                <span className="absolute left-full ml-2 px-2 py-1 bg-sidebar border border-sidebar-border/50 rounded-md text-xs opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </span>
              </>
            )}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-sidebar border border-sidebar-border/50 rounded-md text-xs opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={`p-4 border-t border-sidebar-border ${isCollapsed ? 'px-2' : ''}`}>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'} text-destructive hover:text-destructive hover:bg-destructive/10`}
          title={isCollapsed ? (language === 'en' ? 'Logout' : 'تسجيل الخروج') : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>{language === 'en' ? 'Logout' : 'تسجيل الخروج'}</span>}
        </Button>
      </div>
    </aside>
  );
};
