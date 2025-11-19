import { LayoutDashboard, FileEdit, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useApp } from '@/context/AppContext';
import { Button } from './ui/button';
import { HexagonIcon } from './ui/hexagon-icon';
import { useNavigate } from 'react-router-dom';

export const AdminSidebar = () => {
  const { setIsAuthenticated } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="text-2xl font-bold text-gradient">
          HIXA Admin
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/admin/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        >
          <HexagonIcon size="sm">
            <LayoutDashboard className="h-5 w-5" />
          </HexagonIcon>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/content"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        >
          <HexagonIcon size="sm">
            <FileEdit className="h-5 w-5" />
          </HexagonIcon>
          <span>Content Management</span>
        </NavLink>
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
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};
