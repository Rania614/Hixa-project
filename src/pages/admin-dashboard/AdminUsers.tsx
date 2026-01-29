import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Building2, Users } from 'lucide-react';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';

// Sub-components
import { UserStats } from '@/components/admin-users/UserStats';
import { UserFilters } from '@/components/admin-users/UserFilters';
import { UserTable } from '@/components/admin-users/UserTable';
import { AddUserModal } from '@/components/admin-users/AddUserModal';
import { EditUserModal } from '@/components/admin-users/EditUserModal';
import { ViewUserModal } from '@/components/admin-users/ViewUserModal';

// Types and Helpers
import { User, getUserId, isUserActive } from '@/types/user';

const AdminUsers = () => {
  const { language } = useApp();

  // Countries list
  const countries = [
    { value: "SA", label: language === "en" ? "Saudi Arabia" : "السعودية" },
    { value: "EG", label: language === "en" ? "Egypt" : "مصر" },
    { value: "AE", label: language === "en" ? "United Arab Emirates" : "الإمارات العربية المتحدة" },
    { value: "KW", label: language === "en" ? "Kuwait" : "الكويت" },
    { value: "QA", label: language === "en" ? "Qatar" : "قطر" },
    { value: "BH", label: language === "en" ? "Bahrain" : "البحرين" },
    { value: "OM", label: language === "en" ? "Oman" : "عمان" },
    { value: "JO", label: language === "en" ? "Jordan" : "الأردن" },
    { value: "LB", label: language === "en" ? "Lebanon" : "لبنان" },
  ];

  // Cities by country
  const citiesByCountry: { [key: string]: { value: string; label: { en: string; ar: string } }[] } = {
    SA: [
      { value: "Riyadh", label: { en: "Riyadh", ar: "الرياض" } },
      { value: "Jeddah", label: { en: "Jeddah", ar: "جدة" } },
      { value: "Dammam", label: { en: "Dammam", ar: "الدمام" } },
      { value: "Mecca", label: { en: "Mecca", ar: "مكة المكرمة" } },
      { value: "Medina", label: { en: "Medina", ar: "المدينة المنورة" } },
      { value: "Khobar", label: { en: "Khobar", ar: "الخبر" } },
      { value: "Abha", label: { en: "Abha", ar: "أبها" } },
      { value: "Tabuk", label: { en: "Tabuk", ar: "تبوك" } },
      { value: "Taif", label: { en: "Taif", ar: "الطائف" } },
      { value: "Buraydah", label: { en: "Buraydah", ar: "بريدة" } },
    ],
    EG: [
      { value: "Cairo", label: { en: "Cairo", ar: "القاهرة" } },
      { value: "Alexandria", label: { en: "Alexandria", ar: "الإسكندرية" } },
      { value: "Giza", label: { en: "Giza", ar: "الجيزة" } },
      { value: "Port Said", label: { en: "Port Said", ar: "بورسعيد" } },
      { value: "Suez", label: { en: "Suez", ar: "السويس" } },
      { value: "Luxor", label: { en: "Luxor", ar: "الأقصر" } },
      { value: "Aswan", label: { en: "Aswan", ar: "أسوان" } },
    ],
    AE: [
      { value: "Dubai", label: { en: "Dubai", ar: "دبي" } },
      { value: "Abu Dhabi", label: { en: "Abu Dhabi", ar: "أبو ظبي" } },
      { value: "Sharjah", label: { en: "Sharjah", ar: "الشارقة" } },
      { value: "Al Ain", label: { en: "Al Ain", ar: "العين" } },
      { value: "Ajman", label: { en: "Ajman", ar: "عجمان" } },
    ],
    KW: [
      { value: "Kuwait City", label: { en: "Kuwait City", ar: "مدينة الكويت" } },
      { value: "Al Ahmadi", label: { en: "Al Ahmadi", ar: "الأحمدي" } },
      { value: "Hawalli", label: { en: "Hawalli", ar: "حولي" } },
    ],
    QA: [
      { value: "Doha", label: { en: "Doha", ar: "الدوحة" } },
      { value: "Al Rayyan", label: { en: "Al Rayyan", ar: "الريان" } },
      { value: "Al Wakrah", label: { en: "Al Wakrah", ar: "الوكرة" } },
    ],
    BH: [
      { value: "Manama", label: { en: "Manama", ar: "المنامة" } },
      { value: "Riffa", label: { en: "Riffa", ar: "الرفاع" } },
      { value: "Muharraq", label: { en: "Muharraq", ar: "المحرق" } },
    ],
    OM: [
      { value: "Muscat", label: { en: "Muscat", ar: "مسقط" } },
      { value: "Salalah", label: { en: "Salalah", ar: "صلالة" } },
      { value: "Sohar", label: { en: "Sohar", ar: "صحار" } },
    ],
    JO: [
      { value: "Amman", label: { en: "Amman", ar: "عمان" } },
      { value: "Zarqa", label: { en: "Zarqa", ar: "الزرقاء" } },
      { value: "Irbid", label: { en: "Irbid", ar: "إربد" } },
    ],
    LB: [
      { value: "Beirut", label: { en: "Beirut", ar: "بيروت" } },
      { value: "Tripoli", label: { en: "Tripoli", ar: "طرابلس" } },
      { value: "Sidon", label: { en: "Sidon", ar: "صيدا" } },
    ],
  };

  const getCitiesForCountry = (countryCode: string) => {
    return citiesByCountry[countryCode] || [];
  };

  const [activeTab, setActiveTab] = useState<'engineers' | 'clients' | 'companies'>('engineers');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [countriesMeta, setCountriesMeta] = useState<{ key: string; value: string }[]>([]);
  const [businessScopesMeta, setBusinessScopesMeta] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'engineer' as 'engineer' | 'client' | 'company',
    status: 'active' as 'active' | 'pending' | 'suspended',
    country: '',
    city: '',
    companyName: '',
    contactPersonName: '',
    specialization: '',
    nationalId: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
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
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (activeTab === 'engineers') params.role = 'engineer';
      else if (activeTab === 'clients') params.role = 'client';
      else if (activeTab === 'companies') params.role = 'company';

      if (searchTerm) params.search = searchTerm;

      if (statusFilter === 'active') params.isActive = true;
      else if (statusFilter === 'suspended' || (statusFilter as string) === 'inactive') params.isActive = false;

      if (countryFilter.length > 0) params.country = countryFilter.join(',');
      if (categoryFilter.length > 0) params.category = categoryFilter.join(',');

      const response = await http.get('/users', { params });
      const usersData = response.data?.data || response.data?.users || response.data || [];

      const normalizedUsers = Array.isArray(usersData)
        ? usersData.map((user: any) => {
          const normalizedId = user._id || user.id;
          let normalizedStatus = user.status;
          if (!normalizedStatus && user.isActive !== undefined) {
            normalizedStatus = user.isActive ? 'active' : 'inactive';
          } else if (!normalizedStatus) {
            normalizedStatus = 'active';
          }

          return {
            ...user,
            _id: normalizedId,
            status: normalizedStatus,
          };
        })
        : [];
      setUsers(normalizedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status !== 404) {
        toast.error(language === 'en' ? 'Failed to load users' : 'فشل تحميل المستخدمين');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter metadata
  const fetchFilterMeta = async () => {
    try {
      const response = await http.get('/users/filters/meta');
      if (response.data?.data) {
        setCountriesMeta(response.data.data.countries || []);
        setBusinessScopesMeta(response.data.data.businessScopes || []);
      }
    } catch (error) {
      console.error('Error fetching filter metadata:', error);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await http.get('/users/statistics');
      setStatistics(response.data?.data || response.data || statistics);
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 404) {
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
        console.error('Error fetching statistics:', error);
      }
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId: string) => {
    try {
      setLoadingUser(true);
      const response = await http.get(`/users/${userId}`);
      return response.data?.data || response.data?.user || response.data;
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      toast.error(language === 'en' ? 'Failed to load user details' : 'فشل تحميل تفاصيل المستخدم');
      throw error;
    } finally {
      setLoadingUser(false);
    }
  };

  // View user details
  const handleViewUser = async (userId: string) => {
    if (!userId) {
      toast.error(language === 'en' ? 'Invalid user ID' : 'معرف المستخدم غير صحيح');
      return;
    }
    try {
      const userData = await fetchUserDetails(userId);
      if (userData && !userData._id && userData.id) {
        userData._id = userData.id;
      }
      setViewingUser(userData);
      setShowViewModal(true);
    } catch (error) { }
  };

  // Open edit modal and load user data
  const handleEditUser = async (userId: string) => {
    if (!userId) {
      toast.error(language === 'en' ? 'Invalid user ID' : 'معرف المستخدم غير صحيح');
      return;
    }
    try {
      const userData = await fetchUserDetails(userId);
      if (userData && !userData._id && userData.id) {
        userData._id = userData.id;
      }
      setEditingUser(userData);
      const userStatus = userData.isActive !== undefined
        ? (userData.isActive ? 'active' : 'inactive')
        : (userData.status || 'active');
      setEditForm({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'engineer',
        status: userStatus as 'active' | 'pending' | 'suspended',
        location: userData.location || '',
        companyName: userData.companyName || '',
      });
      setShowEditModal(true);
    } catch (error) { }
  };

  // Update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setUpdating(true);
      const updateData: any = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        isActive: editForm.status === 'active',
      };

      if (editForm.phone) updateData.phone = editForm.phone;
      if (editForm.location) updateData.location = editForm.location;
      if (editForm.role === 'company' && editForm.companyName) {
        updateData.companyName = editForm.companyName;
      }

      const userId = getUserId(editingUser);
      if (!userId) {
        toast.error(language === 'en' ? 'Invalid user ID' : 'معرف المستخدم غير صحيح');
        setUpdating(false);
        return;
      }
      await http.put(`/users/${userId}`, updateData);
      toast.success(language === 'en' ? 'User updated successfully' : 'تم تحديث المستخدم بنجاح');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(language === 'en' ? error.response?.data?.message || 'Failed to update user' : error.response?.data?.message || 'فشل تحديث المستخدم');
    } finally {
      setUpdating(false);
    }
  };

  // Toggle user activation
  const updateUserStatus = async (userId: string) => {
    try {
      await http.patch(`/users/${userId}/toggle-activation`);
      toast.success(language === 'en' ? 'User status updated successfully' : 'تم تحديث حالة المستخدم بنجاح');
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(language === 'en' ? 'Failed to update user status' : 'فشل تحديث حالة المستخدم');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to delete this user?' : 'هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }

    try {
      await http.delete(`/users/${userId}`);
      toast.success(language === 'en' ? 'User deleted successfully' : 'تم حذف المستخدم بنجاح');
      fetchUsers();
      fetchStatistics();
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(language === 'en' ? 'Failed to delete user' : 'فشل حذف المستخدم');
    }
  };

  // Bulk delete users
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error(language === 'en' ? 'Please select users to delete' : 'يرجى اختيار المستخدمين للحذف');
      return;
    }

    if (!confirm(language === 'en' ? `Are you sure you want to delete ${selectedUsers.length} user(s)?` : `هل أنت متأكد من حذف ${selectedUsers.length} مستخدم؟`)) {
      return;
    }

    try {
      await http.post('/users/bulk-delete', { ids: selectedUsers });
      toast.success(language === 'en' ? `${selectedUsers.length} user(s) deleted successfully` : `تم حذف ${selectedUsers.length} مستخدم بنجاح`);
      setSelectedUsers([]);
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error deleting users:', error);
      toast.error(language === 'en' ? 'Failed to delete users' : 'فشل حذف المستخدمين');
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle all users selection
  const toggleAllUsersSelection = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => getUserId(u)));
    }
  };

  // Add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userForm.email || !userForm.password) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (userForm.role === 'engineer') {
      if (!userForm.name || !userForm.specialization || !userForm.nationalId) {
        toast.error(language === 'en' ? 'Please fill all required fields for engineer' : 'يرجى ملء جميع الحقول المطلوبة للمهندس');
        return;
      }
    } else if (userForm.role === 'company') {
      if (!userForm.companyName || !userForm.contactPersonName) {
        toast.error(language === 'en' ? 'Please fill all required fields for company' : 'يرجى ملء جميع الحقول المطلوبة للشركة');
        return;
      }
    } else if (userForm.role === 'client') {
      if (!userForm.name) {
        toast.error(language === 'en' ? 'Please fill all required fields for client' : 'يرجى ملء جميع الحقول المطلوبة للعميل');
        return;
      }
    }

    try {
      setAdding(true);
      const userData: any = {
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
      };

      if (userForm.role === 'company') {
        userData.name = userForm.companyName;
      } else {
        userData.name = userForm.name;
      }

      userData.nationalId = userForm.role === 'engineer' ? userForm.nationalId : '';

      if (userForm.phone) userData.phone = userForm.phone;
      if (userForm.country) userData.country = userForm.country;
      if (userForm.city) userData.city = userForm.city;

      if (userForm.country && userForm.city) {
        const countryName = countries.find(c => c.value === userForm.country)?.label || userForm.country;
        const citiesForCountry = getCitiesForCountry(userForm.country);
        const cityName = citiesForCountry.find(c => c.value === userForm.city)?.label[language] || userForm.city;
        userData.location = `${cityName}, ${countryName}`;
      }

      if (userForm.role === 'company' && userForm.contactPersonName) {
        userData.bio = `Contact Person: ${userForm.contactPersonName}`;
      } else if (userForm.role === 'engineer' && userForm.specialization) {
        userData.specializations = [userForm.specialization];
      }

      userData.isActive = userForm.status === 'active';

      await http.post('/users', userData);
      toast.success(language === 'en' ? 'User added successfully' : 'تم إضافة المستخدم بنجاح');
      setShowAddModal(false);
      resetForm();
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(language === 'en' ? error.response?.data?.message || 'Failed to add user' : error.response?.data?.message || 'فشل إضافة المستخدم');
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
      country: '',
      city: '',
      companyName: '',
      contactPersonName: '',
      specialization: '',
      nationalId: '',
    });
  };

  useEffect(() => {
    if (showAddModal) {
      setUserForm(prev => ({
        ...prev,
        role: activeTab === 'engineers' ? 'engineer' : activeTab === 'clients' ? 'client' : 'company',
      }));
    }
  }, [activeTab, showAddModal]);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, [activeTab, statusFilter, searchTerm, countryFilter, categoryFilter]);

  useEffect(() => {
    fetchFilterMeta();
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

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, { en: string; ar: string }> = {
      engineer: { en: 'Engineer', ar: 'مهندس' },
      client: { en: 'Client', ar: 'عميل' },
      company: { en: 'Company', ar: 'شركة' },
      admin: { en: 'Admin', ar: 'مسؤول' },
    };
    return roleMap[role]?.[language as 'en' | 'ar'] || role;
  };

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

          <UserStats statistics={statistics} activeTab={activeTab} />

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

              <UserFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                countryFilter={countryFilter}
                setCountryFilter={setCountryFilter}
                countriesMeta={countriesMeta}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                businessScopesMeta={businessScopesMeta}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                selectedUsersCount={selectedUsers.length}
                handleBulkDelete={handleBulkDelete}
                onAddUser={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
              />
            </div>

            <TabsContent value="engineers">
              <UserTable
                users={filteredUsers}
                loading={loading}
                selectedUsers={selectedUsers}
                toggleUserSelection={toggleUserSelection}
                toggleAllUsersSelection={toggleAllUsersSelection}
                handleViewUser={handleViewUser}
                handleEditUser={handleEditUser}
                updateUserStatus={updateUserStatus}
                deleteUser={deleteUser}
                getUserId={getUserId}
                isUserActive={isUserActive}
                roleLabel={language === 'en' ? 'Engineer' : 'المهندس'}
              />
            </TabsContent>

            <TabsContent value="clients">
              <UserTable
                users={filteredUsers}
                loading={loading}
                selectedUsers={selectedUsers}
                toggleUserSelection={toggleUserSelection}
                toggleAllUsersSelection={toggleAllUsersSelection}
                handleViewUser={handleViewUser}
                handleEditUser={handleEditUser}
                updateUserStatus={updateUserStatus}
                deleteUser={deleteUser}
                getUserId={getUserId}
                isUserActive={isUserActive}
                roleLabel={language === 'en' ? 'Client' : 'العميل'}
              />
            </TabsContent>

            <TabsContent value="companies">
              <UserTable
                users={filteredUsers}
                loading={loading}
                selectedUsers={selectedUsers}
                toggleUserSelection={toggleUserSelection}
                toggleAllUsersSelection={toggleAllUsersSelection}
                handleViewUser={handleViewUser}
                handleEditUser={handleEditUser}
                updateUserStatus={updateUserStatus}
                deleteUser={deleteUser}
                getUserId={getUserId}
                isUserActive={isUserActive}
                roleLabel={language === 'en' ? 'Company' : 'الشركة'}
              />
            </TabsContent>
          </Tabs>

          <AddUserModal
            open={showAddModal}
            onOpenChange={setShowAddModal}
            userForm={userForm}
            setUserForm={setUserForm}
            handleAddUser={handleAddUser}
            adding={adding}
            countries={countries}
            getCitiesForCountry={getCitiesForCountry}
          />

          <EditUserModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            editForm={editForm}
            setEditForm={setEditForm}
            handleUpdateUser={handleUpdateUser}
            updating={updating}
          />

          <ViewUserModal
            open={showViewModal}
            onOpenChange={setShowViewModal}
            viewingUser={viewingUser}
            loadingUser={loadingUser}
            getRoleLabel={getRoleLabel}
            getStatusBadge={getStatusBadge}
            getUserId={getUserId}
            handleEditUser={handleEditUser}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
