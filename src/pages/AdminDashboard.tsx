import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const AdminDashboard = () => {
  const { language } = useApp();

  // Overview metrics
  const metrics = [
    {
      title: language === 'en' ? 'New Users' : 'مستخدمون جدد',
      value: '24',
      change: '+12%',
      icon: Users,
      color: 'text-cyan',
    },
    {
      title: language === 'en' ? 'Active Projects' : 'مشاريع نشطة',
      value: '18',
      change: '+5%',
      icon: Briefcase,
      color: 'text-cyan',
    },
    {
      title: language === 'en' ? 'Documents Uploaded' : 'مستندات مرفوعة',
      value: '142',
      change: '+8%',
      icon: FileText,
      color: 'text-cyan',
    },
    {
      title: language === 'en' ? 'Pending Reviews' : 'قيد المراجعة',
      value: '7',
      change: '-2%',
      icon: Clock,
      color: 'text-cyan',
    },
  ];

  // User management data
  const userStats = [
    { status: language === 'en' ? 'Active Engineers' : 'مهندسين نشطين', count: 42, icon: CheckCircle, color: 'text-green-500' },
    { status: language === 'en' ? 'Active Clients' : 'عملاء نشطين', count: 28, icon: CheckCircle, color: 'text-green-500' },
    { status: language === 'en' ? 'Pending Verification' : 'قيد التحقق', count: 5, icon: Clock, color: 'text-yellow-500' },
    { status: language === 'en' ? 'Suspended' : 'معلقين', count: 2, icon: AlertCircle, color: 'text-red-500' },
  ];

  // Recent projects data
  const recentProjects = [
    { 
      id: '1', 
      name: language === 'en' ? 'Bridge Construction' : 'بناء الجسر', 
      client: 'ABC Corp', 
      status: language === 'en' ? 'In Progress' : 'قيد التنفيذ',
      progress: 75 
    },
    { 
      id: '2', 
      name: language === 'en' ? 'HVAC System Design' : 'تصميم نظام التكييف', 
      client: 'XYZ Ltd', 
      status: language === 'en' ? 'Review' : 'مراجعة',
      progress: 90 
    },
    { 
      id: '3', 
      name: language === 'en' ? 'Structural Analysis' : 'تحليل هيكلي', 
      client: 'DEF Inc', 
      status: language === 'en' ? 'Completed' : 'مكتمل',
      progress: 100 
    },
    { 
      id: '4', 
      name: language === 'en' ? 'Electrical Plan' : 'خطة كهربائية', 
      client: 'GHI Co', 
      status: language === 'en' ? 'In Progress' : 'قيد التنفيذ',
      progress: 40 
    },
  ];

  // Recent documents
  const recentDocuments = [
    { 
      id: '1', 
      name: language === 'en' ? 'Project Specification.pdf' : 'مواصفات المشروع.pdf', 
      type: 'PDF', 
      uploader: 'John Smith',
      time: language === 'en' ? '2 hours ago' : 'منذ ساعتين'
    },
    { 
      id: '2', 
      name: language === 'en' ? 'Blueprints.zip' : 'المخططات.zip', 
      type: 'ZIP', 
      uploader: 'Sarah Johnson',
      time: language === 'en' ? '4 hours ago' : 'منذ 4 ساعات'
    },
    { 
      id: '3', 
      name: language === 'en' ? 'Calculations.xlsx' : 'الحسابات.xlsx', 
      type: 'XLSX', 
      uploader: 'Mike Chen',
      time: language === 'en' ? '1 day ago' : 'منذ يوم'
    },
    { 
      id: '4', 
      name: language === 'en' ? 'Safety Report.docx' : 'تقرير السلامة.docx', 
      type: 'DOCX', 
      uploader: 'Emma Wilson',
      time: language === 'en' ? '2 days ago' : 'منذ يومين'
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
              {language === 'en' ? 'Dashboard Overview' : 'نظرة عامة على لوحة التحكم'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Monitor platform activity, user management, and project progress'
                : 'مراقبة نشاط المنصة، إدارة المستخدمين، وتقدم المشاريع'}
            </p>
          </div>

          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <Card key={index} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <HexagonIcon size="sm" className={metric.color}>
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </HexagonIcon>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{metric.change} from last month</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Management and Project Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Management */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'User Management' : 'إدارة المستخدمين'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HexagonIcon size="sm" className={stat.color}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </HexagonIcon>
                        <span>{stat.status}</span>
                      </div>
                      <span className="font-semibold">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Status */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Project Status' : 'حالة المشاريع'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{project.name}</h4>
                        <span className="text-sm text-muted-foreground">{project.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-cyan h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{project.progress}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Documents and Communication */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Documents */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Recent Document Uploads' : 'أحدث المستندات المرفوعة'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground">{doc.uploader} • {doc.time}</p>
                      </div>
                      <div className="px-2 py-1 bg-background rounded text-xs font-medium">
                        {doc.type}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Communication Overview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Communication Overview' : 'نظرة عامة على التواصل'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <HexagonIcon size="sm" className="text-cyan">
                        <MessageSquare className="h-4 w-4" />
                      </HexagonIcon>
                      <div>
                        <h4 className="font-medium text-sm">
                          {language === 'en' ? 'Unread Messages' : 'رسائل غير مقروءة'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {language === 'en' ? '3 engineers, 2 clients' : '3 مهندسين، 2 عملاء'}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">5</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <HexagonIcon size="sm" className="text-cyan">
                        <BarChart3 className="h-4 w-4" />
                      </HexagonIcon>
                      <div>
                        <h4 className="font-medium text-sm">
                          {language === 'en' ? 'Active Discussions' : 'مناقشات نشطة'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {language === 'en' ? '7 project threads' : '7 مواضيع مشاريع'}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">7</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <HexagonIcon size="sm" className="text-cyan">
                        <Clock className="h-4 w-4" />
                      </HexagonIcon>
                      <div>
                        <h4 className="font-medium text-sm">
                          {language === 'en' ? 'Pending Responses' : 'ردود معلقة'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {language === 'en' ? 'Average response time: 2h' : 'متوسط وقت الرد: ساعتين'}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">12</span>
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

export default AdminDashboard;