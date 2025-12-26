import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Clock,
  User,
  DollarSign,
  Calendar,
  AlertCircle,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { Proposal, updateProposalStatus, deleteProposal } from '@/services/proposal.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminProjectProposals = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id; // Use id from URL params as projectId
  const { language } = useApp();
  const navigate = useNavigate();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projectLoading, setProjectLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [editFormData, setEditFormData] = useState({
    description: '',
    estimatedTimeline: '',
    proposedBudget: {
      amount: '',
      currency: 'SAR',
    },
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Redirect if projectId is missing
  useEffect(() => {
    if (!projectId) {
      console.error('ProjectId is missing from URL params');
      toast.error(language === 'en' ? 'Invalid project ID' : 'معرف المشروع غير صحيح');
      navigate('/admin/projects');
      return;
    }
  }, [projectId, navigate, language]);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setProjectLoading(false);
        return;
      }
      
      try {
        setProjectLoading(true);
        setError(null);
        const response = await http.get(`/projects/${projectId}`);
        const projectData = response.data?.data || response.data?.project || response.data;
        setProject(projectData);
      } catch (error: any) {
        console.error('Error fetching project:', error);
        const errorMessage = error.response?.data?.message || 
          (language === 'en' ? 'Failed to load project' : 'فشل تحميل المشروع');
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setProjectLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId, language]);

  // Fetch proposals
  const fetchProposals = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await http.get(`/proposals/project/${projectId}`);
      const proposalsData = response.data?.data || response.data?.proposals || response.data;
      const proposalsList = Array.isArray(proposalsData) ? proposalsData : [];
      setProposals(proposalsList);
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      const errorMessage = error.response?.data?.message || 
        (language === 'en' ? 'Failed to load proposals' : 'فشل تحميل العروض');
      setError(errorMessage);
      toast.error(errorMessage);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProposals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { label: { en: string; ar: string }; className: string }> = {
      pending: {
        label: { en: 'Pending', ar: 'قيد الانتظار' },
        className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      },
      reviewed: {
        label: { en: 'Reviewed', ar: 'تمت المراجعة' },
        className: 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      },
      accepted: {
        label: { en: 'Accepted', ar: 'مقبول' },
        className: 'bg-green-500/20 text-green-500 border-green-500/30'
      },
      rejected: {
        label: { en: 'Rejected', ar: 'مرفوض' },
        className: 'bg-red-500/20 text-red-500 border-red-500/30'
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.className}>
        {config.label[language as 'en' | 'ar']}
      </Badge>
    );
  };

  // Handle accept proposal
  const handleAcceptProposal = async (proposalId: string) => {
    try {
      setActionLoading(proposalId);
      await updateProposalStatus(proposalId, 'accepted');
      toast.success(language === 'en' ? 'Proposal accepted successfully' : 'تم قبول العرض بنجاح');
      await fetchProposals();
    } catch (error: any) {
      console.error('Error accepting proposal:', error);
      const errorMessage = error.response?.data?.message || error.message || 
        (language === 'en' ? 'Failed to accept proposal' : 'فشل قبول العرض');
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject proposal
  const handleRejectProposal = async (proposalId: string) => {
    try {
      setActionLoading(proposalId);
      await updateProposalStatus(proposalId, 'rejected');
      toast.success(language === 'en' ? 'Proposal rejected' : 'تم رفض العرض');
      await fetchProposals();
    } catch (error: any) {
      console.error('Error rejecting proposal:', error);
      const errorMessage = error.response?.data?.message || error.message || 
        (language === 'en' ? 'Failed to reject proposal' : 'فشل رفض العرض');
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle mark as reviewed
  const handleMarkAsReviewed = async (proposalId: string) => {
    try {
      setActionLoading(proposalId);
      await updateProposalStatus(proposalId, 'reviewed');
      toast.success(language === 'en' ? 'Proposal marked as reviewed' : 'تم وضع علامة مراجعة على العرض');
      await fetchProposals();
    } catch (error: any) {
      console.error('Error marking proposal as reviewed:', error);
      const errorMessage = error.response?.data?.message || error.message || 
        (language === 'en' ? 'Failed to update proposal' : 'فشل تحديث العرض');
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete proposal
  const handleDeleteProposal = async () => {
    if (!selectedProposal) return;
    try {
      setActionLoading(selectedProposal._id);
      await deleteProposal(selectedProposal._id);
      toast.success(language === 'en' ? 'Proposal deleted successfully' : 'تم حذف العرض بنجاح');
      setDeleteDialogOpen(false);
      setSelectedProposal(null);
      await fetchProposals();
    } catch (error: any) {
      console.error('Error deleting proposal:', error);
      const errorMessage = error.response?.data?.message || error.message || 
        (language === 'en' ? 'Failed to delete proposal' : 'فشل حذف العرض');
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit proposal
  const handleEditProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setEditFormData({
      description: proposal.description || '',
      estimatedTimeline: proposal.estimatedTimeline || '',
      proposedBudget: {
        amount: proposal.proposedBudget?.amount?.toString() || '',
        currency: proposal.proposedBudget?.currency || 'SAR',
      },
    });
    setEditDialogOpen(true);
  };

  // Handle save edited proposal
  const handleSaveEdit = async () => {
    if (!selectedProposal) return;
    try {
      setActionLoading(selectedProposal._id);
      await http.put(`/proposals/${selectedProposal._id}`, {
        description: editFormData.description,
        estimatedTimeline: editFormData.estimatedTimeline,
        proposedBudget: {
          amount: parseFloat(editFormData.proposedBudget.amount),
          currency: editFormData.proposedBudget.currency,
        },
      });
      toast.success(language === 'en' ? 'Proposal updated successfully' : 'تم تحديث العرض بنجاح');
      setEditDialogOpen(false);
      setSelectedProposal(null);
      await fetchProposals();
    } catch (error: any) {
      console.error('Error updating proposal:', error);
      const errorMessage = error.response?.data?.message || error.message || 
        (language === 'en' ? 'Failed to update proposal' : 'فشل تحديث العرض');
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Early return if projectId is missing
  if (!projectId) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1">
          <AdminTopBar />
          <main className="p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">
                  {language === 'en' ? 'Invalid Project ID' : 'معرف المشروع غير صحيح'}
                </p>
                <Button onClick={() => navigate('/admin/projects')}>
                  {language === 'en' ? 'Back to Projects' : 'العودة إلى المشاريع'}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const projectName = project?.name || project?.title || (projectLoading ? 'Loading...' : 'Project');
  const hasAcceptedProposal = proposals.some(p => p.status === 'accepted');

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminTopBar />
        
        <main className="p-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/admin/projects')}>
                  {language === 'en' ? 'Projects' : 'المشاريع'}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {language === 'en' ? 'Proposals' : 'العروض'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/projects')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Back to Projects' : 'العودة إلى المشاريع'}
              </Button>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {language === 'en' ? 'Project Proposals' : 'عروض المشروع'}
            </h2>
            <p className="text-muted-foreground">
              {projectLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === 'en' ? 'Loading project...' : 'جاري تحميل المشروع...'}
                </span>
              ) : (
                projectName
              )}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <Card className="glass-card border-red-500/30 bg-red-500/10 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-500">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Alert for Accepted Proposal */}
          {hasAcceptedProposal && (
            <Card className="glass-card border-blue-500/30 bg-blue-500/10 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-500">
                      {language === 'en' 
                        ? 'This project has an accepted proposal and is now In Progress' 
                        : 'هذا المشروع لديه عرض مقبول وهو الآن قيد التنفيذ'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proposals List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Proposals' : 'العروض'} ({proposals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan" />
                  <span className="ml-3 text-muted-foreground">
                    {language === 'en' ? 'Loading proposals...' : 'جاري تحميل العروض...'}
                  </span>
                </div>
              ) : error && proposals.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button variant="outline" onClick={fetchProposals}>
                    {language === 'en' ? 'Retry' : 'إعادة المحاولة'}
                  </Button>
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {language === 'en' ? 'No proposals found' : 'لا توجد عروض'}
                  </p>
                  <p className="text-sm">
                    {language === 'en' 
                      ? 'No proposals have been submitted for this project yet.' 
                      : 'لم يتم تقديم أي عروض لهذا المشروع بعد.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal, index) => {
                    const engineer = proposal.engineer;
                    const proposalId = proposal._id || proposal.id || `proposal-${index}`;
                    const isAccepted = proposal.status === 'accepted';
                    const isLoading = actionLoading === proposalId;
                    const canTakeAction = proposal.status === 'pending' || proposal.status === 'reviewed';

                    return (
                      <Card key={proposalId} className="glass-card">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={engineer?.avatar} />
                                <AvatarFallback>
                                  {engineer?.name?.charAt(0)?.toUpperCase() || 'E'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">
                                    {engineer?.name || language === 'en' ? 'Unknown Engineer' : 'مهندس غير معروف'}
                                  </h3>
                                  {engineer?.email && (
                                    <span className="text-sm text-muted-foreground">
                                      ({engineer.email})
                                    </span>
                                  )}
                                </div>
                                <StatusBadge status={proposal.status} />
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(proposal.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Description */}
                            <div>
                              <p className="text-sm font-medium mb-2 text-muted-foreground">
                                {language === 'en' ? 'Description' : 'الوصف'}
                              </p>
                              <p className="text-sm">{proposal.description}</p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {language === 'en' ? 'Proposed Budget' : 'الميزانية المقترحة'}
                                  </p>
                                  <p className="font-semibold">
                                    {proposal.proposedBudget?.amount?.toLocaleString() || 'N/A'} {proposal.proposedBudget?.currency || 'SAR'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {language === 'en' ? 'Estimated Timeline' : 'الجدول الزمني المقدر'}
                                  </p>
                                  <p className="font-semibold">
                                    {proposal.estimatedTimeline || language === 'en' ? 'N/A' : 'غير متوفر'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {language === 'en' ? 'Created At' : 'تاريخ الإنشاء'}
                                  </p>
                                  <p className="font-semibold text-sm">
                                    {new Date(proposal.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Relevant Experience */}
                            {proposal.relevantExperience && (
                              <div>
                                <p className="text-sm font-medium mb-2 text-muted-foreground">
                                  {language === 'en' ? 'Relevant Experience' : 'الخبرة ذات الصلة'}
                                </p>
                                <p className="text-sm">{proposal.relevantExperience}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t">
                              {isAccepted ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span>
                                    {language === 'en' 
                                      ? 'This proposal has been accepted and the project is now In Progress' 
                                      : 'تم قبول هذا العرض والمشروع الآن قيد التنفيذ'}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  {canTakeAction && (
                                    <>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleAcceptProposal(proposalId)}
                                        disabled={isLoading || hasAcceptedProposal}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        {isLoading && actionLoading === proposalId ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        {language === 'en' ? 'Accept Proposal' : 'قبول العرض'}
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRejectProposal(proposalId)}
                                        disabled={isLoading}
                                      >
                                        {isLoading && actionLoading === proposalId ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <XCircle className="h-4 w-4 mr-2" />
                                        )}
                                        {language === 'en' ? 'Reject Proposal' : 'رفض العرض'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMarkAsReviewed(proposalId)}
                                        disabled={isLoading || proposal.status === 'reviewed'}
                                      >
                                        {isLoading && actionLoading === proposalId ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Eye className="h-4 w-4 mr-2" />
                                        )}
                                        {language === 'en' ? 'Mark as Reviewed' : 'وضع علامة مراجعة'}
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditProposal(proposal)}
                                    disabled={isLoading}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {language === 'en' ? 'Edit' : 'تعديل'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedProposal(proposal);
                                      setDeleteDialogOpen(true);
                                    }}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {language === 'en' ? 'Delete' : 'حذف'}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Delete Proposal' : 'حذف العرض'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? 'Are you sure you want to delete this proposal? This action cannot be undone.' 
                : 'هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProposal}
              className="bg-red-600 hover:bg-red-700"
            >
              {language === 'en' ? 'Delete' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Proposal Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Edit Proposal' : 'تعديل العرض'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Update the proposal details below.' 
                : 'قم بتحديث تفاصيل العرض أدناه.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                {language === 'en' ? 'Description' : 'الوصف'}
              </Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">
                {language === 'en' ? 'Estimated Timeline' : 'الجدول الزمني المقدر'}
              </Label>
              <Input
                id="timeline"
                value={editFormData.estimatedTimeline}
                onChange={(e) => setEditFormData({ ...editFormData, estimatedTimeline: e.target.value })}
                placeholder={language === 'en' ? 'e.g., 3 months' : 'مثال: 3 أشهر'}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  {language === 'en' ? 'Budget Amount' : 'مبلغ الميزانية'}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={editFormData.proposedBudget.amount}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    proposedBudget: { ...editFormData.proposedBudget, amount: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">
                  {language === 'en' ? 'Currency' : 'العملة'}
                </Label>
                <Input
                  id="currency"
                  value={editFormData.proposedBudget.currency}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    proposedBudget: { ...editFormData.proposedBudget, currency: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setSelectedProposal(null);
              }}
            >
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={actionLoading === selectedProposal?._id}
            >
              {actionLoading === selectedProposal?._id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'en' ? 'Saving...' : 'جاري الحفظ...'}
                </>
              ) : (
                language === 'en' ? 'Save Changes' : 'حفظ التغييرات'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjectProposals;

