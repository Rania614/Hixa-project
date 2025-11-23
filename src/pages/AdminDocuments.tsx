import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Search, 
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Download,
  Eye
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const AdminDocuments = () => {
  const { language } = useApp();

  // Sample document data
  const documents = [
    { 
      id: '1', 
      name: language === 'en' ? 'Project Specification.pdf' : 'مواصفات المشروع.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploader: 'John Smith',
      project: language === 'en' ? 'Bridge Construction' : 'بناء الجسر',
      status: language === 'en' ? 'Verified' : 'مُحقق',
      uploadDate: '2023-10-15',
      icon: '📄'
    },
    { 
      id: '2', 
      name: language === 'en' ? 'Blueprints.zip' : 'المخططات.zip',
      type: 'ZIP',
      size: '15.7 MB',
      uploader: 'Sarah Johnson',
      project: language === 'en' ? 'HVAC System Design' : 'تصميم نظام التكييف',
      status: language === 'en' ? 'Pending' : 'قيد الانتظار',
      uploadDate: '2023-10-18',
      icon: '📁'
    },
    { 
      id: '3', 
      name: language === 'en' ? 'Calculations.xlsx' : 'الحسابات.xlsx',
      type: 'XLSX',
      size: '1.2 MB',
      uploader: 'Mike Chen',
      project: language === 'en' ? 'Structural Analysis' : 'تحليل هيكلي',
      status: language === 'en' ? 'Verified' : 'مُحقق',
      uploadDate: '2023-10-20',
      icon: '📊'
    },
    { 
      id: '4', 
      name: language === 'en' ? 'Safety Report.docx' : 'تقرير السلامة.docx',
      type: 'DOCX',
      size: '0.8 MB',
      uploader: 'Emma Wilson',
      project: language === 'en' ? 'Electrical Plan' : 'خطة كهربائية',
      status: language === 'en' ? 'Rejected' : 'مرفوض',
      uploadDate: '2023-10-22',
      icon: '📝'
    },
    { 
      id: '5', 
      name: language === 'en' ? 'Material List.pdf' : 'قائمة المواد.pdf',
      type: 'PDF',
      size: '1.1 MB',
      uploader: 'David Brown',
      project: language === 'en' ? 'Plumbing System' : 'نظام السباكة',
      status: language === 'en' ? 'Pending' : 'قيد الانتظار',
      uploadDate: '2023-10-25',
      icon: '📄'
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
              {language === 'en' ? 'Document Management' : 'إدارة المستندات'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Manage and verify engineering documents'
                : 'إدارة والتحقق من المستندات الهندسية'}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={language === 'en' ? "Search documents..." : "البحث عن مستندات..."} 
                className="pl-10"
              />
            </div>
            <Button className="bg-cyan hover:bg-cyan-dark">
              <Upload className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Upload Document' : 'رفع مستند'}
            </Button>
          </div>

          {/* Document Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Total Documents' : 'إجمالي المستندات'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-cyan">
                  <FileText className="h-5 w-5 text-cyan" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">242</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Verified Documents' : 'المستندات المُحققة'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-green-500">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">187</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Pending Review' : 'قيد المراجعة'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-yellow-500">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">42</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Rejected' : 'مرفوضة'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-red-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">13</div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Document List' : 'قائمة المستندات'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Document' : 'المستند'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Project' : 'المشروع'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Uploader' : 'الرافع'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Type' : 'النوع'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Size' : 'الحجم'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Status' : 'الحالة'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Upload Date' : 'تاريخ الرفع'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {language === 'en' ? 'Actions' : 'الإجراءات'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{doc.icon}</div>
                            <div>
                              <div className="font-medium">{doc.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {doc.project}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {doc.uploader}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-muted rounded-full text-xs">
                            {doc.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {doc.size}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            doc.status === (language === 'en' ? 'Verified' : 'مُحقق') 
                              ? 'bg-green-500/20 text-green-500' 
                              : doc.status === (language === 'en' ? 'Rejected' : 'مرفوض')
                                ? 'bg-red-500/20 text-red-500'
                                : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {doc.uploadDate}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
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

export default AdminDocuments;