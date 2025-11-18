import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileEdit, Globe, Image, Settings } from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const AdminDashboard = () => {
  const { language, content } = useApp();

  const stats = [
    {
      title: language === 'en' ? 'Services' : 'الخدمات',
      value: content.services.length,
      icon: Settings,
    },
    {
      title: language === 'en' ? 'Projects' : 'المشاريع',
      value: content.projects.length,
      icon: Image,
    },
    {
      title: language === 'en' ? 'Languages' : 'اللغات',
      value: 2,
      icon: Globe,
    },
    {
      title: language === 'en' ? 'Sections' : 'الأقسام',
      value: 7,
      icon: FileEdit,
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
              {language === 'en' ? 'Welcome Back!' : 'مرحبًا بك!'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Manage your website content from here'
                : 'إدارة محتوى موقعك من هنا'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <HexagonIcon size="sm" className="text-gold">
                    <stat.icon className="h-5 w-5 text-gold" />
                  </HexagonIcon>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {language === 'en'
                  ? 'Navigate to Content Management to edit your website content in both English and Arabic.'
                  : 'انتقل إلى إدارة المحتوى لتحرير محتوى موقعك باللغتين الإنجليزية والعربية.'}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
