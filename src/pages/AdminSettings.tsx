import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Save,
  Bell,
  Shield,
  User,
  Globe,
  Mail,
  Key
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const AdminSettings = () => {
  const { language } = useApp();

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
                </div>
              </CardContent>
            </Card>

            {/* Settings Content */}
            <Card className="glass-card lg:col-span-2">
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

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button className="bg-cyan hover:bg-cyan-dark">
                      <Save className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Save Changes' : 'حفظ التغييرات'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;