import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, MessageSquare, Star, Edit, Trash2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { http } from "@/services/http";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteProposal } from "@/services/proposal.service";

const CompanyProjects = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

          // Fetch company's proposals
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const response = await http.get("/proposals/my");
        // Handle different response structures
        let proposalsData = response.data;
        
        // If response.data is an object with a data property
        if (proposalsData && typeof proposalsData === 'object' && !Array.isArray(proposalsData)) {
          proposalsData = proposalsData.data || proposalsData.proposals || [];
        }
        
        // Ensure it's always an array
        if (!Array.isArray(proposalsData)) {
          console.warn("Proposals data is not an array:", proposalsData);
          proposalsData = [];
        }
        
        setProposals(proposalsData);
      } catch (error: any) {
        console.error("Error fetching proposals:", error);
        
        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          const backendMessage = error.response?.data?.message || "";
          
          // Check the reason for 403
          if (backendMessage.toLowerCase().includes('engineer') || 
              backendMessage.toLowerCase().includes('مهندسين') ||
              backendMessage.toLowerCase().includes('role')) {
            toast.error(
              language === "en" 
                ? "Access denied. Company account required." 
                : "تم الرفض. يلزم حساب شركة."
            );
            // Redirect to login after delay
            setTimeout(() => {
              localStorage.removeItem("token");
              window.location.href = '/company/login';
            }, 2000);
          } else if (backendMessage.toLowerCase().includes('active') || 
                     backendMessage.toLowerCase().includes('مفعّل')) {
            toast.error(
              language === "en" 
                ? "Your account is not activated. Please contact the administration." 
                : "حسابك غير مفعّل. يرجى التواصل مع الإدارة."
            );
          } else {
            toast.error(
              language === "en" 
                ? "Access denied. You don't have permission to view proposals." 
                : "تم الرفض. ليس لديك صلاحية لعرض العروض."
            );
          }
          // Set empty array to show empty state
          setProposals([]);
        } 
        // Don't show error toast for 404, as user might not have proposals yet
        else if (error.response?.status !== 404) {
          toast.error(
            language === "en" ? "Failed to load proposals" : "فشل تحميل العروض"
          );
          // Set empty array on error
          setProposals([]);
        } else {
          // 404 is expected - user might not have proposals yet
          setProposals([]);
        }
        setProposals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [language]);

  // Map proposal status to project status
  const mapProposalStatusToProjectStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "waitingForAdminDecision",
      accepted: "inProgress",
      rejected: "waitingForAdminDecision",
      completed: "completed",
    };
    return statusMap[status] || "waitingForAdminDecision";
  };

  const handleDeleteClick = (proposalId: string) => {
    setProposalToDelete(proposalId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!proposalToDelete) return;
    
    try {
      setDeleting(true);
      await deleteProposal(proposalToDelete);
      toast.success(language === "en" ? "Proposal deleted successfully" : "تم حذف العرض بنجاح");
      
      // Remove proposal from list
      setProposals(proposals.filter(p => p._id !== proposalToDelete));
      
      setDeleteDialogOpen(false);
      setProposalToDelete(null);
    } catch (error: any) {
      console.error("Error deleting proposal:", error);
      const errorMessage = error.response?.data?.message || 
        (language === "en" ? "Failed to delete proposal" : "فشل حذف العرض");
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const canEditProposal = (proposal: any) => {
    if (proposal.status !== "pending") return false;
    
    if (!proposal.createdAt) return false; // Backend will handle validation
    
    const createdAt = new Date(proposal.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff < 1;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      waitingForAdminDecision: {
        label: getDashboardText("waitingForAdminDecision", language),
        variant: "outline",
      },
      inProgress: { label: getDashboardText("inProgress", language), variant: "default" },
      completed: { label: getDashboardText("completed", language), variant: "default" },
      pending: {
        label: language === "en" ? "Pending" : "قيد الانتظار",
        variant: "outline",
      },
      accepted: {
        label: language === "en" ? "Accepted" : "مقبول",
        variant: "default",
      },
      rejected: {
        label: language === "en" ? "Rejected" : "مرفوض",
        variant: "destructive",
      },
    };
    const statusInfo = statusMap[status] || statusMap.waitingForAdminDecision;
    return (
      <Badge variant={statusInfo.variant} className="bg-hexa-secondary/10 text-hexa-secondary border-hexa-secondary/20">
        {statusInfo.label}
      </Badge>
    );
  };

  // Transform proposals to projects format for display
  // Ensure proposals is always an array before mapping
  const projects = Array.isArray(proposals) 
    ? proposals.map((proposal) => ({
        id: proposal.project?._id || proposal.project,
        proposalId: proposal._id,
        title: proposal.project?.name || proposal.project?.title || "Unknown Project",
        category: proposal.project?.category || "N/A",
        location: proposal.project?.location || "N/A",
        status: mapProposalStatusToProjectStatus(proposal.status),
        proposalStatus: proposal.status,
        proposal: proposal,
        rating: proposal.rating,
        review: proposal.review,
        completedDate: proposal.completedDate,
      }))
    : [];

  const filteredProjects = activeTab === "all"
    ? projects
    : activeTab === "waitingForAdminDecision"
    ? projects.filter(p => p.proposalStatus === "pending")
    : activeTab === "inProgress"
    ? projects.filter(p => p.proposalStatus === "accepted")
    : activeTab === "completed"
    ? projects.filter(p => p.proposalStatus === "completed")
    : projects;

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/company/dashboard"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/company/dashboard");
                }}
              >
                {getDashboardText("dashboard", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("myProjects", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("myProjects", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Track and manage your projects" : "تتبع وإدارة مشاريعك"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-hexa-card border-hexa-border mb-6 gap-1 p-1">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light px-3 py-2 text-sm"
            >
              {language === "en" ? "All" : "الكل"}
            </TabsTrigger>
            <TabsTrigger 
              value="waitingForAdminDecision"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light px-3 py-2 text-sm"
            >
              {getDashboardText("waitingForAdminDecision", language)}
            </TabsTrigger>
            <TabsTrigger 
              value="inProgress"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light px-3 py-2 text-sm"
            >
              {getDashboardText("inProgress", language)}
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light px-3 py-2 text-sm"
            >
              {getDashboardText("completed", language)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="text-center py-12 text-hexa-text-light">
                {language === "en" ? "Loading proposals..." : "جاري تحميل العروض..."}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-hexa-text-light">
                {language === "en" ? "No proposals found" : "لا توجد عروض"}
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-xl hover:border-hexa-secondary/60 transition-all duration-300 bg-hexa-card border-hexa-border">
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      {/* Left Section - Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <CardTitle className="text-lg font-bold text-hexa-text-dark line-clamp-2 flex-1">{project.title}</CardTitle>
                          <div className="flex-shrink-0">
                            {getStatusBadge(project.proposalStatus || project.status)}
                          </div>
                        </div>
                        <CardDescription className="flex items-center gap-2 mb-4 text-hexa-text-light">
                          <MapPin className="w-4 h-4 text-hexa-secondary" />
                          {project.location}
                        </CardDescription>
                        {project.proposal && (
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-hexa-text-light">
                              {language === "en" ? "Budget:" : "الميزانية:"} {project.proposal.proposedBudget?.amount} {project.proposal.proposedBudget?.currency}
                            </p>
                            <p className="text-sm text-hexa-text-light">
                              {language === "en" ? "Timeline:" : "الجدول الزمني:"} {project.proposal.estimatedTimeline}
                            </p>
                          </div>
                        )}
                        {project.status === "completed" && project.rating && (
                          <div className="p-3 rounded-lg bg-hexa-bg border border-hexa-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(project.rating!)
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-hexa-text-light"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-hexa-text-dark">{project.rating}</span>
                            </div>
                            {project.review && (
                              <p className="text-xs text-hexa-text-light italic line-clamp-2">"{project.review}"</p>
                            )}
                            {project.completedDate && (
                              <p className="text-xs text-hexa-text-light mt-2">
                                {language === "en" ? `Completed: ${project.completedDate}` : `مكتمل: ${project.completedDate}`}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Right Section - Actions */}
                      <div className="flex flex-col justify-center gap-3 md:w-auto w-full md:border-s md:border-hexa-border md:ps-6 pt-4 md:pt-0 border-t md:border-t-0 border-hexa-border">
                        {project.proposalStatus === "pending" && project.proposal && (() => {
                          const canEdit = canEditProposal(project.proposal);
                          
                          return (
                            <>
                              {canEdit ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/company/projects/${project.id}/proposal`)}
                                  className="w-full md:w-auto border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary transition-all"
                                >
                                  <Edit className="w-4 h-4 ms-2" />
                                  {language === "en" ? "Edit Proposal" : "تعديل العرض"}
                                </Button>
                              ) : (
                                <div
                                  className="text-xs text-hexa-text-light text-center p-2 bg-hexa-bg rounded border border-hexa-border"
                                  title={language === "en" ? "Cannot edit proposal after 1 hour" : "لا يمكن تعديل العرض بعد مرور ساعة"}
                                >
                                  {language === "en" ? "Cannot edit after 1 hour" : "لا يمكن التعديل بعد ساعة"}
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(project.proposalId)}
                                className="w-full md:w-auto border-red-500/50 bg-hexa-bg text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4 ms-2" />
                                {language === "en" ? "Delete" : "حذف"}
                              </Button>
                            </>
                          );
                        })()}
                        {project.status === "inProgress" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/company/messages?project=${project.id}`)}
                            className="w-full md:w-auto border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary transition-all"
                            title={getDashboardText("chat", language)}
                          >
                            <MessageSquare className="w-4 h-4 ms-2" />
                            {getDashboardText("chat", language)}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === "en" ? "Delete Proposal" : "حذف العرض"}
            </DialogTitle>
            <DialogDescription>
              {language === "en" 
                ? "Are you sure you want to delete this proposal? This action cannot be undone."
                : "هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProposalToDelete(null);
              }}
              disabled={deleting}
            >
              {language === "en" ? "Cancel" : "إلغاء"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting 
                ? (language === "en" ? "Deleting..." : "جاري الحذف...")
                : (language === "en" ? "Delete" : "حذف")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CompanyProjects;

