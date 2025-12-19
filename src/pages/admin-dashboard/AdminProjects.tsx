import { useState, useEffect } from 'react';
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
  MoreHorizontal,
  Edit,
  Trash2,
  Upload,
  X,
  FileText
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';

const AdminProjects = () => {
  const { language } = useApp();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0
  });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    clientId: '',
    engineerId: '',
    status: 'pending',
    deadline: '',
    budget: ''
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await http.get('/projects');
      // Handle different response structures
      let projectsData = response.data;
      
      // If response.data is an object with a data property
      if (projectsData && typeof projectsData === 'object' && !Array.isArray(projectsData)) {
        projectsData = projectsData.data || projectsData.projects || [];
      }
      
      // Ensure it's always an array
      if (!Array.isArray(projectsData)) {
        console.warn("Projects data is not an array:", projectsData);
        projectsData = [];
      }
      
      setProjects(projectsData);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      // Don't show error toast for 404, as there might not be projects yet
      if (error.response?.status !== 404) {
        toast.error(language === 'en' ? 'Failed to load projects' : 'فشل تحميل المشاريع');
      }
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch project statistics
  const fetchStatistics = async () => {
    try {
      const response = await http.get('/projects/statistics');
      setStatistics(response.data || { total: 0, active: 0, pending: 0, completed: 0 });
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      // Calculate from projects if API fails
      const active = projects.filter((p: any) => p.status === 'in_progress' || p.status === 'active').length;
      const pending = projects.filter((p: any) => p.status === 'pending').length;
      const completed = projects.filter((p: any) => p.status === 'completed').length;
      setStatistics({
        total: projects.length,
        active,
        pending,
        completed
      });
    }
  };

  // Fetch project by ID
  const fetchProjectById = async (id: string) => {
    try {
      const response = await http.get(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast.error(language === 'en' ? 'Failed to load project' : 'فشل تحميل المشروع');
      return null;
    }
  };

  // Add new project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post('/projects', projectForm);
      toast.success(language === 'en' ? 'Project added successfully' : 'تم إضافة المشروع بنجاح');
      setShowAddModal(false);
      resetForm();
      fetchProjects();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast.error(
        language === 'en' 
          ? error.response?.data?.message || 'Failed to add project'
          : error.response?.data?.message || 'فشل إضافة المشروع'
      );
    }
  };

  // Update project
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await http.put(`/projects/${selectedProject._id || selectedProject.id}`, projectForm);
      toast.success(language === 'en' ? 'Project updated successfully' : 'تم تحديث المشروع بنجاح');
      setShowEditModal(false);
      resetForm();
      setSelectedProject(null);
      fetchProjects();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(
        language === 'en' 
          ? error.response?.data?.message || 'Failed to update project'
          : error.response?.data?.message || 'فشل تحديث المشروع'
      );
    }
  };

  // Delete project
  const handleDeleteProject = async (id: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to delete this project?' : 'هل أنت متأكد من حذف هذا المشروع؟')) {
      return;
    }
    try {
      await http.delete(`/client/projects/${id}`);
      toast.success(language === 'en' ? 'Project deleted successfully' : 'تم حذف المشروع بنجاح');
      fetchProjects();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(language === 'en' ? 'Failed to delete project' : 'فشل حذف المشروع');
    }
  };

  // Upload attachment
  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !attachmentFile) return;
    try {
      const formData = new FormData();
      formData.append('attachment', attachmentFile);
      await http.post(`/client/projects/${selectedProject._id || selectedProject.id}/attachments`, formData);
      toast.success(language === 'en' ? 'Attachment uploaded successfully' : 'تم رفع المرفق بنجاح');
      setShowAttachmentModal(false);
      setAttachmentFile(null);
      // Refresh project data
      const updatedProject = await fetchProjectById(selectedProject._id || selectedProject.id);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
    } catch (error: any) {
      console.error('Error uploading attachment:', error);
      toast.error(language === 'en' ? 'Failed to upload attachment' : 'فشل رفع المرفق');
    }
  };

  // Delete attachment
  const handleDeleteAttachment = async (projectId: string, attachmentId: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to delete this attachment?' : 'هل أنت متأكد من حذف هذا المرفق؟')) {
      return;
    }
    try {
      await http.delete(`/client/projects/${projectId}/attachments/${attachmentId}`);
      toast.success(language === 'en' ? 'Attachment deleted successfully' : 'تم حذف المرفق بنجاح');
      // Refresh project data
      const updatedProject = await fetchProjectById(projectId);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
      fetchProjects();
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      toast.error(language === 'en' ? 'Failed to delete attachment' : 'فشل حذف المرفق');
    }
  };

  // Reset form
  const resetForm = () => {
    setProjectForm({
      name: '',
      description: '',
      clientId: '',
      engineerId: '',
      status: 'pending',
      deadline: '',
      budget: ''
    });
  };

  // Open edit modal
  const openEditModal = async (project: any) => {
    setSelectedProject(project);
    setProjectForm({
      name: project.name || '',
      description: project.description || '',
      clientId: project.clientId || project.client?._id || '',
      engineerId: project.engineerId || project.engineer?._id || '',
      status: project.status || 'pending',
      deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
      budget: project.budget || ''
    });
    setShowEditModal(true);
  };

  // Open attachment modal
  const openAttachmentModal = async (project: any) => {
    const fullProject = await fetchProjectById(project._id || project.id);
    setSelectedProject(fullProject || project);
    setShowAttachmentModal(true);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchStatistics();
    }
  }, [projects]);

  // Filter projects by search term
  const filteredProjects = projects.filter((project: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (project.name || '').toLowerCase().includes(searchLower) ||
      (project.client?.name || project.client || '').toLowerCase().includes(searchLower) ||
      (project.engineer?.name || project.engineer || '').toLowerCase().includes(searchLower)
    );
  });

  // Sample project data (fallback)
  const sampleProjects = [
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              className="bg-cyan hover:bg-cyan-dark"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
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
                <div className="text-3xl font-bold">{statistics.total}</div>
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
                <div className="text-3xl font-bold">{statistics.pending}</div>
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
                <div className="text-3xl font-bold">{statistics.completed}</div>
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
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          {language === 'en' ? 'Loading projects...' : 'جاري تحميل المشاريع...'}
                        </td>
                      </tr>
                    ) : filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          {language === 'en' ? 'No projects found' : 'لا توجد مشاريع'}
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((project: any) => {
                        const projectId = project._id || project.id;
                        const projectName = project.name || project.title || '';
                        const clientName = project.client?.name || project.client || '';
                        const engineerName = project.engineer?.name || project.engineer || '';
                        const status = project.status || 'pending';
                        const progress = project.progress || 0;
                        const deadline = project.deadline ? new Date(project.deadline).toLocaleDateString() : '-';
                        const budget = project.budget ? `$${project.budget}` : '-';
                        
                        return (
                          <tr key={projectId} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-4 px-4 font-medium">
                              {projectName}
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {clientName}
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {engineerName}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                status === 'completed' 
                                  ? 'bg-blue-500/20 text-blue-500' 
                                  : status === 'in_progress' || status === 'active'
                                    ? 'bg-green-500/20 text-green-500'
                                    : status === 'review'
                                      ? 'bg-purple-500/20 text-purple-500'
                                      : 'bg-yellow-500/20 text-yellow-500'
                              }`}>
                                {status === 'completed' ? (language === 'en' ? 'Completed' : 'مكتمل')
                                  : status === 'in_progress' || status === 'active' ? (language === 'en' ? 'In Progress' : 'قيد التنفيذ')
                                  : status === 'review' ? (language === 'en' ? 'Review' : 'مراجعة')
                                  : (language === 'en' ? 'Pending' : 'قيد الانتظار')}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-cyan h-2 rounded-full" 
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-muted-foreground">{progress}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {deadline}
                            </td>
                            <td className="py-4 px-4 font-medium">
                              {budget}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => openEditModal(project)}
                                  title={language === 'en' ? 'Edit' : 'تعديل'}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => openAttachmentModal(project)}
                                  title={language === 'en' ? 'Attachments' : 'المرفقات'}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteProject(projectId)}
                                  title={language === 'en' ? 'Delete' : 'حذف'}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{language === 'en' ? 'Create New Project' : 'إنشاء مشروع جديد'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Project Name' : 'اسم المشروع'}</label>
                  <Input
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Description' : 'الوصف'}</label>
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    rows={4}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Client ID' : 'معرف العميل'}</label>
                    <Input
                      value={projectForm.clientId}
                      onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Engineer ID' : 'معرف المهندس'}</label>
                    <Input
                      value={projectForm.engineerId}
                      onChange={(e) => setProjectForm({ ...projectForm, engineerId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Status' : 'الحالة'}</label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      value={projectForm.status}
                      onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    >
                      <option value="pending">{language === 'en' ? 'Pending' : 'قيد الانتظار'}</option>
                      <option value="in_progress">{language === 'en' ? 'In Progress' : 'قيد التنفيذ'}</option>
                      <option value="review">{language === 'en' ? 'Review' : 'مراجعة'}</option>
                      <option value="completed">{language === 'en' ? 'Completed' : 'مكتمل'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Deadline' : 'الموعد النهائي'}</label>
                    <Input
                      type="date"
                      value={projectForm.deadline}
                      onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Budget' : 'الميزانية'}</label>
                  <Input
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    {language === 'en' ? 'Cancel' : 'إلغاء'}
                  </Button>
                  <Button type="submit" className="bg-cyan hover:bg-cyan-dark">
                    {language === 'en' ? 'Create' : 'إنشاء'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{language === 'en' ? 'Edit Project' : 'تعديل المشروع'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Project Name' : 'اسم المشروع'}</label>
                  <Input
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Description' : 'الوصف'}</label>
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    rows={4}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Client ID' : 'معرف العميل'}</label>
                    <Input
                      value={projectForm.clientId}
                      onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Engineer ID' : 'معرف المهندس'}</label>
                    <Input
                      value={projectForm.engineerId}
                      onChange={(e) => setProjectForm({ ...projectForm, engineerId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Status' : 'الحالة'}</label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      value={projectForm.status}
                      onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    >
                      <option value="pending">{language === 'en' ? 'Pending' : 'قيد الانتظار'}</option>
                      <option value="in_progress">{language === 'en' ? 'In Progress' : 'قيد التنفيذ'}</option>
                      <option value="review">{language === 'en' ? 'Review' : 'مراجعة'}</option>
                      <option value="completed">{language === 'en' ? 'Completed' : 'مكتمل'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Deadline' : 'الموعد النهائي'}</label>
                    <Input
                      type="date"
                      value={projectForm.deadline}
                      onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Budget' : 'الميزانية'}</label>
                  <Input
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                    {language === 'en' ? 'Cancel' : 'إلغاء'}
                  </Button>
                  <Button type="submit" className="bg-cyan hover:bg-cyan-dark">
                    {language === 'en' ? 'Update' : 'تحديث'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attachment Modal */}
      {showAttachmentModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{language === 'en' ? 'Project Attachments' : 'مرفقات المشروع'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAttachmentModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload New Attachment */}
                <form onSubmit={handleUploadAttachment} className="space-y-4 border-b pb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Upload Attachment' : 'رفع مرفق'}</label>
                    <Input
                      type="file"
                      onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-cyan hover:bg-cyan-dark">
                    <Upload className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Upload' : 'رفع'}
                  </Button>
                </form>

                {/* List Attachments */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{language === 'en' ? 'Attachments' : 'المرفقات'}</h3>
                  {selectedProject.attachments && selectedProject.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedProject.attachments.map((attachment: any) => (
                        <div key={attachment._id || attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{attachment.name || attachment.filename || 'Attachment'}</p>
                              <p className="text-sm text-muted-foreground">
                                {attachment.size ? `${(attachment.size / 1024).toFixed(2)} KB` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {attachment.url && (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan hover:underline"
                              >
                                {language === 'en' ? 'View' : 'عرض'}
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAttachment(
                                selectedProject._id || selectedProject.id,
                                attachment._id || attachment.id
                              )}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {language === 'en' ? 'No attachments' : 'لا توجد مرفقات'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;