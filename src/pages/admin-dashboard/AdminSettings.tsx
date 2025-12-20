import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Save,
  Bell,
  Shield,
  User,
  Globe,
  Mail,
  Key,
  Users,
  Lock,
  Eye
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { useState } from 'react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'moderator';
  permissions: {
    reviewProjects: boolean;
    approveRejectProjects: boolean;
    assignEngineers: boolean;
    accessPayments: boolean;
    viewAllChats: boolean;
    editSystemSettings: boolean;
  };
  readOnly: boolean;
}

const AdminSettings = () => {
  const { language } = useApp();
  
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Ahmed Ali',
      email: 'ahmed@hixa.com',
      role: 'super_admin',
      permissions: {
        reviewProjects: true,
        approveRejectProjects: true,
        assignEngineers: true,
        accessPayments: true,
        viewAllChats: true,
        editSystemSettings: true,
      },
      readOnly: false,
    },
    {
      id: '2',
      name: 'Mohamed Hassan',
      email: 'mohamed@hixa.com',
      role: 'moderator',
      permissions: {
        reviewProjects: true,
        approveRejectProjects: false,
        assignEngineers: false,
        accessPayments: false,
        viewAllChats: true,
        editSystemSettings: false,
      },
      readOnly: true,
    },
  ]);

  const [selectedAdmin, setSelectedAdmin] = useState<string>(admins[0]?.id || '');

  const currentAdmin = admins.find(a => a.id === selectedAdmin);

  const updateAdminRole = (adminId: string, role: 'super_admin' | 'moderator') => {
    setAdmins(admins.map(admin => {
      if (admin.id === adminId) {
        // Super Admin gets all permissions, Moderator starts with basic
        const newPermissions = role === 'super_admin' 
          ? {
              reviewProjects: true,
              approveRejectProjects: true,
              assignEngineers: true,
              accessPayments: true,
              viewAllChats: true,
              editSystemSettings: true,
            }
          : {
              reviewProjects: true,
              approveRejectProjects: false,
              assignEngineers: false,
              accessPayments: false,
              viewAllChats: true,
              editSystemSettings: false,
            };
        
        return { ...admin, role, permissions: newPermissions };
      }
      return admin;
    }));
  };

  const updatePermission = (adminId: string, permission: keyof AdminUser['permissions'], value: boolean) => {
    setAdmins(admins.map(admin => {
      if (admin.id === adminId) {
        return {
          ...admin,
          permissions: {
            ...admin.permissions,
            [permission]: value,
          },
        };
      }
      return admin;
    }));
  };

  const toggleReadOnly = (adminId: string) => {
    setAdmins(admins.map(admin => {
      if (admin.id === adminId) {
        return { ...admin, readOnly: !admin.readOnly };
      }
      return admin;
    }));
  };

  const handleSave = () => {
    // TODO: Save to API
    console.log('Saving admin settings:', admins);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminTopBar />
        
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {language === 'en' ? 'Settings' : 'الإعدادات'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Configure platform preferences and administration settings'
                : 'تكوين تفضيلات المنصة وإعدادات الإدارة'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Navigation */}
            <Card className="glass-card lg:col-span-1">
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Settings Menu' : 'قائمة الإعدادات'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start gap-3 font-normal">
                    <HexagonIcon size="sm" className="text-cyan">
                      <User className="h-4 w-4" />
                    </HexagonIcon>
                    {language === 'en' ? 'Profile Settings' : 'إعدادات الملف الشخصي'}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 font-normal">
                    <HexagonIcon size="sm" className="text-cyan">
                      <Shield className="h-4 w-4" />
                    </HexagonIcon>
                    {language === 'en' ? 'Security' : 'الأمان'}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 font-normal">
                    <HexagonIcon size="sm" className="text-cyan">
                      <Bell className="h-4 w-4" />
                    </HexagonIcon>
                    {language === 'en' ? 'Notifications' : 'الإشعارات'}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 font-normal bg-muted">
                    <HexagonIcon size="sm" className="text-cyan">
                      <Globe className="h-4 w-4" />
                    </HexagonIcon>
                    {language === 'en' ? 'Platform Configuration' : 'تكوين المنصة'}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 font-normal">
                    <HexagonIcon size="sm" className="text-cyan">
                      <Mail className="h-4 w-4" />
                    </HexagonIcon>
                    {language === 'en' ? 'Email Settings' : 'إعدادات البريد الإلكتروني'}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 font-normal bg-muted">
                    <HexagonIcon size="sm" className="text-cyan">
                      <Users className="h-4 w-4" />
                    </HexagonIcon>
                    {language === 'en' ? 'Admin Management' : 'إدارة المشرفين'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings Content */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {language === 'en' ? 'Admin Management' : 'إدارة المشرفين'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Admin Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Select Admin' : 'اختر المشرف'}
                    </label>
                    <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {admins.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            {admin.name} ({admin.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentAdmin && (
                    <>
                      {/* Role Selection */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'en' ? 'Role' : 'الدور'}
                        </label>
                        <Select 
                          value={currentAdmin.role} 
                          onValueChange={(value: 'super_admin' | 'moderator') => 
                            updateAdminRole(currentAdmin.id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">
                              {language === 'en' ? 'Super Admin' : 'المشرف الرئيسي'}
                            </SelectItem>
                            <SelectItem value="moderator">
                              {language === 'en' ? 'Moderator' : 'المشرف'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Permissions */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">
                            {language === 'en' ? 'Permissions' : 'الصلاحيات'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {language === 'en' ? 'Read-only' : 'قراءة فقط'}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleReadOnly(currentAdmin.id)}
                              className={currentAdmin.readOnly ? 'bg-cyan/20 border-cyan' : ''}
                            >
                              {currentAdmin.readOnly 
                                ? (language === 'en' ? 'Enabled' : 'مفعّل')
                                : (language === 'en' ? 'Disabled' : 'معطّل')
                              }
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className={`flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 ${currentAdmin.readOnly ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id="reviewProjects"
                                checked={currentAdmin.permissions.reviewProjects}
                                onCheckedChange={(checked) => 
                                  updatePermission(currentAdmin.id, 'reviewProjects', checked as boolean)
                                }
                                disabled={currentAdmin.readOnly}
                              />
                              <label 
                                htmlFor="reviewProjects" 
                                className={`text-sm font-medium flex-1 ${currentAdmin.readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {language === 'en' ? 'Review projects' : 'مراجعة المشاريع'}
                              </label>
                            </div>
                          </div>

                          <div className={`flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 ${currentAdmin.readOnly ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id="approveRejectProjects"
                                checked={currentAdmin.permissions.approveRejectProjects}
                                onCheckedChange={(checked) => 
                                  updatePermission(currentAdmin.id, 'approveRejectProjects', checked as boolean)
                                }
                                disabled={currentAdmin.readOnly}
                              />
                              <label 
                                htmlFor="approveRejectProjects" 
                                className={`text-sm font-medium flex-1 ${currentAdmin.readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {language === 'en' ? 'Approve / Reject projects' : 'الموافقة / رفض المشاريع'}
                              </label>
                            </div>
                          </div>

                          <div className={`flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 ${currentAdmin.readOnly ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id="assignEngineers"
                                checked={currentAdmin.permissions.assignEngineers}
                                onCheckedChange={(checked) => 
                                  updatePermission(currentAdmin.id, 'assignEngineers', checked as boolean)
                                }
                                disabled={currentAdmin.readOnly}
                              />
                              <label 
                                htmlFor="assignEngineers" 
                                className={`text-sm font-medium flex-1 ${currentAdmin.readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {language === 'en' ? 'Assign engineers' : 'تعيين المهندسين'}
                              </label>
                            </div>
                          </div>

                          <div className={`flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 ${currentAdmin.readOnly ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id="accessPayments"
                                checked={currentAdmin.permissions.accessPayments}
                                onCheckedChange={(checked) => 
                                  updatePermission(currentAdmin.id, 'accessPayments', checked as boolean)
                                }
                                disabled={currentAdmin.readOnly}
                              />
                              <label 
                                htmlFor="accessPayments" 
                                className={`text-sm font-medium flex-1 ${currentAdmin.readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {language === 'en' ? 'Access payments' : 'الوصول إلى المدفوعات'}
                              </label>
                            </div>
                          </div>

                          <div className={`flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 ${currentAdmin.readOnly ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id="viewAllChats"
                                checked={currentAdmin.permissions.viewAllChats}
                                onCheckedChange={(checked) => 
                                  updatePermission(currentAdmin.id, 'viewAllChats', checked as boolean)
                                }
                                disabled={currentAdmin.readOnly}
                              />
                              <label 
                                htmlFor="viewAllChats" 
                                className={`text-sm font-medium flex-1 ${currentAdmin.readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {language === 'en' ? 'View all chats' : 'عرض جميع المحادثات'}
                              </label>
                            </div>
                          </div>

                          <div className={`flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 ${currentAdmin.readOnly ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id="editSystemSettings"
                                checked={currentAdmin.permissions.editSystemSettings}
                                onCheckedChange={(checked) => 
                                  updatePermission(currentAdmin.id, 'editSystemSettings', checked as boolean)
                                }
                                disabled={currentAdmin.readOnly}
                              />
                              <label 
                                htmlFor="editSystemSettings" 
                                className={`text-sm font-medium flex-1 ${currentAdmin.readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {language === 'en' ? 'Edit system settings' : 'تعديل إعدادات النظام'}
                              </label>
                            </div>
                          </div>
                        </div>
                        {currentAdmin.readOnly && (
                          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              {language === 'en' 
                                ? 'This admin has read-only permissions. They can view but cannot modify data.'
                                : 'هذا المشرف لديه صلاحيات القراءة فقط. يمكنه العرض ولكن لا يمكنه تعديل البيانات.'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Admin Info */}
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              {language === 'en' ? 'Name' : 'الاسم'}
                            </span>
                            <span className="text-sm font-medium">{currentAdmin.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                            </span>
                            <span className="text-sm font-medium">{currentAdmin.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              {language === 'en' ? 'Current Role' : 'الدور الحالي'}
                            </span>
                            <span className="text-sm font-medium">
                              {currentAdmin.role === 'super_admin' 
                                ? (language === 'en' ? 'Super Admin' : 'المشرف الرئيسي')
                                : (language === 'en' ? 'Moderator' : 'المشرف')
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button className="bg-cyan hover:bg-cyan-dark" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Save Changes' : 'حفظ التغييرات'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Settings Card - Keeping existing settings */}
          <Card className="glass-card mt-6">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Platform Configuration' : 'تكوين المنصة'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* General Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {language === 'en' ? 'General Settings' : 'الإعدادات العامة'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'en' ? 'Platform Name' : 'اسم المنصة'}
                        </label>
                        <Input defaultValue="HIXA Engineering Platform" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'en' ? 'Default Language' : 'اللغة الافتراضية'}
                        </label>
                        <select className="w-full p-2 border border-border rounded bg-background">
                          <option>{language === 'en' ? 'English' : 'الإنجليزية'}</option>
                          <option>{language === 'en' ? 'Arabic' : 'العربية'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'en' ? 'Timezone' : 'المنطقة الزمنية'}
                        </label>
                        <select className="w-full p-2 border border-border rounded bg-background">
                          <option>UTC+0</option>
                          <option>UTC+1</option>
                          <option>UTC+2</option>
                          <option>UTC+3</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* User Management Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {language === 'en' ? 'User Management' : 'إدارة المستخدمين'}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {language === 'en' ? 'Email Verification' : 'التحقق من البريد الإلكتروني'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'en' 
                              ? 'Require email verification for new users' 
                              : 'طلب التحقق من البريد الإلكتروني للمستخدمين الجدد'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {language === 'en' ? 'Enabled' : 'ممكّن'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {language === 'en' ? 'Two-Factor Authentication' : 'المصادقة الثنائية'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'en' 
                              ? 'Require 2FA for admin accounts' 
                              : 'طلب المصادقة الثنائية لحسابات المشرفين'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {language === 'en' ? 'Enabled' : 'ممكّن'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Project Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {language === 'en' ? 'Project Management' : 'إدارة المشاريع'}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {language === 'en' ? 'Document Verification' : 'التحقق من المستندات'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'en' 
                              ? 'Require document verification before project start' 
                              : 'طلب التحقق من المستندات قبل بدء المشروع'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {language === 'en' ? 'Enabled' : 'ممكّن'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {language === 'en' ? 'Milestone Tracking' : 'تتبع المعالم'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'en' 
                              ? 'Enable milestone tracking for all projects' 
                              : 'تمكين تتبع المعالم لجميع المشاريع'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {language === 'en' ? 'Enabled' : 'ممكّن'}
                        </Button>
                      </div>
                    </div>
                  </div>

              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;