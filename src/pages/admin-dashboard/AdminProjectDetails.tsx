import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  CheckCircle,
  X,
  Edit,
  Eye,
  EyeOff,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  MessageSquare,
  UserCheck,
  UserX,
  Star,
  Building2,
  User,
  ArrowLeft,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { updateProposalStatus, deleteProposal } from '@/services/proposal.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Project {
  _id: string;
  name: string;
  title?: string;
  description: string;
  category: string;
  country: string;
  location?: string;
  budget?: number;
  status: string;
  client?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    type: 'engineer' | 'company';
  };
  proposals?: Proposal[];
  requiredSkills?: string[];
  targetRoles?: string[];
  visibility?: {
    visibleTo?: string[];
    hiddenFrom?: string[];
  };
  createdAt: string;
  deadline?: string;
}

interface Proposal {
  _id: string;
  engineer?: {
    _id: string;
    name: string;
    email: string;
    country?: string;
    rating?: number;
    avatar?: string;
  };
  company?: {
    _id: string;
    name: string;
    email: string;
    country?: string;
    rating?: number;
    avatar?: string;
  };
  price?: number;
  duration?: number;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
}

const AdminProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Debug: Log the ID
  useEffect(() => {
    console.log('AdminProjectDetails - ID from params:', id);
  }, [id]);
  
  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRequestEditModal, setShowRequestEditModal] = useState(false);
  const [showAcceptConfirmModal, setShowAcceptConfirmModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editRequestMessage, setEditRequestMessage] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Mock Data for demonstration
  const getMockProject = (projectId: string): Project | null => {
    const mockProjects: Record<string, Project> = {
      '1': {
        _id: '1',
        name: 'Residential Building Design - Riyadh',
        description: 'Modern residential building design project requiring expertise in sustainable architecture and urban planning. The project includes a 15-story residential complex with green building features.',
        category: 'architecture',
        country: 'Saudi Arabia',
        location: 'Riyadh',
        budget: 50000,
        status: 'pending_review',
        client: {
          _id: 'c1',
          name: 'Ahmed Al-Saud',
          email: 'ahmed@example.com',
          phone: '+966501234567',
        },
        requiredSkills: ['Architecture', 'Sustainable Design', 'Urban Planning', 'Green Building'],
        targetRoles: ['engineer'],
        createdAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 180 * 86400000).toISOString(),
        visibility: {
          visibleTo: ['Engineers (Architecture – Saudi Arabia)'],
          hiddenFrom: ['Other Countries', 'Other Categories'],
        },
      },
      '2': {
        _id: '2',
        name: 'Luxury Villa Interior Design',
        description: 'Complete interior design for a luxury villa in Dubai. The project requires high-end finishes and custom furniture design.',
        category: 'interior',
        country: 'UAE',
        location: 'Dubai',
        budget: 35000,
        status: 'published',
        client: {
          _id: 'c2',
          name: 'Fatima Al-Zahra',
          email: 'fatima@example.com',
          phone: '+971501234567',
        },
        requiredSkills: ['Interior Design', '3D Modeling', 'Luxury Design', 'Custom Furniture'],
        targetRoles: ['engineer', 'company'],
        proposalsCount: 5,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        deadline: new Date(Date.now() + 120 * 86400000).toISOString(),
        visibility: {
          visibleTo: ['Engineers (Interior Design – UAE)', 'Companies (Interior Design – UAE)'],
        },
      },
      '3': {
        _id: '3',
        name: 'Commercial Building MEP Design',
        description: 'MEP design for a 20-story commercial building in Cairo. Includes HVAC, electrical, and plumbing systems.',
        category: 'mep',
        country: 'Egypt',
        location: 'Cairo',
        budget: 75000,
        status: 'assigned',
        client: {
          _id: 'c3',
          name: 'Mohamed Hassan',
          email: 'mohamed@example.com',
          phone: '+201234567890',
        },
        assignedTo: {
          _id: 'e1',
          name: 'Engineer XYZ',
          type: 'engineer',
        },
        requiredSkills: ['MEP', 'HVAC', 'Electrical Systems', 'Plumbing'],
        targetRoles: ['engineer'],
        proposalsCount: 8,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        deadline: new Date(Date.now() + 90 * 86400000).toISOString(),
      },
    };
    return mockProjects[projectId] || null;
  };

  const getMockProposals = (projectId: string): Proposal[] => {
    if (projectId === '2') {
      return [
        {
          _id: 'p1',
          engineer: {
            _id: 'e1',
            name: 'Ahmed Mohamed',
            email: 'ahmed.m@example.com',
            country: 'UAE',
            rating: 4.8,
          },
          price: 32000,
          duration: 90,
          status: 'pending',
          message: 'I have 10+ years of experience in luxury interior design...',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: 'p2',
          engineer: {
            _id: 'e2',
            name: 'Sara Ali',
            email: 'sara.a@example.com',
            country: 'UAE',
            rating: 4.9,
          },
          price: 35000,
          duration: 85,
          status: 'shortlisted',
          message: 'Specialized in high-end residential and commercial projects...',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          _id: 'p3',
          company: {
            _id: 'c1',
            name: 'Design Excellence Co.',
            email: 'info@designex.com',
            country: 'UAE',
            rating: 4.7,
          },
          price: 38000,
          duration: 100,
          status: 'pending',
          message: 'We are a leading interior design company with 50+ completed projects...',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          _id: 'p4',
          engineer: {
            _id: 'e3',
            name: 'Omar Khalil',
            email: 'omar.k@example.com',
            country: 'Saudi Arabia',
            rating: 4.6,
          },
          price: 30000,
          duration: 95,
          status: 'pending',
          message: 'Experienced in luxury villa designs with focus on modern aesthetics...',
          createdAt: new Date(Date.now() - 345600000).toISOString(),
        },
        {
          _id: 'p5',
          company: {
            _id: 'c2',
            name: 'Luxury Interiors LLC',
            email: 'contact@luxuryinteriors.ae',
            country: 'UAE',
            rating: 4.9,
          },
          price: 40000,
          duration: 80,
          status: 'shortlisted',
          message: 'Award-winning design firm specializing in luxury residential projects...',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
        },
      ];
    }
    return [];
  };

  // Fetch project details
  const fetchProject = async () => {
    if (!id || id === 'undefined') {
      // Use mock data if no valid ID
      console.log('No valid ID, using mock data');
      setLoading(true);
      const mockProject = getMockProject('1'); // Default to first mock project
      if (mockProject) {
        setProject(mockProject);
        if (mockProject.status === 'published' || mockProject.status === 'approved') {
          setProposals(getMockProposals('1'));
        }
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await http.get(`/projects/${id}`);
      const projectData = response.data?.data || response.data;
      setProject(projectData);
      
      // Fetch proposals if project is published
      if (projectData.status === 'published' || projectData.status === 'approved') {
        fetchProposals();
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      // Use mock data if API fails (404, 400, network error, etc.)
      if (error.response?.status === 404 || error.response?.status === 400 || error.code === 'ERR_NETWORK' || error.code === 'ERR_BAD_REQUEST') {
        console.log('Using mock data for project due to API error');
        const mockProject = getMockProject(id);
        if (mockProject) {
          setProject(mockProject);
          if (mockProject.status === 'published' || mockProject.status === 'approved') {
            setProposals(getMockProposals(id));
          }
        } else {
          // Fallback to first mock project if ID doesn't match
          const fallbackProject = getMockProject('1');
          if (fallbackProject) {
            setProject(fallbackProject);
          } else {
            toast.error(language === 'en' ? 'Project not found' : 'المشروع غير موجود');
          }
        }
      } else {
        // For other errors, try mock data as fallback
        const mockProject = getMockProject(id) || getMockProject('1');
        if (mockProject) {
          setProject(mockProject);
          if (mockProject.status === 'published' || mockProject.status === 'approved') {
            setProposals(getMockProposals(id));
          }
        } else {
          toast.error(language === 'en' ? 'Failed to load project' : 'فشل تحميل المشروع');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch proposals
  const fetchProposals = async () => {
    if (!id) return;
    try {
      const response = await http.get(`/proposals/project/${id}`);
      const proposalsData = response.data?.data || response.data?.proposals || response.data || [];
      setProposals(Array.isArray(proposalsData) ? proposalsData : []);
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      // Use mock data if API fails
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.log('Using mock data for proposals');
        setProposals(getMockProposals(id));
      } else {
        if (error.response?.status !== 404) {
          toast.error(language === 'en' ? 'Failed to load proposals' : 'فشل تحميل العروض');
        }
        setProposals([]);
      }
    }
  };

  // Generate automatic visibility based on project criteria
  const generateAutoVisibility = (project: Project) => {
    const visibleTo: string[] = [];
    const hiddenFrom: string[] = [];
    
    // Build visible to based on country and category
    const categoryLabel = getCategoryLabel(project.category);
    const country = project.country;
    
    // Add target roles
    const roles = project.targetRoles || ['engineer', 'company'];
    roles.forEach(role => {
      const roleLabel = role === 'engineer' 
        ? (language === 'en' ? 'Engineers' : 'مهندسين')
        : (language === 'en' ? 'Companies' : 'شركات');
      visibleTo.push(`${roleLabel} (${categoryLabel} - ${country})`);
    });
    
    // Add hidden from
    hiddenFrom.push(language === 'en' ? 'Other Countries' : 'بلدان أخرى');
    hiddenFrom.push(language === 'en' ? 'Other Categories' : 'فئات أخرى');
    
    return { visibleTo, hiddenFrom };
  };

  // Approve and publish project
  const handleApprove = async () => {
    if (!id || !project) return;
    try {
      // Generate automatic visibility
      const autoVisibility = generateAutoVisibility(project);
      
      await http.put(`/projects/${id}/approve`, {
        visibility: autoVisibility
      });
      toast.success(language === 'en' ? 'Project approved and published' : 'تم الموافقة على المشروع ونشره');
      fetchProject();
    } catch (error: any) {
      console.error('Error approving project:', error);
      // For demo, update local state
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        const autoVisibility = generateAutoVisibility(project);
        setProject({
          ...project,
          status: 'published',
          visibility: autoVisibility
        });
        toast.success(language === 'en' ? 'Project approved and published (Demo)' : 'تم الموافقة على المشروع ونشره (تجريبي)');
      } else {
        toast.error(language === 'en' ? 'Failed to approve project' : 'فشل الموافقة على المشروع');
      }
    }
  };

  // Reject project
  const handleReject = async () => {
    if (!id || !rejectReason.trim()) {
      toast.error(language === 'en' ? 'Please provide a rejection reason' : 'يرجى إدخال سبب الرفض');
      return;
    }
    try {
      await http.put(`/projects/${id}/reject`, { reason: rejectReason });
      toast.success(language === 'en' ? 'Project rejected' : 'تم رفض المشروع');
      setShowRejectModal(false);
      setRejectReason('');
      fetchProject();
    } catch (error: any) {
      console.error('Error rejecting project:', error);
      toast.error(language === 'en' ? 'Failed to reject project' : 'فشل رفض المشروع');
    }
  };

  // Request edit from client
  const handleRequestEdit = async () => {
    if (!id) return;
    if (!editRequestMessage.trim()) {
      toast.error(language === 'en' ? 'Please provide edit instructions' : 'يرجى إدخال تعليمات التعديل');
      return;
    }
    try {
      await http.put(`/projects/${id}/request-edit`, { message: editRequestMessage });
      toast.success(language === 'en' ? 'Edit request sent to client' : 'تم إرسال طلب التعديل للعميل');
      setShowRequestEditModal(false);
      setEditRequestMessage('');
      fetchProject();
    } catch (error: any) {
      console.error('Error requesting edit:', error);
      // For demo purposes, show success even if API fails
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        toast.success(language === 'en' ? 'Edit request sent to client (Demo)' : 'تم إرسال طلب التعديل للعميل (تجريبي)');
        setShowRequestEditModal(false);
        setEditRequestMessage('');
      } else {
        toast.error(language === 'en' ? 'Failed to send edit request' : 'فشل إرسال طلب التعديل');
      }
    }
  };

  // Accept proposal and assign project (called from confirmation modal)
  const handleConfirmAccept = async () => {
    if (!selectedProposal) return;
    await handleAcceptProposal(selectedProposal._id);
    setShowAcceptConfirmModal(false);
      setSelectedProposal(null);
  };

  // Accept proposal - PUT /api/proposals/:id/status with { status: "accepted" }
  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await updateProposalStatus(proposalId, 'accepted');
      toast.success(language === 'en' ? 'Proposal accepted. Project status updated to In Progress.' : 'تم قبول العرض. تم تحديث حالة المشروع إلى قيد التنفيذ.');
      fetchProject();
      fetchProposals();
    } catch (error: any) {
      console.error('Error accepting proposal:', error);
      const errorMessage = error.response?.data?.message || 
        (language === 'en' ? 'Failed to accept proposal' : 'فشل قبول العرض');
      toast.error(errorMessage);
    }
  };

  // Reject proposal - PUT /api/proposals/:id/status with { status: "rejected" }
  const handleRejectProposal = async (proposalId: string) => {
    try {
      await updateProposalStatus(proposalId, 'rejected');
      toast.success(language === 'en' ? 'Proposal rejected' : 'تم رفض العرض');
      fetchProposals();
    } catch (error: any) {
      console.error('Error rejecting proposal:', error);
      const errorMessage = error.response?.data?.message || 
        (language === 'en' ? 'Failed to reject proposal' : 'فشل رفض العرض');
      toast.error(errorMessage);
    }
  };

  // Delete proposal - DELETE /api/proposals/:id
  const handleDeleteProposal = async (proposalId: string) => {
    try {
      await deleteProposal(proposalId);
      toast.success(language === 'en' ? 'Proposal deleted' : 'تم حذف العرض');
      fetchProposals();
    } catch (error: any) {
      console.error('Error deleting proposal:', error);
      const errorMessage = error.response?.data?.message || 
        (language === 'en' ? 'Failed to delete proposal' : 'فشل حذف العرض');
      toast.error(errorMessage);
    }
  };


  useEffect(() => {
    console.log('useEffect triggered, ID:', id, 'Type:', typeof id);
    if (id && id !== 'undefined') {
      fetchProject();
    } else {
      // If no valid ID, use mock data immediately
      console.log('No valid ID, using mock data');
      setLoading(true);
      const mockProject = getMockProject('1');
      if (mockProject) {
        setProject(mockProject);
        if (mockProject.status === 'published' || mockProject.status === 'approved') {
          setProposals(getMockProposals('1'));
        }
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const getProposalStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: { en: string; ar: string }; className: string }> = {
      pending: {
        label: { en: 'Pending', ar: 'قيد الانتظار' },
        className: 'bg-yellow-500/20 text-yellow-500'
      },
      shortlisted: {
        label: { en: 'Shortlisted', ar: 'مختصر' },
        className: 'bg-blue-500/20 text-blue-500'
      },
      accepted: {
        label: { en: 'Accepted', ar: 'مقبول' },
        className: 'bg-green-500/20 text-green-500'
      },
      rejected: {
        label: { en: 'Rejected', ar: 'مرفوض' },
        className: 'bg-red-500/20 text-red-500'
      },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label[language as 'en' | 'ar']}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1">
          <AdminTopBar />
          <main className="p-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1">
          <AdminTopBar />
          <main className="p-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {language === 'en' ? 'Project not found' : 'المشروع غير موجود'}
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const projectName = project.name || project.title || '';
  const canReview = project.status === 'pending_review' || project.status === 'draft';
  const canAssign = project.status === 'published' || project.status === 'approved';
  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const shortlistedProposals = proposals.filter(p => p.status === 'shortlisted');

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminTopBar />
        
        <main className="p-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/admin/projects"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin/projects');
                  }}
                >
                  {language === 'en' ? 'Projects' : 'المشاريع'}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{projectName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold">{projectName}</h2>
                  {getStatusBadge(project.status)}
                  {project._id === '1' || project._id === '2' || project._id === '3' ? (
                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      {language === 'en' ? 'Demo Data' : 'بيانات تجريبية'}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/projects')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Back' : 'رجوع'}
              </Button>
            </div>
          </div>

          {/* Admin Review Panel (only for pending review) */}
          {canReview && (
            <Card className="glass-card mb-6 border-yellow-500/20 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  {language === 'en' ? 'Admin Review Required' : 'مراجعة الأدمن مطلوبة'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleApprove}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Approve & Publish' : 'الموافقة والنشر'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectModal(true)}
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Reject' : 'رفض'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRequestEditModal(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Request Edit from Client' : 'طلب تعديل من العميل'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">
                {language === 'en' ? 'Overview' : 'نظرة عامة'}
              </TabsTrigger>
              {canAssign && (
                <TabsTrigger value="proposals">
                  {language === 'en' ? 'Proposals' : 'العروض'} ({proposals.length})
                </TabsTrigger>
              )}
              <TabsTrigger value="visibility">
                {language === 'en' ? 'Visibility Control' : 'التحكم في الظهور'}
              </TabsTrigger>
              <TabsTrigger value="communication">
                {language === 'en' ? 'Communication' : 'التواصل'}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project Info */}
                <Card className="glass-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle>{language === 'en' ? 'Project Information' : 'معلومات المشروع'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {language === 'en' ? 'Category' : 'الفئة'}
                        </label>
                        <p className="mt-1">{project.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {language === 'en' ? 'Country' : 'البلد'}
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <p>{project.country || project.location || 'N/A'}</p>
                        </div>
                      </div>
                      {project.budget && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {language === 'en' ? 'Budget' : 'الميزانية'}
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <p>${project.budget.toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      {project.deadline && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {language === 'en' ? 'Deadline' : 'الموعد النهائي'}
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p>{new Date(project.deadline).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {project.requiredSkills && project.requiredSkills.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          {language === 'en' ? 'Required Skills' : 'المهارات المطلوبة'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {project.requiredSkills.map((skill, idx) => (
                            <Badge key={idx} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        {language === 'en' ? 'Description' : 'الوصف'}
                      </label>
                      <p className="text-sm">{project.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Target Roles Control & Client Info */}
                <div className="space-y-6">
                  {/* Target Roles Control - Prominent Card */}
                  <Card className="glass-card border-cyan/30 bg-cyan/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-cyan" />
                        {language === 'en' ? 'Target Roles Control' : 'التحكم في الأدوار المستهدفة'}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'en' 
                          ? 'Select who can see and apply to this project'
                          : 'اختر من يمكنه رؤية والتقدم لهذا المشروع'}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg hover:border-cyan/50 transition-colors">
                          <input
                            type="checkbox"
                            id="target-engineer"
                            checked={project.targetRoles?.includes('engineer') || false}
                            onChange={(e) => {
                              const currentRoles = project.targetRoles || [];
                              const newRoles = e.target.checked
                                ? [...currentRoles.filter(r => r !== 'engineer'), 'engineer']
                                : currentRoles.filter(r => r !== 'engineer');
                              setProject({
                                ...project,
                                targetRoles: newRoles
                              });
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-cyan focus:ring-cyan focus:ring-2 cursor-pointer"
                          />
                          <label htmlFor="target-engineer" className="text-sm font-semibold cursor-pointer flex-1">
                            {language === 'en' ? 'Engineers' : 'مهندسين'}
                          </label>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg hover:border-cyan/50 transition-colors">
                          <input
                            type="checkbox"
                            id="target-company"
                            checked={project.targetRoles?.includes('company') || false}
                            onChange={(e) => {
                              const currentRoles = project.targetRoles || [];
                              const newRoles = e.target.checked
                                ? [...currentRoles.filter(r => r !== 'company'), 'company']
                                : currentRoles.filter(r => r !== 'company');
                              setProject({
                                ...project,
                                targetRoles: newRoles
                              });
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-cyan focus:ring-cyan focus:ring-2 cursor-pointer"
                          />
                          <label htmlFor="target-company" className="text-sm font-semibold cursor-pointer flex-1">
                            {language === 'en' ? 'Companies' : 'شركات'}
                          </label>
                        </div>
                      </div>
                      {(!project.targetRoles || project.targetRoles.length === 0) && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="text-xs text-yellow-500">
                            {language === 'en' 
                              ? '⚠️ No roles selected. Project will be visible to all users.'
                              : '⚠️ لم يتم اختيار أدوار. المشروع سيكون ظاهراً لجميع المستخدمين.'}
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={async () => {
                          try {
                            await http.put(`/projects/${id}/target-roles`, {
                              targetRoles: project.targetRoles || []
                            });
                            toast.success(language === 'en' ? 'Target roles updated' : 'تم تحديث الأدوار المستهدفة');
                            fetchProject();
                          } catch (error: any) {
                            console.error('Error updating target roles:', error);
                            if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
                              toast.success(language === 'en' ? 'Target roles updated (Demo)' : 'تم تحديث الأدوار المستهدفة (تجريبي)');
                            } else {
                              toast.error(language === 'en' ? 'Failed to update target roles' : 'فشل تحديث الأدوار المستهدفة');
                            }
                          }
                        }}
                        className="w-full bg-cyan hover:bg-cyan-dark text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Save Target Roles' : 'حفظ الأدوار المستهدفة'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Client Info */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>{language === 'en' ? 'Client Information' : 'معلومات العميل'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {project.client && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              {language === 'en' ? 'Name' : 'الاسم'}
                            </label>
                            <p className="mt-1">{project.client.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                            </label>
                            <p className="mt-1">{project.client.email}</p>
                          </div>
                          {project.client.phone && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                {language === 'en' ? 'Phone' : 'الهاتف'}
                              </label>
                              <p className="mt-1">{project.client.phone}</p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>

                </div>
              </div>
            </TabsContent>

            {/* Proposals Tab */}
            <TabsContent value="proposals">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {language === 'en' ? 'Proposals' : 'العروض'} ({proposals.length})
                    </CardTitle>
                    {pendingProposals.length > 0 && (
                      <Badge className="bg-yellow-500/20 text-yellow-500">
                        {pendingProposals.length} {language === 'en' ? 'Pending' : 'قيد الانتظار'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {proposals.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {language === 'en' ? 'No proposals yet' : 'لا توجد عروض بعد'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Name' : 'الاسم'}
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Type' : 'النوع'}
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Country' : 'البلد'}
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Rating' : 'التقييم'}
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Budget' : 'الميزانية'}
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Timeline' : 'الجدول الزمني'}
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Status' : 'الحالة'}
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              {language === 'en' ? 'Actions' : 'الإجراءات'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {proposals.map((proposal) => {
                            const proposer = proposal.engineer || proposal.company;
                            const proposerType = proposal.engineer ? 'engineer' : 'company';
                            
                            return (
                              <tr key={proposal._id} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                      <AvatarFallback className="bg-cyan text-white">
                                        {proposer?.name?.charAt(0) || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{proposer?.name}</div>
                                      <div className="text-sm text-muted-foreground">{proposer?.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <Badge variant="outline">
                                    {proposerType === 'engineer' 
                                      ? (language === 'en' ? 'Engineer' : 'مهندس')
                                      : (language === 'en' ? 'Company' : 'شركة')}
                                  </Badge>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{proposer?.country || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  {proposer?.rating ? (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                      <span className="text-sm font-medium">{proposer.rating}</span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">N/A</span>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  {(proposal as any).proposedBudget ? (
                                    <span className="font-medium">
                                      {(proposal as any).proposedBudget.amount} {(proposal as any).proposedBudget.currency}
                                    </span>
                                  ) : proposal.price ? (
                                    <span className="font-medium">${proposal.price.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">N/A</span>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  {(proposal as any).estimatedTimeline ? (
                                    <span className="text-sm">{(proposal as any).estimatedTimeline}</span>
                                  ) : proposal.duration ? (
                                    <span className="text-sm">{proposal.duration} {language === 'en' ? 'days' : 'يوم'}</span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">N/A</span>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  {getProposalStatusBadge(proposal.status)}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate(`/admin/users`)}
                                      title={language === 'en' ? 'View Profile' : 'عرض الملف الشخصي'}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate(`/admin/messages`)}
                                      title={language === 'en' ? 'Chat' : 'محادثة'}
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                    {proposal.status === 'pending' && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedProposal(proposal);
                                            setShowAcceptConfirmModal(true);
                                          }}
                                          className="bg-green-500/20 hover:bg-green-500/30"
                                          title={language === 'en' ? 'Accept' : 'قبول'}
                                        >
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRejectProposal(proposal._id)}
                                          title={language === 'en' ? 'Reject' : 'رفض'}
                                        >
                                          <UserX className="h-4 w-4 text-red-500" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteProposal(proposal._id)}
                                          title={language === 'en' ? 'Delete' : 'حذف'}
                                          className="text-red-500 hover:text-red-600"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
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
            </TabsContent>

            {/* Visibility Control Tab */}
            <TabsContent value="visibility">
              <div className="space-y-6">
                {/* Info Card */}
                <Card className="glass-card border-blue-500/20 bg-blue-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      {language === 'en' ? 'How Visibility Works' : 'كيف يعمل التحكم في الظهور'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        {language === 'en' 
                          ? '• Visibility is automatically set when you approve a project based on: Country, Category, and Target Roles'
                          : '• يتم تحديد الظهور تلقائياً عند الموافقة على المشروع بناءً على: البلد، الفئة، والأدوار المستهدفة'}
                      </p>
                      <p>
                        {language === 'en' 
                          ? '• You can manually override these settings below if needed'
                          : '• يمكنك تعديل هذه الإعدادات يدوياً أدناه إذا لزم الأمر'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Visibility Display/Edit */}
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{language === 'en' ? 'Visibility Control' : 'التحكم في الظهور'}</CardTitle>
                      {(project.status === 'published' || project.status === 'approved') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Auto-generate visibility
                            const autoVisibility = generateAutoVisibility(project);
                            setProject({
                              ...project,
                              visibility: autoVisibility
                            });
                            toast.success(language === 'en' ? 'Visibility reset to auto' : 'تم إعادة تعيين الظهور تلقائياً');
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {language === 'en' ? 'Reset to Auto' : 'إعادة تعيين تلقائي'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          {language === 'en' ? 'Visible To' : 'ظاهر لـ'}
                        </label>
                        <div className="space-y-2">
                          {project.visibility?.visibleTo && project.visibility.visibleTo.length > 0 ? (
                            project.visibility.visibleTo.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-green-500" />
                                  <span className="text-sm font-medium">{item}</span>
                                </div>
                                {(project.status === 'published' || project.status === 'approved') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newVisibleTo = project.visibility?.visibleTo?.filter((_, i) => i !== idx) || [];
                                      setProject({
                                        ...project,
                                        visibility: {
                                          ...project.visibility,
                                          visibleTo: newVisibleTo
                                        }
                                      });
                                    }}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 bg-muted/30 rounded-lg text-center">
                              <p className="text-sm text-muted-foreground">
                                {language === 'en' ? 'Visible to all matching criteria' : 'ظاهر لجميع المطابقين للمعايير'}
                              </p>
                            </div>
                          )}
                        </div>
                        {(project.status === 'published' || project.status === 'approved') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => {
                              const newItem = prompt(language === 'en' ? 'Add visible to (e.g., Engineers - Architecture - Egypt)' : 'أضف ظاهر لـ (مثال: مهندسين - عمارة - مصر)');
                              if (newItem) {
                                setProject({
                                  ...project,
                                  visibility: {
                                    ...project.visibility,
                                    visibleTo: [...(project.visibility?.visibleTo || []), newItem]
                                  }
                                });
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {language === 'en' ? 'Add' : 'إضافة'}
                          </Button>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          {language === 'en' ? 'Hidden From' : 'مخفي عن'}
                        </label>
                        <div className="space-y-2">
                          {project.visibility?.hiddenFrom && project.visibility.hiddenFrom.length > 0 ? (
                            project.visibility.hiddenFrom.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <EyeOff className="h-4 w-4 text-red-500" />
                                  <span className="text-sm font-medium">{item}</span>
                                </div>
                                {(project.status === 'published' || project.status === 'approved') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newHiddenFrom = project.visibility?.hiddenFrom?.filter((_, i) => i !== idx) || [];
                                      setProject({
                                        ...project,
                                        visibility: {
                                          ...project.visibility,
                                          hiddenFrom: newHiddenFrom
                                        }
                                      });
                                    }}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 bg-muted/30 rounded-lg text-center">
                              <p className="text-sm text-muted-foreground">
                                {language === 'en' ? 'No restrictions' : 'لا توجد قيود'}
                              </p>
                            </div>
                          )}
                        </div>
                        {(project.status === 'published' || project.status === 'approved') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => {
                              const newItem = prompt(language === 'en' ? 'Add hidden from (e.g., Other Countries)' : 'أضف مخفي عن (مثال: بلدان أخرى)');
                              if (newItem) {
                                setProject({
                                  ...project,
                                  visibility: {
                                    ...project.visibility,
                                    hiddenFrom: [...(project.visibility?.hiddenFrom || []), newItem]
                                  }
                                });
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {language === 'en' ? 'Add' : 'إضافة'}
                          </Button>
                        )}
                      </div>

                      {(project.status === 'published' || project.status === 'approved') && (
                        <div className="pt-4 border-t">
                          <Button
                            onClick={async () => {
                              try {
                                await http.put(`/projects/${id}/visibility`, {
                                  visibility: project.visibility
                                });
                                toast.success(language === 'en' ? 'Visibility updated' : 'تم تحديث الظهور');
                              } catch (error: any) {
                                console.error('Error updating visibility:', error);
                                if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
                                  toast.success(language === 'en' ? 'Visibility updated (Demo)' : 'تم تحديث الظهور (تجريبي)');
                                } else {
                                  toast.error(language === 'en' ? 'Failed to update visibility' : 'فشل تحديث الظهور');
                                }
                              }
                            }}
                            className="w-full bg-cyan hover:bg-cyan-dark"
                          >
                            {language === 'en' ? 'Save Visibility Settings' : 'حفظ إعدادات الظهور'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Communication Tab */}
            <TabsContent value="communication">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>{language === 'en' ? 'Communication' : 'التواصل'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.client && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/admin/messages')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Chat with Client' : 'محادثة مع العميل'}
                      </Button>
                    )}
                    {project.assignedTo && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/admin/messages')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {language === 'en' 
                          ? `Chat with ${project.assignedTo.name}` 
                          : `محادثة مع ${project.assignedTo.name}`}
                      </Button>
                    )}
                    {proposals.length > 0 && (
                      <div className="mt-4">
                        <label className="text-sm font-medium mb-2 block">
                          {language === 'en' ? 'Chat with Proposers' : 'محادثة مع المتقدمين'}
                        </label>
                        <div className="space-y-2">
                          {proposals.map((proposal) => {
                            const proposer = proposal.engineer || proposal.company;
                            return (
                              <Button
                                key={proposal._id}
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => navigate('/admin/messages')}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                {proposer?.name}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Reject Modal */}
          <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'en' ? 'Reject Project' : 'رفض المشروع'}</DialogTitle>
                <DialogDescription>
                  {language === 'en' 
                    ? 'Please provide a reason for rejecting this project'
                    : 'يرجى إدخال سبب رفض هذا المشروع'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder={language === 'en' ? 'Rejection reason...' : 'سبب الرفض...'}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                  {language === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  onClick={handleReject}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {language === 'en' ? 'Reject' : 'رفض'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Request Edit Modal */}
          <Dialog open={showRequestEditModal} onOpenChange={setShowRequestEditModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-cyan" />
                  {language === 'en' ? 'Request Edit from Client' : 'طلب تعديل من العميل'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'en' 
                    ? 'Send a request to the client to modify their project. Please provide clear instructions on what needs to be changed.'
                    : 'أرسل طلباً للعميل لتعديل مشروعه. يرجى تقديم تعليمات واضحة حول ما يحتاج إلى تغيير.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'en' ? 'Client Information' : 'معلومات العميل'}
                  </label>
                  {project.client && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="font-medium">{project.client.name}</p>
                      <p className="text-sm text-muted-foreground">{project.client.email}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'en' ? 'Edit Instructions' : 'تعليمات التعديل'} <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder={
                      language === 'en' 
                        ? 'Example: Please update the budget to $60,000 and add more details about the location requirements...'
                        : 'مثال: يرجى تحديث الميزانية إلى 60,000 دولار وإضافة المزيد من التفاصيل حول متطلبات الموقع...'
                    }
                    value={editRequestMessage}
                    onChange={(e) => setEditRequestMessage(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'en' 
                      ? 'Be specific about what changes are needed'
                      : 'كن محدداً حول التغييرات المطلوبة'}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-500">
                    <strong>{language === 'en' ? 'Note:' : 'ملاحظة:'}</strong>{' '}
                    {language === 'en' 
                      ? 'The client will receive a notification and can update the project accordingly.'
                      : 'سيستلم العميل إشعاراً ويمكنه تحديث المشروع وفقاً لذلك.'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRequestEditModal(false);
                    setEditRequestMessage('');
                  }}
                >
                  {language === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  onClick={handleRequestEdit}
                  className="bg-cyan hover:bg-cyan-dark"
                  disabled={!editRequestMessage.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Send Request' : 'إرسال الطلب'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Accept Proposal Confirmation Modal */}
          <Dialog open={showAcceptConfirmModal} onOpenChange={setShowAcceptConfirmModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'en' ? 'Accept Proposal' : 'قبول العرض'}</DialogTitle>
                <DialogDescription>
                  {language === 'en' 
                    ? 'The engineer will be assigned to the project and other proposals will be rejected. Are you sure?'
                    : 'سيتم تعيين المهندس ورفض باقي العروض، هل أنت متأكد؟'}
                </DialogDescription>
              </DialogHeader>
              {selectedProposal && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar>
                        <AvatarFallback className="bg-cyan text-white">
                          {(selectedProposal.engineer?.name || selectedProposal.company?.name)?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {selectedProposal.engineer?.name || selectedProposal.company?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedProposal.engineer ? (language === 'en' ? 'Engineer' : 'مهندس') : (language === 'en' ? 'Company' : 'شركة')}
                        </p>
                      </div>
                    </div>
                    {(selectedProposal as any).proposedBudget && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">{language === 'en' ? 'Budget:' : 'الميزانية:'}</span> {(selectedProposal as any).proposedBudget.amount} {(selectedProposal as any).proposedBudget.currency}
                      </p>
                    )}
                    {(selectedProposal as any).estimatedTimeline && (
                      <p className="text-sm">
                        <span className="font-medium">{language === 'en' ? 'Timeline:' : 'الجدول الزمني:'}</span> {(selectedProposal as any).estimatedTimeline}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowAcceptConfirmModal(false);
                  setSelectedProposal(null);
                }}>
                  {language === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  onClick={handleConfirmAccept}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {language === 'en' ? 'Accept & Assign' : 'قبول وتعيين'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default AdminProjectDetails;

