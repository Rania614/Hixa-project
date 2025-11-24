import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Search, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const AdminUsers = () => {
  const { language } = useApp();

  // Sample user data
  const users = [
    { 
      id: '1', 
      name: 'John Smith', 
      email: 'john.smith@example.com', 
      role: language === 'en' ? 'Engineer' : 'مهندس',
      status: language === 'en' ? 'Active' : 'نشط',
      joinDate: '2023-05-15',
      avatar: 'JS'
    },
    { 
      id: '2', 
      name: 'Sarah Johnson', 
      email: 'sarah.j@example.com', 
      role: language === 'en' ? 'Client' : 'عميل',
      status: language === 'en' ? 'Active' : 'نشط',
      joinDate: '2023-06-22',
      avatar: 'SJ'
    },
    { 
      id: '3', 
      name: 'Mike Chen', 
      email: 'mike.chen@example.com', 
      role: language === 'en' ? 'Engineer' : 'مهندس',
      status: language === 'en' ? 'Pending' : 'قيد الانتظار',
      joinDate: '2023-07-10',
      avatar: 'MC'
    },
    { 
      id: '4', 
      name: 'Emma Wilson', 
      email: 'emma.w@example.com', 
      role: language === 'en' ? 'Client' : 'عميل',
      status: language === 'en' ? 'Suspended' : 'معلق',
      joinDate: '2023-04-18',
      avatar: 'EW'
    },
    { 
      id: '5', 
      name: 'David Brown', 
      email: 'david.b@example.com', 
      role: language === 'en' ? 'Engineer' : 'مهندس',
      status: language === 'en' ? 'Active' : 'نشط',
      joinDate: '2023-08-05',
      avatar: 'DB'
    },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminTopBar />
        
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {language === 'en' ? 'User Management' : 'إدارة المستخدمين'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Manage engineers, clients, and platform users'
                : 'إدارة المهندسين، العملاء، ومستخدمي المنصة'}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={language === 'en' ? "Search users..." : "البحث عن مستخدمين..."} 
                className="pl-10"
              />
            </div>
            <Button className="bg-cyan hover:bg-cyan-dark">
              <Plus className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Add User' : 'إضافة مستخدم'}
            </Button>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Total Users' : 'إجمالي المستخدمين'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-cyan">
                  <Users className="h-5 w-5 text-cyan" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">142</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Active Engineers' : 'المهندسون النشطون'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-green-500">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">42</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Pending Verification' : 'قيد التحقق'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-yellow-500">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">7</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Suspended' : 'معلقون'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-red-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3</div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'User List' : 'قائمة المستخدمين'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'User' : 'المستخدم'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Role' : 'الدور'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Status' : 'الحالة'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Join Date' : 'تاريخ الانضمام'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Actions' : 'الإجراءات'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan flex items-center justify-center text-white font-semibold">
                              {user.avatar}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-muted rounded-full text-xs">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === (language === 'en' ? 'Active' : 'نشط') 
                              ? 'bg-green-500/20 text-green-500' 
                              : user.status === (language === 'en' ? 'Pending' : 'قيد الانتظار')
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {user.joinDate}
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;