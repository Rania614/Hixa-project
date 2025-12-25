import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Briefcase,
  Building2,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Filter
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'engineer' | 'client' | 'company' | 'admin';
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  joinDate: string;
  avatar?: string;
  companyName?: string; // For companies
  location?: string;
  verified?: boolean;
}

const AdminUsers = () => {
  const { language } = useApp();
  const [activeTab, setActiveTab] = useState<'engineers' | 'clients' | 'companies'>('engineers');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'engineer' as 'engineer' | 'client' | 'company',
    status: 'active' as 'active' | 'pending' | 'suspended',
    location: '',
    companyName: '',
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    engineers: { total: 0, active: 0, pending: 0, suspended: 0 },
    clients: { total: 0, active: 0, pending: 0, suspended: 0 },
    companies: { total: 0, active: 0, pending: 0, suspended: 0 },
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Try different possible endpoints
      let response;
      const endpoints = ['/users', '/admin/users', '/users/all'];
      
      for (const endpoint of endpoints) {
        try {
          response = await http.get(endpoint);
          if (response.data) break;
        } catch (err: any) {
          if (err.response?.status !== 404) throw err;
        }
      }

      if (!response) {
        // Fallback to empty array if no endpoint works
        setUsers([]);
        return;
      }

      const usersData = response.data?.data || response.data?.users || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      // Don't show error for 404 - endpoint might not exist yet
      if (error.response?.status !== 404) {
        toast.error(language === 'en' ? 'Failed to load users' : 'فشل تحميل المستخدمين');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await http.get('/users/statistics');
      setStatistics(response.data?.data || response.data || statistics);
    } catch (error: any) {
      // Silently handle 400/404 errors - endpoint might not exist yet
      if (error.response?.status === 400 || error.response?.status === 404) {
        // Calculate from users if API fails
        const engineers = users.filter(u => u.role === 'engineer');
        const clients = users.filter(u => u.role === 'client');
        const companies = users.filter(u => u.role === 'company');
        
        setStatistics({
          total: users.length,
          engineers: {
            total: engineers.length,
            active: engineers.filter(u => u.status === 'active').length,
            pending: engineers.filter(u => u.status === 'pending').length,
            suspended: engineers.filter(u => u.status === 'suspended').length,
          },
          clients: {
            total: clients.length,
            active: clients.filter(u => u.status === 'active').length,
            pending: clients.filter(u => u.status === 'pending').length,
            suspended: clients.filter(u => u.status === 'suspended').length,
          },
          companies: {
            total: companies.length,
            active: companies.filter(u => u.status === 'active').length,
            pending: companies.filter(u => u.status === 'pending').length,
            suspended: companies.filter(u => u.status === 'suspended').length,
          },
        });
      } else {
        // Only log non-400/404 errors
        console.error('Error fetching statistics:', error);
      }
    }
  };

  // Update user status
  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await http.put(`/users/${userId}/status`, { status: newStatus });
      toast.success(
        language === 'en' 
          ? 'User status updated successfully' 
          : 'تم تحديث حالة المستخدم بنجاح'
      );
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(
        language === 'en' 
          ? 'Failed to update user status' 
          : 'فشل تحديث حالة المستخدم'
      );
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm(language === 'en' 
      ? 'Are you sure you want to delete this user?' 
      : 'هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }
    
    try {
      await http.delete(`/users/${userId}`);
      toast.success(language === 'en' ? 'User deleted successfully' : 'تم حذف المستخدم بنجاح');
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(language === 'en' ? 'Failed to delete user' : 'فشل حذف المستخدم');
    }
  };

  // Add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setAdding(true);
      const userData: any = {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        status: userForm.status,
      };

      if (userForm.phone) userData.phone = userForm.phone;
      if (userForm.location) userData.location = userForm.location;
      if (userForm.role === 'company' && userForm.companyName) {
        userData.companyName = userForm.companyName;
      }

      await http.post('/users', userData);
      toast.success(language === 'en' ? 'User added successfully' : 'تم إضافة المستخدم بنجاح');
      setShowAddModal(false);
      resetForm();
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(
        language === 'en' 
          ? error.response?.data?.message || 'Failed to add user'
          : error.response?.data?.message || 'فشل إضافة المستخدم'
      );
    } finally {
      setAdding(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: activeTab === 'engineers' ? 'engineer' : activeTab === 'clients' ? 'client' : 'company',
      status: 'active',
      location: '',
      companyName: '',
    });
  };

  // Update form role when tab changes
  useEffect(() => {
    if (showAddModal) {
      setUserForm(prev => ({
        ...prev,
        role: activeTab === 'engineers' ? 'engineer' : activeTab === 'clients' ? 'client' : 'company',
      }));
    }
  }, [activeTab, showAddModal]);

  // Filter users
  useEffect(() => {
    let filtered = users.filter(user => {
      // Filter by role
      if (activeTab === 'engineers' && user.role !== 'engineer') return false;
      if (activeTab === 'clients' && user.role !== 'client') return false;
      if (activeTab === 'companies' && user.role !== 'company') return false;
      
      // Filter by status
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower) ||
          user.companyName?.toLowerCase().includes(searchLower) ||
          user.location?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
    
    setFilteredUsers(filtered);
  }, [users, activeTab, statusFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      fetchStatistics();
    }
  }, [users]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: { en: string; ar: string }; className: string }> = {
      active: {
        label: { en: 'Active', ar: 'نشط' },
        className: 'bg-green-500/20 text-green-500'
      },
      pending: {
        label: { en: 'Pending', ar: 'قيد الانتظار' },
        className: 'bg-yellow-500/20 text-yellow-500'
      },
      suspended: {
        label: { en: 'Suspended', ar: 'معلق' },
        className: 'bg-red-500/20 text-red-500'
      },
      inactive: {
        label: { en: 'Inactive', ar: 'غير نشط' },
        className: 'bg-gray-500/20 text-gray-500'
      },
    };

    const statusInfo = statusMap[status] || statusMap.active;
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label[language as 'en' | 'ar']}
      </Badge>
    );
  };

  const getRoleIcon = (role: string) => {
    if (role === 'engineer') return Briefcase;
    if (role === 'company') return Building2;
    return Users;
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, { en: string; ar: string }> = {
      engineer: { en: 'Engineer', ar: 'مهندس' },
      client: { en: 'Client', ar: 'عميل' },
      company: { en: 'Company', ar: 'شركة' },
      admin: { en: 'Admin', ar: 'مسؤول' },
    };
    return roleMap[role]?.[language as 'en' | 'ar'] || role;
  };

  const getCurrentStats = () => {
    if (activeTab === 'engineers') return statistics.engineers;
    if (activeTab === 'clients') return statistics.clients;
    return statistics.companies;
  };

  const currentStats = getCurrentStats();

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
                ? 'Manage engineers, clients, and companies'
                : 'إدارة المهندسين، العملاء، والشركات'}
            </p>
          </div>

          {/* Statistics Cards */}
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
                <div className="text-3xl font-bold">{statistics.total}</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Active' : 'نشط'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-green-500">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currentStats.active}</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Pending' : 'قيد الانتظار'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-yellow-500">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currentStats.pending}</div>
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
                <div className="text-3xl font-bold">{currentStats.suspended}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <TabsList>
                <TabsTrigger value="engineers">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Engineers' : 'المهندسين'} ({statistics.engineers.total})
                </TabsTrigger>
                <TabsTrigger value="clients">
                  <Users className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Clients' : 'العملاء'} ({statistics.clients.total})
                </TabsTrigger>
                <TabsTrigger value="companies">
                  <Building2 className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Companies' : 'الشركات'} ({statistics.companies.total})
                </TabsTrigger>
              </TabsList>

              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={language === 'en' ? "Search..." : "البحث..."} 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Filter' : 'فلترة'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      {language === 'en' ? 'All' : 'الكل'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                      {language === 'en' ? 'Active' : 'نشط'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                      {language === 'en' ? 'Pending' : 'قيد الانتظار'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>
                      {language === 'en' ? 'Suspended' : 'معلق'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  className="bg-cyan hover:bg-cyan-dark"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Add User' : 'إضافة مستخدم'}
                </Button>
              </div>
            </div>

            {/* Engineers Tab */}
            <TabsContent value="engineers">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>
                    {language === 'en' ? 'Engineers' : 'المهندسين'} ({filteredUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-cyan" />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {language === 'en' ? 'No engineers found' : 'لا يوجد مهندسين'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Engineer' : 'المهندس'}
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Contact' : 'التواصل'}
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
                          {filteredUsers.map((user, index) => {
                            const RoleIcon = getRoleIcon(user.role);
                            return (
                              <tr key={user._id || `user-${index}`} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-cyan flex items-center justify-center text-white font-semibold">
                                      {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        <RoleIcon className="h-5 w-5" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium flex items-center gap-2">
                                        {user.name}
                                        {user.verified && (
                                          <UserCheck className="h-4 w-4 text-green-500" />
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="space-y-1">
                                    {user.phone && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        {user.phone}
                                      </div>
                                    )}
                                    {user.location && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        {user.location}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  {getStatusBadge(user.status)}
                                </td>
                                <td className="py-4 px-4 text-muted-foreground">
                                  {new Date(user.joinDate).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-4">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {language === 'en' ? 'Edit' : 'تعديل'}
                                      </DropdownMenuItem>
                                      {user.status === 'active' ? (
                                        <DropdownMenuItem onClick={() => updateUserStatus(user._id, 'suspended')}>
                                          <UserX className="h-4 w-4 mr-2" />
                                          {language === 'en' ? 'Suspend' : 'تعطيل'}
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onClick={() => updateUserStatus(user._id, 'active')}>
                                          <UserCheck className="h-4 w-4 mr-2" />
                                          {language === 'en' ? 'Activate' : 'تفعيل'}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => deleteUser(user._id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {language === 'en' ? 'Delete' : 'حذف'}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clients Tab */}
            <TabsContent value="clients">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>
                    {language === 'en' ? 'Clients' : 'العملاء'} ({filteredUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-cyan" />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {language === 'en' ? 'No clients found' : 'لا يوجد عملاء'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Client' : 'العميل'}
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Contact' : 'التواصل'}
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
                          {filteredUsers.map((user, index) => {
                            const RoleIcon = getRoleIcon(user.role);
                            return (
                              <tr key={user._id || `user-${index}`} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-cyan flex items-center justify-center text-white font-semibold">
                                      {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        <RoleIcon className="h-5 w-5" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium flex items-center gap-2">
                                        {user.name}
                                        {user.verified && (
                                          <UserCheck className="h-4 w-4 text-green-500" />
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="space-y-1">
                                    {user.phone && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        {user.phone}
                                      </div>
                                    )}
                                    {user.location && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        {user.location}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  {getStatusBadge(user.status)}
                                </td>
                                <td className="py-4 px-4 text-muted-foreground">
                                  {new Date(user.joinDate).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-4">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {language === 'en' ? 'Edit' : 'تعديل'}
                                      </DropdownMenuItem>
                                      {user.status === 'active' ? (
                                        <DropdownMenuItem onClick={() => updateUserStatus(user._id, 'suspended')}>
                                          <UserX className="h-4 w-4 mr-2" />
                                          {language === 'en' ? 'Suspend' : 'تعطيل'}
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onClick={() => updateUserStatus(user._id, 'active')}>
                                          <UserCheck className="h-4 w-4 mr-2" />
                                          {language === 'en' ? 'Activate' : 'تفعيل'}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => deleteUser(user._id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {language === 'en' ? 'Delete' : 'حذف'}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Companies Tab */}
            <TabsContent value="companies">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                    {language === 'en' ? 'Companies' : 'الشركات'} ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-cyan" />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {language === 'en' ? 'No companies found' : 'لا توجد شركات'}
                    </div>
                  ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Company' : 'الشركة'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Contact' : 'التواصل'}
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
                          {filteredUsers.map((user, index) => {
                            const RoleIcon = getRoleIcon(user.role);
                            return (
                              <tr key={user._id || `user-${index}`} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan flex items-center justify-center text-white font-semibold">
                                      {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        <Building2 className="h-5 w-5" />
                                      )}
                            </div>
                            <div>
                                      <div className="font-medium flex items-center gap-2">
                                        {user.companyName || user.name}
                                        {user.verified && (
                                          <UserCheck className="h-4 w-4 text-green-500" />
                                        )}
                                      </div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                                  <div className="space-y-1">
                                    {user.phone && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        {user.phone}
                                      </div>
                                    )}
                                    {user.location && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        {user.location}
                                      </div>
                                    )}
                                  </div>
                        </td>
                        <td className="py-4 px-4">
                                  {getStatusBadge(user.status)}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                                  {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {language === 'en' ? 'Edit' : 'تعديل'}
                                      </DropdownMenuItem>
                                      {user.status === 'active' ? (
                                        <DropdownMenuItem onClick={() => updateUserStatus(user._id, 'suspended')}>
                                          <UserX className="h-4 w-4 mr-2" />
                                          {language === 'en' ? 'Suspend' : 'تعطيل'}
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onClick={() => updateUserStatus(user._id, 'active')}>
                                          <UserCheck className="h-4 w-4 mr-2" />
                                          {language === 'en' ? 'Activate' : 'تفعيل'}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => deleteUser(user._id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {language === 'en' ? 'Delete' : 'حذف'}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                        </td>
                      </tr>
                            );
                          })}
                  </tbody>
                </table>
              </div>
                  )}
            </CardContent>
          </Card>
            </TabsContent>
          </Tabs>

          {/* Add User Modal */}
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {language === 'en' ? 'Add New User' : 'إضافة مستخدم جديد'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'en' 
                    ? 'Fill in the information to create a new user account'
                    : 'املأ المعلومات لإنشاء حساب مستخدم جديد'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {language === 'en' ? 'Name' : 'الاسم'} *
                    </Label>
                    <Input
                      id="name"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      required
                      placeholder={language === 'en' ? 'Full name' : 'الاسم الكامل'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {language === 'en' ? 'Email' : 'البريد الإلكتروني'} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      required
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {language === 'en' ? 'Password' : 'كلمة المرور'} *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      required
                      placeholder={language === 'en' ? 'Password' : 'كلمة المرور'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {language === 'en' ? 'Phone' : 'الهاتف'}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      placeholder={language === 'en' ? 'Phone number' : 'رقم الهاتف'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">
                      {language === 'en' ? 'Role' : 'الدور'} *
                    </Label>
                    <Select
                      value={userForm.role}
                      onValueChange={(value: 'engineer' | 'client' | 'company') => 
                        setUserForm({ ...userForm, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineer">
                          {language === 'en' ? 'Engineer' : 'مهندس'}
                        </SelectItem>
                        <SelectItem value="client">
                          {language === 'en' ? 'Client' : 'عميل'}
                        </SelectItem>
                        <SelectItem value="company">
                          {language === 'en' ? 'Company' : 'شركة'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      {language === 'en' ? 'Status' : 'الحالة'} *
                    </Label>
                    <Select
                      value={userForm.status}
                      onValueChange={(value: 'active' | 'pending' | 'suspended') => 
                        setUserForm({ ...userForm, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          {language === 'en' ? 'Active' : 'نشط'}
                        </SelectItem>
                        <SelectItem value="pending">
                          {language === 'en' ? 'Pending' : 'قيد الانتظار'}
                        </SelectItem>
                        <SelectItem value="suspended">
                          {language === 'en' ? 'Suspended' : 'معلق'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {userForm.role === 'company' && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      {language === 'en' ? 'Company Name' : 'اسم الشركة'} *
                    </Label>
                    <Input
                      id="companyName"
                      value={userForm.companyName}
                      onChange={(e) => setUserForm({ ...userForm, companyName: e.target.value })}
                      required={userForm.role === 'company'}
                      placeholder={language === 'en' ? 'Company name' : 'اسم الشركة'}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="location">
                    {language === 'en' ? 'Location' : 'الموقع'}
                  </Label>
                  <Input
                    id="location"
                    value={userForm.location}
                    onChange={(e) => setUserForm({ ...userForm, location: e.target.value })}
                    placeholder={language === 'en' ? 'City, Country' : 'المدينة، الدولة'}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    disabled={adding}
                  >
                    {language === 'en' ? 'Cancel' : 'إلغاء'}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-cyan hover:bg-cyan-dark"
                    disabled={adding}
                  >
                    {adding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {language === 'en' ? 'Adding...' : 'جاري الإضافة...'}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Add User' : 'إضافة مستخدم'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
