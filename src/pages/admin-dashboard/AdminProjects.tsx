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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, CheckCircle2, Trash2, Copy, MoreHorizontal } from 'lucide-react';

interface Project {
  _id?: string;
  id?: string;
  name: string;
  title?: string;
  description: string;
  category: string;
  country: string;
  location?: string;
  budget?: number;
  status: 'Draft' | 'Pending Review' | 'Waiting for Engineers' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rejected' | 'draft' | 'pending_review' | 'approved' | 'published' | 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'archived';
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
  adminApproval?: {
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: {
      _id: string;
      name: string;
      email: string;
    } | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
  };
}

// Helper function to get project ID (supports both _id and id)
const getProjectId = (project: Project): string => {
  return project._id || project.id || '';
};

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
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [hardDeleting, setHardDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [projectToCancel, setProjectToCancel] = useState<{ id: string; name: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Mock Data for demonstration
  const getMockProjects = (): Project[] => [
    {
      _id: '1',
      name: 'Residential Building Design - Riyadh',
      title: 'Residential Building Design - Riyadh',
      description: 'Modern residential building design project requiring expertise in sustainable architecture and green building standards. The project includes 50 residential units with modern amenities.',
      category: 'architecture',
      country: 'Saudi Arabia',
      location: 'Riyadh, Al Olaya District',
      status: 'pending_review',
      client: { _id: 'c1', name: 'Ahmed Al-Saud', email: 'ahmed@example.com' },
      proposalsCount: 0,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      targetRoles: ['engineer'],
      requiredSkills: ['Architecture', 'Sustainable Design', 'Urban Planning', 'AutoCAD', 'Revit'],
      budget: 50000,
      deadline: new Date(Date.now() + 90 * 86400000).toISOString(),
    },
    {
      _id: '2',
      name: 'Luxury Villa Interior Design',
      title: 'Luxury Villa Interior Design',
      description: 'Complete interior design for a luxury villa in Dubai. The project requires high-end finishes, custom furniture design, and smart home integration.',
      category: 'interior',
      country: 'UAE',
      location: 'Dubai, Palm Jumeirah',
      status: 'published',
      client: { _id: 'c2', name: 'Fatima Al-Zahra', email: 'fatima@example.com' },
      proposalsCount: 5,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      targetRoles: ['engineer', 'company'],
      requiredSkills: ['Interior Design', '3D Modeling', 'Luxury Design', 'Furniture Design', 'Lighting Design'],
      budget: 35000,
      deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
    },
    {
      _id: '3',
      name: 'Commercial Building MEP Design',
      title: 'Commercial Building MEP Design',
      description: 'Complete MEP design for a 20-story commercial building including HVAC, electrical, plumbing, and fire safety systems. The building will house offices and retail spaces.',
      category: 'mep',
      country: 'Egypt',
      location: 'Cairo, New Cairo',
      status: 'assigned',
      client: { _id: 'c3', name: 'Mohamed Hassan', email: 'mohamed@example.com' },
      assignedTo: { _id: 'e1', name: 'Engineer XYZ', type: 'engineer' },
      proposalsCount: 8,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      targetRoles: ['engineer'],
      requiredSkills: ['MEP', 'HVAC', 'Electrical Systems', 'Plumbing', 'Fire Safety', 'AutoCAD MEP'],
      budget: 75000,
      deadline: new Date(Date.now() + 120 * 86400000).toISOString(),
    },
    {
      _id: '4',
      name: 'Hotel Renovation Project',
      title: 'Hotel Renovation Project',
      description: 'Complete renovation of a 5-star hotel in Cairo including guest rooms, lobby, restaurants, and spa areas. The project requires maintaining luxury standards while modernizing the facilities.',
      category: 'interior',
      country: 'Egypt',
      location: 'Cairo, Zamalek',
      status: 'in_progress',
      client: { _id: 'c4', name: 'Sara Ibrahim', email: 'sara@example.com' },
      assignedTo: { _id: 'c5', name: 'Design Co.', type: 'company' },
      proposalsCount: 12,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      targetRoles: ['company'],
      requiredSkills: ['Interior Design', 'Project Management', 'Hotel Design', 'Hospitality Design', 'Renovation'],
      budget: 120000,
      deadline: new Date(Date.now() + 180 * 86400000).toISOString(),
    },
    {
      _id: '5',
      name: 'Shopping Mall Architecture',
      title: 'Shopping Mall Architecture',
      description: 'Architectural design for a large shopping mall with 200+ retail units, food court, cinema complex, and parking facilities. The design must comply with local building codes and sustainability standards.',
      category: 'architecture',
      country: 'Saudi Arabia',
      location: 'Jeddah, Corniche',
      status: 'rejected',
      client: { _id: 'c6', name: 'Khalid Al-Mansouri', email: 'khalid@example.com' },
      proposalsCount: 0,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      targetRoles: ['engineer', 'company'],
      requiredSkills: ['Architecture', 'Commercial Design', 'Large Scale Projects', 'Retail Design', 'Structural Engineering'],
      budget: 200000,
      deadline: new Date(Date.now() + 150 * 86400000).toISOString(),
    },
    {
      _id: '6',
      name: 'Residential Complex - Phase 2',
      title: 'Residential Complex - Phase 2',
      description: 'Second phase of a residential complex development including 100 units, landscaping, and community facilities. The project requires coordination with Phase 1 completion.',
      category: 'architecture',
      country: 'Saudi Arabia',
      location: 'Riyadh, King Fahd District',
      status: 'approved',
      client: { _id: 'c7', name: 'Omar Al-Rashid', email: 'omar@example.com' },
      proposalsCount: 3,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      targetRoles: ['engineer', 'company'],
      requiredSkills: ['Architecture', 'Urban Planning', 'Landscape Design', 'Project Management'],
      budget: 150000,
      deadline: new Date(Date.now() + 200 * 86400000).toISOString(),
    },
    {
      _id: '7',
      name: 'Office Building Structural Design',
      title: 'Office Building Structural Design',
      description: 'Structural engineering design for a 15-story office building with basement parking. The design must ensure seismic resistance and optimal material usage.',
      category: 'civil',
      country: 'UAE',
      location: 'Abu Dhabi, Al Markaziyah',
      status: 'published',
      client: { _id: 'c8', name: 'Layla Al-Mazrouei', email: 'layla@example.com' },
      proposalsCount: 7,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      targetRoles: ['engineer'],
      requiredSkills: ['Structural Engineering', 'Concrete Design', 'Steel Design', 'ETABS', 'SAP2000'],
      budget: 85000,
      deadline: new Date(Date.now() + 100 * 86400000).toISOString(),
    },
    {
      _id: '8',
      name: 'Restaurant Interior Design',
      title: 'Restaurant Interior Design',
      description: 'Modern restaurant interior design with open kitchen concept, bar area, and outdoor seating. The design should reflect Middle Eastern cuisine culture.',
      category: 'interior',
      country: 'Kuwait',
      location: 'Kuwait City, Salmiya',
      status: 'draft',
      client: { _id: 'c9', name: 'Noura Al-Sabah', email: 'noura@example.com' },
      proposalsCount: 0,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      targetRoles: ['engineer'],
      requiredSkills: ['Interior Design', 'Restaurant Design', '3D Visualization', 'Space Planning'],
      budget: 25000,
      deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
    },
    {
      _id: '9',
      name: 'Industrial Warehouse Design',
      title: 'Industrial Warehouse Design',
      description: 'Design and engineering for a large industrial warehouse facility including loading docks, storage areas, and administrative offices. The facility must support heavy machinery operations.',
      category: 'architecture',
      country: 'Saudi Arabia',
      location: 'Dammam, Industrial City',
      status: 'in_progress',
      client: { _id: 'c10', name: 'Youssef Al-Ghamdi', email: 'youssef@example.com' },
      assignedTo: { _id: 'e2', name: 'Industrial Design Group', type: 'company' },
      proposalsCount: 4,
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      targetRoles: ['company'],
      requiredSkills: ['Industrial Design', 'Warehouse Design', 'Logistics Planning', 'Structural Engineering'],
      budget: 95000,
      deadline: new Date(Date.now() + 90 * 86400000).toISOString(),
    },
    {
      _id: '10',
      name: 'Apartment Building Renovation',
      title: 'Apartment Building Renovation',
      description: 'Complete renovation of a 5-story apartment building including facade upgrade, common areas, and individual unit improvements. The project requires minimal disruption to residents.',
      category: 'interior',
      country: 'Egypt',
      location: 'Alexandria, Montazah',
      status: 'assigned',
      client: { _id: 'c11', name: 'Hassan Mostafa', email: 'hassan@example.com' },
      assignedTo: { _id: 'e3', name: 'Renovation Experts', type: 'engineer' },
      proposalsCount: 6,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      targetRoles: ['engineer'],
      requiredSkills: ['Renovation', 'Interior Design', 'Project Management', 'Residential Design'],
      budget: 65000,
      deadline: new Date(Date.now() + 75 * 86400000).toISOString(),
    },
  ];

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      // If filtering by pending (card or dropdown), use the pending endpoint
      if (statusFilter === 'pending') {
        try {
          const response = await http.get('/projects/pending', {
            params: { page: 1, limit: 100 }
          });
          let projectsData = response.data?.data || response.data?.projects || response.data || [];
          if (!Array.isArray(projectsData)) projectsData = [];
          // Normalize project IDs - ensure _id exists
          const normalizedProjects = projectsData.map((project: any) => ({
            ...project,
            _id: project._id || project.id,
          }));
          setProjects(normalizedProjects);
          return;
        } catch (err: any) {
          // If pending endpoint doesn't exist, fall back to regular endpoint
          console.warn('Pending endpoint not available, using regular endpoint');
        }
      }
      
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

  // Fetch statistics (تطابق أرقام الباك‌اند مع الكاردات)
  const fetchStatistics = async () => {
    try {
      const response = await http.get('/projects/statistics');
      const data = response.data?.data || response.data || {};
      // الباك‌اند يعيد: pendingReviewCount, activeCount, assignedCount, rejectedArchivedCount أو القيم القديمة
      const pendingReview = Number(data.pendingReviewCount ?? (data.draft ?? 0) + (data.pendingReview ?? 0));
      const active = Number(data.activeCount ?? data.waitingForEngineers ?? 0);
      const assigned = Number(data.assignedCount ?? data.inProgress ?? 0);
      const rejected = Number(data.rejectedArchivedCount ?? (data.rejected ?? 0) + (data.cancelled ?? 0));
      const total = Number(data.total ?? 0);
      setStatistics({
        pendingReview,
        active,
        assigned,
        rejected,
        total,
      });
    } catch (error: any) {
      // Fallback: احسب من قائمة المشاريع المحمّلة
      const statusNorm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '_');
      const pendingReview = projects.filter(p => ['pending_review', 'draft', 'pending review'].includes(statusNorm(p.status))).length;
      const active = projects.filter(p => ['waitingforengineers', 'waiting_for_engineers', 'approved', 'published'].includes(statusNorm(p.status))).length;
      const assigned = projects.filter(p => ['in_progress', 'in progress', 'assigned'].includes(statusNorm(p.status))).length;
      const rejected = projects.filter(p => ['rejected', 'archived', 'cancelled'].includes(statusNorm(p.status))).length;
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

  // Approve project
  const approveProject = async (projectId: string) => {
    if (!projectId) {
      toast.error(language === 'en' ? 'Invalid project ID' : 'معرف المشروع غير صحيح');
      return;
    }
    try {
      const response = await http.patch(`/projects/${projectId}/approve`);
      toast.success(language === 'en' ? 'Project approved successfully' : 'تم الموافقة على المشروع بنجاح');
      fetchProjects();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error approving project:', error);
      const errorMessage = error.response?.data?.message || (language === 'en' ? 'Failed to approve project' : 'فشل الموافقة على المشروع');
      toast.error(errorMessage);
    }
  };

  // Open reject dialog
  const openRejectDialog = (projectId: string) => {
    if (!projectId) {
      toast.error(language === 'en' ? 'Invalid project ID' : 'معرف المشروع غير صحيح');
      return;
    }
    setSelectedProjectId(projectId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  // Reject project
  const rejectProject = async () => {
    if (!selectedProjectId) return;
    
    if (!rejectionReason.trim()) {
      toast.error(language === 'en' ? 'Please provide a rejection reason' : 'يرجى إدخال سبب الرفض');
      return;
    }
    
    try {
      const response = await http.patch(`/projects/${selectedProjectId}/reject`, {
        rejectionReason: rejectionReason.trim()
      });
      toast.success(language === 'en' ? 'Project rejected' : 'تم رفض المشروع');
      setRejectDialogOpen(false);
      setSelectedProjectId(null);
      setRejectionReason('');
      fetchProjects();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error rejecting project:', error);
      const errorMessage = error.response?.data?.message || (language === 'en' ? 'Failed to reject project' : 'فشل رفض المشروع');
      toast.error(errorMessage);
    }
  };

  // Hard delete project
  const handleHardDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      setHardDeleting(true);
      await http.delete(`/projects/${projectToDelete.id}/hard`);
      toast.success(language === 'en' ? 'Project deleted permanently' : 'تم حذف المشروع نهائياً');
      setHardDeleteDialogOpen(false);
      setProjectToDelete(null);
      fetchProjects();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error hard deleting project:', error);
      const errorMessage = error.response?.data?.message || (language === 'en' ? 'Failed to delete project' : 'فشل حذف المشروع');
      toast.error(errorMessage);
    } finally {
      setHardDeleting(false);
    }
  };

  // Open hard delete dialog
  const openHardDeleteDialog = (project: Project) => {
    const projectId = getProjectId(project);
    if (!projectId) {
      toast.error(language === 'en' ? 'Invalid project ID' : 'معرف المشروع غير صحيح');
      return;
    }
    const projectName = project.name || project.title || '';
    setProjectToDelete({ id: projectId, name: projectName });
    setHardDeleteDialogOpen(true);
  };

  // Cancel project
  const handleCancelProject = async () => {
    if (!projectToCancel) return;
    
    try {
      setCancelling(true);
      await http.patch(`/projects/${projectToCancel.id}/cancel`);
      toast.success(language === 'en' ? 'Project cancelled successfully' : 'تم إلغاء المشروع بنجاح');
      setCancelDialogOpen(false);
      setProjectToCancel(null);
      fetchProjects();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error cancelling project:', error);
      const errorMessage = error.response?.data?.message || (language === 'en' ? 'Failed to cancel project' : 'فشل إلغاء المشروع');
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  // Open cancel dialog
  // const openCancelDialog = (project: Project) => {
  //   const projectId = getProjectId(project);
  //   if (!projectId) {
  //     toast.error(language === 'en' ? 'Invalid project ID' : 'معرف المشروع غير صحيح');
  //     return;
  //   }
  //   const projectName = project.name || project.title || '';
  //   setProjectToCancel({ id: projectId, name: projectName });
  //   setCancelDialogOpen(true);
  // };

  // Duplicate project
  const handleDuplicate = async (projectId: string) => {
    if (!projectId) {
      toast.error(language === 'en' ? 'Invalid project ID' : 'معرف المشروع غير صحيح');
      return;
    }
    try {
      setDuplicating(projectId);
      const response = await http.post(`/projects/${projectId}/duplicate`);
      toast.success(language === 'en' ? 'Project duplicated successfully' : 'تم نسخ المشروع بنجاح');
      fetchProjects();
      fetchStatistics();
      
      // Navigate to the duplicated project if available
      const duplicatedId = response.data?.data?._id || response.data?.data?.id;
      if (duplicatedId) {
        navigate(`/admin/projects/${duplicatedId}`);
      }
    } catch (error: any) {
      console.error('Error duplicating project:', error);
      const errorMessage = error.response?.data?.message || (language === 'en' ? 'Failed to duplicate project' : 'فشل نسخ المشروع');
      toast.error(errorMessage);
    } finally {
      setDuplicating(null);
    }
  };

  // Open cancel dialog
  // const openCancelDialog = (project: Project) => {
  //   const projectId = getProjectId(project);
  //   if (!projectId) {
  //     toast.error(language === 'en' ? 'Invalid project ID' : 'معرف المشروع غير صحيح');
  //     return;
  //   }
  //   const projectName = project.name || project.title || '';
  //   setProjectToCancel({ id: projectId, name: projectName });
  //   setCancelDialogOpen(true);
  // };

  // Cancel project
  // const handleCancelProject = async () => {
  //   if (!projectToCancel) return;
    
  //   try {
  //     setCancelling(true);
  //     await http.patch(`/projects/${projectToCancel.id}/cancel`);
  //     toast.success(language === 'en' ? 'Project cancelled successfully' : 'تم إلغاء المشروع بنجاح');
  //     setCancelDialogOpen(false);
  //     setProjectToCancel(null);
  //     fetchProjects();
  //     fetchStatistics();
  //   } catch (error: any) {
  //     console.error('Error cancelling project:', error);
  //     const errorMessage = error.response?.data?.message || (language === 'en' ? 'Failed to cancel project' : 'فشل إلغاء المشروع');
  //     toast.error(errorMessage);
  //   } finally {
  //     setCancelling(false);
  //   }
  // };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

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
        // Check for pending review status (both old and new formats)
        const isPending = project.status === 'Pending Review' ||
                         project.status === 'pending_review' ||
                         project.status === 'draft' ||
                         project.adminApproval?.status === 'pending';
        if (!isPending) return false;
      } else if (statusFilter === 'active') {
        const isActive = project.status === 'approved' || project.status === 'published';
        if (!isActive) return false;
      } else if (statusFilter === 'assigned_in_progress') {
        const isAssignedOrInProgress = project.status === 'assigned' || project.status === 'in_progress';
        if (!isAssignedOrInProgress) return false;
      } else if (statusFilter === 'rejected_archived') {
        const isRejectedOrArchived = project.status === 'rejected' || project.status === 'archived';
        if (!isRejectedOrArchived) return false;
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
      'Draft': {
        label: { en: 'Draft', ar: 'مسودة' },
        className: 'bg-gray-500/20 text-gray-500'
      },
      'Pending Review': {
        label: { en: 'Pending Review', ar: 'في انتظار المراجعة' },
        className: 'bg-yellow-500/20 text-yellow-500'
      },
      'Waiting for Engineers': {
        label: { en: 'Waiting for Engineers', ar: 'في انتظار المهندسين' },
        className: 'bg-green-500/20 text-green-500'
      },
      'In Progress': {
        label: { en: 'In Progress', ar: 'قيد التنفيذ' },
        className: 'bg-blue-500/20 text-blue-500'
      },
      'Completed': {
        label: { en: 'Completed', ar: 'مكتمل' },
        className: 'bg-green-500/20 text-green-500'
      },
      'Cancelled': {
        label: { en: 'Cancelled', ar: 'ملغي' },
        className: 'bg-gray-500/20 text-gray-500'
      },
      'Rejected': {
        label: { en: 'Rejected', ar: 'مرفوض' },
        className: 'bg-red-500/20 text-red-500'
      },
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

    const statusInfo = statusMap[status] || statusMap['Pending Review'];
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

          {/* Statistics Cards - clickable to filter list */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card
              className={`glass-card cursor-pointer transition-all hover:ring-2 hover:ring-yellow-500/50 ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
            >
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

            <Card
              className={`glass-card cursor-pointer transition-all hover:ring-2 hover:ring-green-500/50 ${statusFilter === 'active' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
            >
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

            <Card
              className={`glass-card cursor-pointer transition-all hover:ring-2 hover:ring-cyan/50 ${statusFilter === 'assigned_in_progress' ? 'ring-2 ring-cyan' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'assigned_in_progress' ? 'all' : 'assigned_in_progress')}
            >
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

            <Card
              className={`glass-card cursor-pointer transition-all hover:ring-2 hover:ring-red-500/50 ${statusFilter === 'rejected_archived' ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'rejected_archived' ? 'all' : 'rejected_archived')}
            >
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
                      {filteredProjects.map((project, index) => {
                        const projectId = getProjectId(project);
                        const projectName = project.name || project.title || '';
                        const clientName = project.client?.name || 'N/A';
                        const proposalsCount = project.proposalsCount || 0;
                        
                        return (
                          <tr key={projectId || `project-${index}`} className="border-b border-border/50 hover:bg-muted/30">
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => projectId && navigate(`/admin/projects/${projectId}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    {language === 'en' ? 'View' : 'عرض'}
                                  </DropdownMenuItem>
                                  
                                  {/* Show Approve/Reject buttons for pending projects */}
                                  {(project.status === 'Pending Review' || 
                                    project.status === 'pending_review' || 
                                    project.status === 'Draft' ||
                                    project.adminApproval?.status === 'pending') && (
                                    <>
                                      <DropdownMenuItem onClick={() => projectId && approveProject(projectId)}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        {language === 'en' ? 'Approve' : 'موافقة'}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => projectId && openRejectDialog(projectId)}>
                                        <X className="h-4 w-4 mr-2" />
                                        {language === 'en' ? 'Reject' : 'رفض'}
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  
                                  {/* Show Cancel button for active projects (not completed or cancelled) */}
                                  {project.status !== 'Completed' && 
                                   project.status !== 'completed' &&
                                   project.status !== 'Cancelled' &&
                                   project.status !== 'cancelled' && (
                                    <DropdownMenuItem onClick={() => openCancelDialog(project)}>
                                      <X className="h-4 w-4 mr-2" />
                                      {language === 'en' ? 'Cancel Project' : 'إلغاء المشروع'}
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {projectId && (
                                    <DropdownMenuItem 
                                      onClick={() => navigate(`/admin/projects/${projectId}/proposals`)}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      {language === 'en' ? 'Proposals' : 'العروض'}
                                      {proposalsCount !== undefined && proposalsCount > 0 && (
                                        <span className="ml-1 text-xs">({proposalsCount})</span>
                                      )}
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {projectId && (
                                    <DropdownMenuItem 
                                      onClick={() => handleDuplicate(projectId)}
                                      disabled={duplicating === projectId}
                                    >
                                      {duplicating === projectId ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Copy className="h-4 w-4 mr-2" />
                                      )}
                                      {language === 'en' ? 'Duplicate' : 'نسخ المشروع'}
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {projectId && (
                                    <DropdownMenuItem 
                                      onClick={() => openHardDeleteDialog(project)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {language === 'en' ? 'Hard Delete' : 'حذف نهائي'}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
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

      {/* Reject Project Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Reject Project' : 'رفض المشروع'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Please provide a reason for rejecting this project. The client will see this reason.'
                : 'يرجى إدخال سبب رفض هذا المشروع. العميل سيرى هذا السبب.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">
                {language === 'en' ? 'Rejection Reason' : 'سبب الرفض'} *
              </Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={language === 'en' 
                  ? 'Enter the reason for rejection...' 
                  : 'أدخل سبب الرفض...'}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
                setSelectedProjectId(null);
              }}
            >
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button
              variant="destructive"
              onClick={rejectProject}
              disabled={!rejectionReason.trim()}
            >
              {language === 'en' ? 'Reject Project' : 'رفض المشروع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hard Delete Dialog */}
      <Dialog open={hardDeleteDialogOpen} onOpenChange={setHardDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {language === 'en' ? '⚠️ Hard Delete Project' : '⚠️ حذف نهائي للمشروع'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'This action cannot be undone. The project will be permanently deleted from the database.'
                : 'لا يمكن التراجع عن هذا الإجراء. سيتم حذف المشروع نهائياً من قاعدة البيانات.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive">
                {language === 'en' 
                  ? `Are you sure you want to permanently delete "${projectToDelete?.name}"?`
                  : `هل أنت متأكد من حذف "${projectToDelete?.name}" نهائياً؟`}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {language === 'en' 
                  ? '⚠️ This action cannot be undone. All project data will be lost permanently.'
                  : '⚠️ لا يمكن التراجع عن هذا الإجراء. سيتم فقدان جميع بيانات المشروع نهائياً.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setHardDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              disabled={hardDeleting}
            >
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleHardDelete}
              disabled={hardDeleting}
            >
              {hardDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'en' ? 'Deleting...' : 'جاري الحذف...'}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Delete Permanently' : 'حذف نهائي'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Project Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Cancel Project' : 'إلغاء المشروع'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? `Are you sure you want to cancel "${projectToCancel?.name}"? This action cannot be undone.`
                : `هل أنت متأكد من إلغاء "${projectToCancel?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setProjectToCancel(null);
              }}
              disabled={cancelling}
            >
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelProject}
              disabled={cancelling}
            >
              {cancelling 
                ? (language === 'en' ? 'Cancelling...' : 'جاري الإلغاء...')
                : (language === 'en' ? 'Confirm Cancel' : 'تأكيد الإلغاء')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
