import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, FileText, Download } from "lucide-react";
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
import { projectsApi } from "@/services/projectsApi";

const CompanyProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [canSubmitProposal, setCanSubmitProposal] = useState(false);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projectData = await projectsApi.getProjectById(id);
        
        // Format deadline if it's a date
        let formattedDeadline = "";
        if (projectData.deadline) {
          try {
            const deadlineDate = new Date(projectData.deadline);
            if (!isNaN(deadlineDate.getTime())) {
              formattedDeadline = deadlineDate.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              });
            } else {
              formattedDeadline = projectData.deadline;
            }
          } catch (e) {
            formattedDeadline = projectData.deadline;
          }
        }
        
        // Transform project data to match expected format
        setProject({
          id: projectData._id || projectData.id || id,
          title: projectData.title || projectData.name || "Unknown Project",
          category: projectData.category || projectData.projectType || "N/A",
          location: projectData.location || 
            (projectData.city && projectData.country ? `${projectData.city}, ${projectData.country}` : 
             projectData.city || projectData.country || "N/A"),
          description: projectData.description || "",
          requirements: projectData.requirements || projectData.requirement || "",
          deadline: formattedDeadline,
          files: projectData.attachments || [],
          status: projectData.status,
          projectType: projectData.projectType,
          budget: projectData.budget,
          tags: projectData.tags || [],
          isActive: projectData.isActive,
          adminApproval: projectData.adminApproval || projectData.admin_approval,
        });
      } catch (error: any) {
        console.error("Error fetching project:", error);
        toast.error(
          language === "en" ? "Failed to load project details" : "فشل تحميل تفاصيل المشروع"
        );
        // Fallback to basic data if API fails
        setProject({
          id: id,
          title: "Unknown Project",
          category: "N/A",
          location: "N/A",
          description: "",
          requirements: "",
          deadline: "",
          files: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, language]);

  // Fetch proposals for this project
  useEffect(() => {
    const fetchProposals = async () => {
      if (!id) return;
      try {
        setProposalsLoading(true);
        const response = await http.get(`/proposals/project/${id}`);
        
        // Handle different response structures
        let proposalsData = response.data;
        
        if (proposalsData && typeof proposalsData === 'object' && !Array.isArray(proposalsData)) {
          if (proposalsData.data && Array.isArray(proposalsData.data)) {
            proposalsData = proposalsData.data;
          } else if (proposalsData.proposals && Array.isArray(proposalsData.proposals)) {
            proposalsData = proposalsData.proposals;
          } else if (proposalsData.items && Array.isArray(proposalsData.items)) {
            proposalsData = proposalsData.items;
          } else {
            proposalsData = [];
          }
        }
        
        if (!Array.isArray(proposalsData)) {
          proposalsData = [];
        }
        
        setProposals(proposalsData);
        
        // Check if company can submit proposal (no existing proposal from this company)
        const userDataStr = localStorage.getItem('user');
        let userData = null;
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr);
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
        
        const companyId = userData?._id || userData?.id;
        const hasCompanyProposal = proposalsData.some((p: any) => {
          const proposalCompanyId = p.company?._id || p.company || p.engineer?._id || p.engineer;
          return proposalCompanyId === companyId;
        });
        
        setCanSubmitProposal(!hasCompanyProposal);
      } catch (error: any) {
        console.error("Error fetching proposals:", error);
        if (error.response?.status !== 404) {
          toast.error(
            language === "en" ? "Failed to load proposals" : "فشل تحميل العروض"
          );
        }
        setProposals([]);
        setCanSubmitProposal(true);
      } finally {
        setProposalsLoading(false);
      }
    };
    fetchProposals();
  }, [id, language]);

  if (loading || !project) {
    return (
      <DashboardLayout userType="company">
        <div className="text-center py-12 text-hexa-text-light">
          {language === "en" ? "Loading project..." : "جاري تحميل المشروع..."}
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      "Pending Review": { label: getDashboardText("pendingReview", language), variant: "outline" },
      "Waiting for Engineers": { label: getDashboardText("waitingForEngineers", language), variant: "secondary" },
      "In Progress": { label: getDashboardText("inProgress", language), variant: "default" },
      "Completed": { label: getDashboardText("completed", language), variant: "default" },
    };
    const normalizedStatus = status || "Pending Review";
    const statusInfo = statusMap[normalizedStatus] || statusMap["Pending Review"];
    
    return (
      <Badge variant={statusInfo.variant} className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
        {statusInfo.label}
      </Badge>
    );
  };

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
              <BreadcrumbLink
                href="/company/available-projects"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/company/available-projects");
                }}
              >
                {getDashboardText("browseProjects", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {project.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/company/available-projects")}
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-hexa-text-dark">{project.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              {getStatusBadge(project.status)}
              <span className="text-sm text-hexa-text-light flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {project.location}
              </span>
            </div>
          </div>
          {(() => {
            // Check if submit button should be shown
            const status = project.status?.toLowerCase() || "";
            const isWaitingForEngineers = 
              status === "waiting for engineers" || 
              status === "waiting_for_engineers" ||
              status === "waitingforengineers" ||
              status === "published" ||
              status === "approved";
            
            const adminApprovalStatus = project.adminApproval?.status?.toLowerCase() || 
              project.adminApproval?.toLowerCase() || "";
            const isApproved = adminApprovalStatus === "approved" || adminApprovalStatus === "accept" || adminApprovalStatus === "";
            
            const shouldShowSubmit = isWaitingForEngineers && isApproved && canSubmitProposal;
            
            if (!shouldShowSubmit) return null;
            
            return (
              <Button
                onClick={() => navigate(`/company/projects/${project.id}/proposal`)}
                className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold"
              >
                <FileText className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                {getDashboardText("submitProposal", language)}
              </Button>
            );
          })()}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-hexa-card border-hexa-border">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {getDashboardText("overview", language)}
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {getDashboardText("filesAttachments", language)}
            </TabsTrigger>
            <TabsTrigger
              value="proposals"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {language === "en" ? "Proposals" : "العروض"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark">
                  {language === "en" ? "Project Information" : "معلومات المشروع"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">
                    {getDashboardText("category", language)}
                  </p>
                  <Badge variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border">
                    {project.category}
                  </Badge>
                </div>
                {project.description && (
                  <div>
                    <p className="text-sm text-hexa-text-light mb-2">
                      {language === "en" ? "Description" : "الوصف"}
                    </p>
                    <p className="text-hexa-text-dark">
                      {project.description}
                    </p>
                  </div>
                )}
                {project.requirements && (
                  <div>
                    <p className="text-sm text-hexa-text-light mb-2">
                      {language === "en" ? "Requirements" : "المتطلبات"}
                    </p>
                    <p className="text-hexa-text-dark">
                      {project.requirements}
                    </p>
                  </div>
                )}
                {project.deadline && (
                  <div>
                    <p className="text-sm text-hexa-text-light mb-2">
                      {language === "en" ? "Expected Deadline" : "الموعد المتوقع"}
                    </p>
                    <p className="font-medium text-hexa-text-dark">{project.deadline}</p>
                  </div>
                )}
                {project.budget && (
                  <div>
                    <p className="text-sm text-hexa-text-light mb-2">
                      {language === "en" ? "Budget" : "الميزانية"}
                    </p>
                    <p className="font-medium text-hexa-text-dark">
                      {project.budget.min && project.budget.max 
                        ? `${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()} ${project.budget.currency || 'SAR'}`
                        : project.budget.amount 
                        ? `${project.budget.amount.toLocaleString()} ${project.budget.currency || 'SAR'}`
                        : language === "en" ? "Not specified" : "غير محدد"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark">
                  {getDashboardText("filesAttachments", language)}
                </CardTitle>
                <CardDescription className="text-hexa-text-light">
                  {language === "en" ? "Download project files and documents" : "تحميل ملفات ومستندات المشروع"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.files && project.files.length > 0 ? (
                  <div className="space-y-3">
                    {project.files.map((file: any, idx: number) => {
                      const fileUrl = file.url || file.path;
                      const fileName = file.name || file.filename || `File ${idx + 1}`;
                      const fileSize = file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "";
                      const fileDate = file.uploadedAt || file.createdAt || "";
                      
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 border border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-hexa-secondary/20 rounded-lg">
                              <FileText className="w-5 h-5 text-hexa-secondary" />
                            </div>
                            <div>
                              <p className="font-medium text-hexa-text-dark">{fileName}</p>
                              {(fileSize || fileDate) && (
                                <p className="text-sm text-hexa-text-light">
                                  {fileSize} {fileSize && fileDate ? "•" : ""} {fileDate ? new Date(fileDate).toLocaleDateString() : ""}
                                </p>
                              )}
                            </div>
                          </div>
                          {fileUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(fileUrl, '_blank')}
                              className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
                            >
                              <Download className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                              {language === "en" ? "Download" : "تحميل"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-hexa-text-light">
                    {language === "en" ? "No files available" : "لا توجد ملفات متاحة"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-4">
            {proposalsLoading ? (
              <Card className="bg-hexa-card border-hexa-border">
                <CardContent className="py-12 text-center text-hexa-text-light">
                  {language === "en" ? "Loading proposals..." : "جاري تحميل العروض..."}
                </CardContent>
              </Card>
            ) : proposals.length === 0 ? (
              <Card className="bg-hexa-card border-hexa-border">
                <CardContent className="py-12 text-center text-hexa-text-light">
                  {language === "en" ? "No proposals found for this project" : "لا توجد عروض لهذا المشروع"}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <Card key={proposal._id} className="bg-hexa-card border-hexa-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-hexa-text-dark">
                            {language === "en" ? "Proposal Details" : "تفاصيل العرض"}
                          </CardTitle>
                          <CardDescription className="text-hexa-text-light mt-1">
                            {language === "en" ? "Status:" : "الحالة:"}{" "}
                            <Badge
                              variant={
                                proposal.status === "accepted"
                                  ? "default"
                                  : proposal.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="ml-2"
                            >
                              {proposal.status === "pending"
                                ? language === "en"
                                  ? "Pending"
                                  : "قيد الانتظار"
                                : proposal.status === "accepted"
                                ? language === "en"
                                  ? "Accepted"
                                  : "مقبول"
                                : proposal.status === "rejected"
                                ? language === "en"
                                  ? "Rejected"
                                  : "مرفوض"
                                : proposal.status}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {proposal.description && (
                        <div>
                          <p className="text-sm text-hexa-text-light mb-2">
                            {language === "en" ? "Description" : "الوصف"}
                          </p>
                          <p className="text-hexa-text-dark">{proposal.description}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {proposal.estimatedTimeline && (
                          <div>
                            <p className="text-sm text-hexa-text-light mb-2">
                              {language === "en" ? "Estimated Timeline" : "الجدول الزمني المتوقع"}
                            </p>
                            <p className="text-hexa-text-dark font-medium">{proposal.estimatedTimeline}</p>
                          </div>
                        )}
                        {proposal.proposedBudget && (
                          <div>
                            <p className="text-sm text-hexa-text-light mb-2">
                              {language === "en" ? "Proposed Budget" : "الميزانية المقترحة"}
                            </p>
                            <p className="text-hexa-text-dark font-medium">
                              {proposal.proposedBudget.amount} {proposal.proposedBudget.currency}
                            </p>
                          </div>
                        )}
                      </div>
                      {proposal.relevantExperience && (
                        <div>
                          <p className="text-sm text-hexa-text-light mb-2">
                            {language === "en" ? "Relevant Experience" : "الخبرة ذات الصلة"}
                          </p>
                          <p className="text-hexa-text-dark">{proposal.relevantExperience}</p>
                        </div>
                      )}
                      {proposal.createdAt && (
                        <div>
                          <p className="text-sm text-hexa-text-light">
                            {language === "en" ? "Submitted:" : "تم التقديم:"}{" "}
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CompanyProjectDetails;

