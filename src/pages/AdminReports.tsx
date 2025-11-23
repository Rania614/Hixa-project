import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Search, 
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const AdminReports = () => {
  const { language } = useApp();

  // Sample report data
  const reports = [
    { 
      id: '1', 
      name: language === 'en' ? 'User Activity Report' : 'تقرير نشاط المستخدمين',
      type: language === 'en' ? 'PDF' : 'بي دي إف',
      date: '2023-10-25',
      size: '2.1 MB',
      generatedBy: 'System'
    },
    { 
      id: '2', 
      name: language === 'en' ? 'Project Progress Report' : 'تقرير تقدم المشاريع',
      type: language === 'en' ? 'XLSX' : 'إكس إل إس إكس',
      date: '2023-10-24',
      size: '1.8 MB',
      generatedBy: 'Admin'
    },
    { 
      id: '3', 
      name: language === 'en' ? 'Financial Summary' : 'ملخص مالي',
      type: language === 'en' ? 'PDF' : 'بي دي إف',
      date: '2023-10-20',
      size: '3.2 MB',
      generatedBy: 'System'
    },
    { 
      id: '4', 
      name: language === 'en' ? 'Document Verification Report' : 'تقرير التحقق من المستندات',
      type: language === 'en' ? 'CSV' : 'سي إس في',
      date: '2023-10-18',
      size: '0.9 MB',
      generatedBy: 'Admin'
    },
    { 
      id: '5', 
      name: language === 'en' ? 'Communication Analytics' : 'تحليلات التواصل',
      type: language === 'en' ? 'PDF' : 'بي دي إف',
      date: '2023-10-15',
      size: '2.7 MB',
      generatedBy: 'System'
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
              {language === 'en' ? 'Reports & Analytics' : 'التقارير والتحليلات'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Generate and analyze platform performance reports'
                : 'إنشاء وتحليل تقارير أداء المنصة'}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={language === 'en' ? "Search reports..." : "البحث عن تقارير..."} 
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Date Range' : 'نطاق التاريخ'}
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Filters' : 'الفلاتر'}
            </Button>
            <Button className="bg-cyan hover:bg-cyan-dark">
              <Download className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Export' : 'تصدير'}
            </Button>
          </div>

          {/* Report Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Total Reports' : 'إجمالي التقارير'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-cyan">
                  <BarChart3 className="h-5 w-5 text-cyan" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">142</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Generated This Month' : 'تم إنشاؤها هذا الشهر'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-green-500">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'System Reports' : 'تقارير النظام'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-blue-500">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">98</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Manual Reports' : 'تقارير يدوية'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-purple-500">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">44</div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Placeholder */}
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Platform Activity' : 'نشاط المنصة'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <HexagonIcon size="xl" className="text-cyan mx-auto mb-4">
                    <BarChart3 className="h-12 w-12 text-cyan" />
                  </HexagonIcon>
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'en' ? 'Activity Chart' : 'مخطط النشاط'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'Visualization of platform activity over time' 
                      : 'تصور لنشاط المنصة بمرور الوقت'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Generated Reports' : 'التقارير المُنشأة'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Report' : 'التقرير'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Type' : 'النوع'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Date' : 'التاريخ'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Size' : 'الحجم'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Generated By' : 'تم إنشاؤها بواسطة'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Actions' : 'الإجراءات'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-4 px-4 font-medium">
                          {report.name}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-muted rounded-full text-xs">
                            {report.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {report.date}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {report.size}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {report.generatedBy}
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
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

export default AdminReports;