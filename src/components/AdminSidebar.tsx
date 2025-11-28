import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  // Settings,
  LogOut,
  FileEdit,
  Mail
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useApp } from '@/context/AppContext';
import { Button } from './ui/button';
import { HexagonIcon } from './ui/hexagon-icon';
import { useNavigate } from 'react-router-dom';

export const AdminSidebar = () => {
  const { setIsAuthenticated, language } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    // Navigate to CompanyLanding page
    window.location.href = '/';
  };

  // Navigation items
  const navItems = [
    {
      to: "/admin/dashboard",
      icon: LayoutDashboard,
      label: language === 'en' ? 'Dashboard Overview' : 'نظرة عامة على لوحة التحكم'
    },
    {
      to: "/admin/content",
      icon: FileEdit,
      label: language === 'en' ? 'Landing Page Content' : 'تحكم محتوى الصفحة الرئيسية'
    },
    {
      to: "/admin/subscribers",
      icon: Mail,
      label: language === 'en' ? 'Subscribers' : 'المشتركون'
    },
    {
      to: "/admin/messages",
      icon: MessageSquare,
      label: language === 'en' ? 'Messages' : 'الرسائل'
    },
    // {
    //   to: "/admin/users",
    //   icon: Users,
    //   label: language === 'en' ? 'User Management' : 'إدارة المستخدمين'
    // },
    // {
    //   to: "/admin/projects",
    //   icon: Briefcase,
    //   label: language === 'en' ? 'Project Management' : 'إدارة المشاريع'
    // },
    // {
    //   to: "/admin/documents",
    //   icon: FileText,
    //   label: language === 'en' ? 'Document Management' : 'إدارة المستندات'
    // },
    // {
    //   to: "/admin/communication",
    //   icon: MessageSquare,
    //   label: language === 'en' ? 'Communication' : 'التواصل'
    // },
    // {
    //   to: "/admin/reports",
    //   icon: BarChart3,
    //   label: language === 'en' ? 'Reports & Analytics' : 'التقارير والتحليلات'
    // },
    // {
    //   to: "/admin/settings",
    //   icon: Settings,
    //   label: language === 'en' ? 'Settings' : 'الإعدادات'
    // }
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="text-2xl font-bold text-gradient">
          {language === 'en' ? 'HIXA Admin' : 'مسؤول HIXA'}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <HexagonIcon size="sm">
              <item.icon className="h-5 w-5" />
            </HexagonIcon>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <HexagonIcon size="sm">
            <LogOut className="h-5 w-5" />
          </HexagonIcon>
          <span>{language === 'en' ? 'Logout' : 'تسجيل الخروج'}</span>
        </Button>
      </div>
    </aside>
  );
};