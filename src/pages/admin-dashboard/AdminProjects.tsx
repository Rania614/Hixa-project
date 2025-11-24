import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Search, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const AdminProjects = () => {
  const { language } = useApp();

  // Sample project data
  const projects = [
    { 
      id: '1', 
      name: language === 'en' ? 'Bridge Construction' : 'بناء الجسر',
      client: 'ABC Corp',
      engineer: 'John Smith',
      status: language === 'en' ? 'In Progress' : 'قيد التنفيذ',
      progress: 75,
      deadline: '2023-12-15',
      budget: '$125,000'
    },
    { 
      id: '2', 
      name: language === 'en' ? 'HVAC System Design' : 'تصميم نظام التكييف',
      client: 'XYZ Ltd',
      engineer: 'Sarah Johnson',
      status: language === 'en' ? 'Review' : 'مراجعة',
      progress: 90,
      deadline: '2023-11-30',
      budget: '$45,000'
    },
    { 
      id: '3', 
      name: language === 'en' ? 'Structural Analysis' : 'تحليل هيكلي',
      client: 'DEF Inc',
      engineer: 'Mike Chen',
      status: language === 'en' ? 'Completed' : 'مكتمل',
      progress: 100,
      deadline: '2023-10-20',
      budget: '$32,500'
    },
    { 
      id: '4', 
      name: language === 'en' ? 'Electrical Plan' : 'خطة كهربائية',
      client: 'GHI Co',
      engineer: 'Emma Wilson',
      status: language === 'en' ? 'In Progress' : 'قيد التنفيذ',
      progress: 40,
      deadline: '2024-01-10',
      budget: '$18,750'
    },
    { 
      id: '5', 
      name: language === 'en' ? 'Plumbing System' : 'نظام السباكة',
      client: 'JKL Enterprises',
      engineer: 'David Brown',
      status: language === 'en' ? 'Pending' : 'قيد الانتظار',
      progress: 0,
      deadline: '2024-02-28',
      budget: '$22,300'
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
              {language === 'en' ? 'Project Management' : 'إدارة المشاريع'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Track and manage engineering projects'
                : 'تتبع وإدارة المشاريع الهندسية'}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={language === 'en' ? "Search projects..." : "البحث عن مشاريع..."} 
                className="pl-10"
              />
            </div>
            <Button className="bg-cyan hover:bg-cyan-dark">
              <Plus className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Create Project' : 'إنشاء مشروع'}
            </Button>
          </div>

          {/* Project Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Total Projects' : 'إجمالي المشاريع'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-cyan">
                  <Briefcase className="h-5 w-5 text-cyan" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">86</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Active Projects' : 'المشاريع النشطة'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-green-500">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">32</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Pending Projects' : 'المشاريع المعلقة'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-yellow-500">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Completed' : 'مكتملة'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-blue-500">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">42</div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Project List' : 'قائمة المشاريع'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Project' : 'المشروع'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Client' : 'العميل'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Engineer' : 'المهندس'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Status' : 'الحالة'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Progress' : 'التقدم'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Deadline' : 'الموعد النهائي'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Budget' : 'الميزانية'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Actions' : 'الإجراءات'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-4 px-4 font-medium">
                          {project.name}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {project.client}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {project.engineer}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            project.status === (language === 'en' ? 'Completed' : 'مكتمل') 
                              ? 'bg-blue-500/20 text-blue-500' 
                              : project.status === (language === 'en' ? 'In Progress' : 'قيد التنفيذ')
                                ? 'bg-green-500/20 text-green-500'
                                : project.status === (language === 'en' ? 'Review' : 'مراجعة')
                                  ? 'bg-purple-500/20 text-purple-500'
                                  : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-cyan h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {project.deadline}
                        </td>
                        <td className="py-4 px-4 font-medium">
                          {project.budget}
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

export default AdminProjects;