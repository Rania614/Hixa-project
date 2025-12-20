import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Search, 
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  Filter,
  ArrowRight,
  Building2,
  User
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

interface Project {
  _id: string;
  name: string;
  title?: string;
  description: string;
  category: string;
  country: string;
  location?: string;
  budget?: number;
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'archived';
  client?: {
    _id: string;
    name: string;
    email: string;
  };
  clientId?: string;
  assignedTo?: {
    _id: string;
    name: string;
    type: 'engineer' | 'company';
  };
  proposalsCount?: number;
  createdAt: string;
  targetRoles?: string[];
  requiredSkills?: string[];
  visibility?: {
    visibleTo?: string[];
    hiddenFrom?: string[];
  };
}

const AdminProjects = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statistics, setStatistics] = useState({
    pendingReview: 0,
    active: 0,
    assigned: 0,
    rejected: 0,
    total: 0,
  });

  // Mock Data for demonstration
  const getMockProjects = (): Project[] => [
    {
      _id: '1',
      name: 'Residential Building Design - Riyadh',
      description: 'Modern residential building design project requiring expertise in sustainable architecture',
      category: 'architecture',
      country: 'Saudi Arabia',
      status: 'pending_review',
      client: { _id: 'c1', name: 'Ahmed Al-Saud', email: 'ahmed@example.com' },
      proposalsCount: 0,
      createdAt: new Date().toISOString(),
      targetRoles: ['engineer'],
      requiredSkills: ['Architecture', 'Sustainable Design', 'Urban Planning'],
      budget: 50000,
    },
    {
      _id: '2',
      name: 'Luxury Villa Interior Design',
      description: 'Complete interior design for a luxury villa in Dubai',
      category: 'interior',
      country: 'UAE',
      status: 'published',
      client: { _id: 'c2', name: 'Fatima Al-Zahra', email: 'fatima@example.com' },
      proposalsCount: 5,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      targetRoles: ['engineer', 'company'],
      requiredSkills: ['Interior Design', '3D Modeling', 'Luxury Design'],
      budget: 35000,
    },
    {
      _id: '3',
      name: 'Commercial Building MEP Design',
      description: 'MEP design for a 20-story commercial building',
      category: 'mep',
      country: 'Egypt',
      status: 'assigned',
      client: { _id: 'c3', name: 'Mohamed Hassan', email: 'mohamed@example.com' },
      assignedTo: { _id: 'e1', name: 'Engineer XYZ', type: 'engineer' },
      proposalsCount: 8,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      targetRoles: ['engineer'],
      requiredSkills: ['MEP', 'HVAC', 'Electrical Systems'],
      budget: 75000,
    },
    {
      _id: '4',
      name: 'Hotel Renovation Project',
      description: 'Complete renovation of a 5-star hotel in Cairo',
      category: 'interior',
      country: 'Egypt',
      status: 'in_progress',
      client: { _id: 'c4', name: 'Sara Ibrahim', email: 'sara@example.com' },
      assignedTo: { _id: 'c5', name: 'Design Co.', type: 'company' },
      proposalsCount: 12,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      targetRoles: ['company'],
      requiredSkills: ['Interior Design', 'Project Management', 'Hotel Design'],
      budget: 120000,
    },
    {
      _id: '5',
      name: 'Shopping Mall Architecture',
      description: 'Architectural design for a large shopping mall',
      category: 'architecture',
      country: 'Saudi Arabia',
      status: 'rejected',
      client: { _id: 'c6', name: 'Khalid Al-Mansouri', email: 'khalid@example.com' },
      proposalsCount: 0,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      targetRoles: ['engineer', 'company'],
      requiredSkills: ['Architecture', 'Commercial Design', 'Large Scale Projects'],
      budget: 200000,
    },
  ];

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await http.get('/projects');
      let projectsData = response.data?.data || response.data?.projects || response.data || [];
      if (!Array.isArray(projectsData)) projectsData = [];
      setProjects(projectsData);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      // Use mock data if API fails
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.log('Using mock data for projects');
        setProjects(getMockProjects());
      } else {
        if (error.response?.status !== 404) {
          toast.error(language === 'en' ? 'Failed to load projects' : 'فشل تحميل المشاريع');
        }
        setProjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await http.get('/projects/statistics');
      setStatistics(response.data?.data || response.data || statistics);
    } catch (error: any) {
      // Calculate from projects
      const pendingReview = projects.filter(p => p.status === 'pending_review' || p.status === 'draft').length;
      const active = projects.filter(p => p.status === 'approved' || p.status === 'published').length;
      const assigned = projects.filter(p => p.status === 'assigned' || p.status === 'in_progress').length;
      const rejected = projects.filter(p => p.status === 'rejected' || p.status === 'archived').length;
      
      setStatistics({
        pendingReview,
        active,
        assigned,
        rejected,
        total: projects.length,
      });
    }
  };

  // Update project status
  const updateProjectStatus = async (projectId: string, newStatus: string, reason?: string) => {
    try {
      await http.put(`/projects/${projectId}/status`, { status: newStatus, reason });
      toast.success(language === 'en' ? 'Project status updated' : 'تم تحديث حالة المشروع');
      fetchProjects();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error updating project status:', error);
      toast.error(language === 'en' ? 'Failed to update status' : 'فشل تحديث الحالة');
    }
  };

  // Approve and publish project
  const approveProject = async (projectId: string) => {
    try {
      await http.put(`/projects/${projectId}/approve`);
      toast.success(language === 'en' ? 'Project approved and published' : 'تم الموافقة على المشروع ونشره');
      fetchProjects();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error approving project:', error);
      toast.error(language === 'en' ? 'Failed to approve project' : 'فشل الموافقة على المشروع');
    }
  };

  // Reject project
  const rejectProject = async (projectId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error(language === 'en' ? 'Please provide a rejection reason' : 'يرجى إدخال سبب الرفض');
      return;
    }
    try {
      await http.put(`/projects/${projectId}/reject`, { reason });
      toast.success(language === 'en' ? 'Project rejected' : 'تم رفض المشروع');
      fetchProjects();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error rejecting project:', error);
      toast.error(language === 'en' ? 'Failed to reject project' : 'فشل رفض المشروع');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchStatistics();
    }
  }, [projects]);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        if (project.status !== 'pending_review' && project.status !== 'draft') return false;
      } else if (project.status !== statusFilter) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && project.category !== categoryFilter) return false;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        project.name?.toLowerCase().includes(searchLower) ||
        project.title?.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.client?.name?.toLowerCase().includes(searchLower) ||
        project.country?.toLowerCase().includes(searchLower) ||
        project.category?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: { en: string; ar: string }; className: string }> = {
      draft: {
        label: { en: 'Draft', ar: 'مسودة' },
        className: 'bg-gray-500/20 text-gray-500'
      },
      pending_review: {
        label: { en: 'Pending Review', ar: 'قيد المراجعة' },
        className: 'bg-yellow-500/20 text-yellow-500'
      },
      approved: {
        label: { en: 'Approved', ar: 'موافق عليه' },
        className: 'bg-blue-500/20 text-blue-500'
      },
      published: {
        label: { en: 'Published', ar: 'منشور' },
        className: 'bg-green-500/20 text-green-500'
      },
      assigned: {
        label: { en: 'Assigned', ar: 'معيّن' },
        className: 'bg-cyan/20 text-cyan'
      },
      in_progress: {
        label: { en: 'In Progress', ar: 'قيد التنفيذ' },
        className: 'bg-blue-500/20 text-blue-500'
      },
      completed: {
        label: { en: 'Completed', ar: 'مكتمل' },
        className: 'bg-green-500/20 text-green-500'
      },
      rejected: {
        label: { en: 'Rejected', ar: 'مرفوض' },
        className: 'bg-red-500/20 text-red-500'
      },
      archived: {
        label: { en: 'Archived', ar: 'مؤرشف' },
        className: 'bg-gray-500/20 text-gray-500'
      },
    };

    const statusInfo = statusMap[status] || statusMap.pending_review;
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label[language as 'en' | 'ar']}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, { en: string; ar: string }> = {
      architecture: { en: 'Architecture', ar: 'عمارة' },
      interior: { en: 'Interior Design', ar: 'تصميم داخلي' },
      mep: { en: 'MEP', ar: 'ميكانيكا وكهرباء' },
      structural: { en: 'Structural', ar: 'هيكلي' },
      civil: { en: 'Civil', ar: 'مدني' },
    };
    return categoryMap[category]?.[language as 'en' | 'ar'] || category;
  };

  const categories = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));

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
                ? 'Review, approve, and manage all projects on the platform'
                : 'مراجعة، الموافقة، وإدارة جميع المشاريع على المنصة'}
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <div className="text-3xl font-bold">{statistics.pendingReview}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'Awaiting approval' : 'في انتظار الموافقة'}
                </p>
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
                <div className="text-3xl font-bold">{statistics.active}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'Published & live' : 'منشورة ومتاحة'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Assigned Projects' : 'المشاريع المعيّنة'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-cyan">
                  <Briefcase className="h-5 w-5 text-cyan" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statistics.assigned}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'In progress' : 'قيد التنفيذ'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Rejected / Archived' : 'مرفوضة / مؤرشفة'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-red-500">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statistics.rejected}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'Not active' : 'غير نشطة'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={language === 'en' ? "Search projects..." : "البحث عن مشاريع..."} 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Status' : 'الحالة'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  {language === 'en' ? 'All' : 'الكل'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  {language === 'en' ? 'Pending Review' : 'قيد المراجعة'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
                  {language === 'en' ? 'Approved' : 'موافق عليه'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('assigned')}>
                  {language === 'en' ? 'Assigned' : 'معيّن'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('in_progress')}>
                  {language === 'en' ? 'In Progress' : 'قيد التنفيذ'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                  {language === 'en' ? 'Completed' : 'مكتمل'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                  {language === 'en' ? 'Rejected' : 'مرفوض'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Category' : 'الفئة'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                    {language === 'en' ? 'All Categories' : 'جميع الفئات'}
                  </DropdownMenuItem>
                  {categories.map(cat => (
                    <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)}>
                      {getCategoryLabel(cat)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Projects Table */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {language === 'en' ? 'Projects List' : 'قائمة المشاريع'} ({filteredProjects.length})
                </CardTitle>
                {projects.length > 0 && projects[0]?._id === '1' && (
                  <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    {language === 'en' ? 'Demo Data' : 'بيانات تجريبية'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {language === 'en' ? 'No projects found' : 'لا توجد مشاريع'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'en' ? 'Project Title' : 'اسم المشروع'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'en' ? 'Client' : 'العميل'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'en' ? 'Category' : 'الفئة'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'en' ? 'Country' : 'البلد'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'en' ? 'Target Roles' : 'الأدوار المستهدفة'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'en' ? 'Status' : 'الحالة'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'en' ? 'Proposals' : 'العروض'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'en' ? 'Created At' : 'تاريخ الإضافة'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'en' ? 'Actions' : 'الإجراءات'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => {
                        const projectName = project.name || project.title || '';
                        const clientName = project.client?.name || 'N/A';
                        const proposalsCount = project.proposalsCount || 0;
                        
                        return (
                          <tr key={project._id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-4 px-4">
                              <div className="font-medium max-w-xs truncate" title={projectName}>
                                {projectName}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{clientName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline">
                                {getCategoryLabel(project.category)}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{project.country || project.location || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-1">
                                {project.targetRoles?.map((role, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {role === 'engineer' ? (language === 'en' ? 'Engineers' : 'مهندسين') : 
                                     role === 'company' ? (language === 'en' ? 'Companies' : 'شركات') : role}
                                  </Badge>
                                )) || (
                                  <span className="text-sm text-muted-foreground">
                                    {language === 'en' ? 'All' : 'الكل'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(project.status)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{proposalsCount}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-muted-foreground text-sm">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/admin/projects/${project._id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  {language === 'en' ? 'View' : 'عرض'}
                                </Button>
                              </div>
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
        </main>
      </div>
    </div>
  );
};

export default AdminProjects;
