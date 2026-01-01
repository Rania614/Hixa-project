import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, FileText, Star, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { http } from "@/services/http";
import { toast } from "@/components/ui/sonner";
import { getProjectProposals } from "@/services/proposal.service";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await http.get(`/projects/${id}`);
        
        let projectData = response.data?.data || response.data?.project || response.data;
        
        // Format attachments from API response
        const attachments = projectData.attachments || [];
        console.log("📎 Raw attachments from API:", attachments);
        const formattedFiles = attachments.map((att: any) => {
          // Try multiple possible field names for URL
          const fileUrl = att.url || att.path || att.fileUrl || att.link || "";
          const fileName = att.name || att.filename || `File ${att._id}`;
          const fileSize = att.size 
            ? (att.size > 1024 * 1024 
                ? `${(att.size / (1024 * 1024)).toFixed(2)} MB`
                : `${(att.size / 1024).toFixed(2)} KB`)
            : "";
          const fileDate = att.uploadedAt || att.createdAt || "";
          
          console.log("📄 Formatted file:", {
            _id: att._id,
            name: fileName,
            url: fileUrl,
            hasUrl: !!fileUrl,
            originalAtt: att
          });
          
          return {
            _id: att._id || att.id,
            name: fileName,
            url: fileUrl,
            size: fileSize,
            date: fileDate ? new Date(fileDate).toLocaleDateString() : "",
            type: att.type || "other",
          };
        });
        
        console.log("📁 Formatted files array:", formattedFiles);
        console.log("📁 Files count:", formattedFiles.length);

        setProject({
          id: projectData._id || projectData.id || id,
          title: projectData.title || projectData.name || "Unknown Project",
          type: projectData.category || projectData.projectType || "N/A",
          location: projectData.location || "N/A",
          status: projectData.status || "pending",
          description: projectData.description || "",
          startDate: projectData.startDate || projectData.createdAt,
          endDate: projectData.endDate || projectData.deadline,
          files: formattedFiles,
          engineer: projectData.assignedTo ? {
            name: projectData.assignedTo.name || "Unknown Engineer",
            rating: projectData.assignedTo.rating || 0,
            specializations: projectData.assignedTo.specializations || [],
          } : null,
        });
      } catch (error: any) {
        console.error("Error fetching project:", error);
        toast.error(
          language === "en" ? "Failed to load project details" : "فشل تحميل تفاصيل المشروع"
        );
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
        const proposalsData = await getProjectProposals(id);
        setProposals(proposalsData);
      } catch (error: any) {
        console.error("Error fetching proposals:", error);
        if (error.response?.status !== 404) {
          toast.error(
            language === "en" ? "Failed to load proposals" : "فشل تحميل العروض"
          );
        }
        setProposals([]);
      } finally {
        setProposalsLoading(false);
      }
    };
    fetchProposals();
  }, [id, language]);

  // Cancel project
  const handleCancelProject = async () => {
    if (!id) return;
    
    const confirmMessage = language === "en" 
      ? "Are you sure you want to cancel this project? This action cannot be undone."
      : "هل أنت متأكد من إلغاء هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.";
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      setCancelling(true);
      await http.patch(`/projects/${id}/cancel`);
      toast.success(
        language === "en" 
          ? "Project cancelled successfully" 
          : "تم إلغاء المشروع بنجاح"
      );
      // Refresh project data
      const response = await http.get(`/projects/${id}`);
      let projectData = response.data?.data || response.data?.project || response.data;
      
      // Format attachments
      const attachments = projectData.attachments || [];
      const formattedFiles = attachments.map((att: any) => {
        const fileUrl = att.url || att.path || att.fileUrl || att.link || "";
        const fileName = att.name || att.filename || `File ${att._id}`;
        const fileSize = att.size 
          ? (att.size > 1024 * 1024 
              ? `${(att.size / (1024 * 1024)).toFixed(2)} MB`
              : `${(att.size / 1024).toFixed(2)} KB`)
          : "";
        const fileDate = att.uploadedAt || att.createdAt || "";
        
        return {
          _id: att._id || att.id,
          name: fileName,
          url: fileUrl,
          size: fileSize,
          date: fileDate ? new Date(fileDate).toLocaleDateString() : "",
          type: att.type || "other",
        };
      });
      
      setProject({
        id: projectData._id || projectData.id || id,
        title: projectData.title || projectData.name || "Unknown Project",
        type: projectData.category || projectData.projectType || "N/A",
        location: projectData.location || "N/A",
        status: projectData.status || "pending",
        description: projectData.description || "",
        startDate: projectData.startDate || projectData.createdAt,
        endDate: projectData.endDate || projectData.deadline,
        files: formattedFiles,
        engineer: projectData.assignedTo ? {
          name: projectData.assignedTo.name || "Unknown Engineer",
          rating: projectData.assignedTo.rating || 0,
          specializations: projectData.assignedTo.specializations || [],
        } : null,
      });
      // Navigate back to projects list
      navigate("/client/projects");
    } catch (error: any) {
      console.error("Error cancelling project:", error);
      const errorMessage = error.response?.data?.message || 
        (language === "en" ? "Failed to cancel project" : "فشل إلغاء المشروع");
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  // Fallback project data
  const fallbackProject = {
    id: id,
    title: "Residential Building Design",
    type: "Architecture",
    location: "Riyadh, Saudi Arabia",
    status: "inProgress",
    description: "A modern residential building design project requiring expertise in sustainable architecture and urban planning.",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    engineer: {
      name: "Ahmed Al-Mansouri",
      rating: 4.8,
      specializations: ["Architecture", "Urban Planning", "Sustainable Design"],
    },
    proposals: [
      {
        id: 1,
        engineer: "Ahmed Al-Mansouri",
        rating: 4.8,
        specializations: ["Architecture", "Urban Planning"],
        proposal: "I have 10+ years of experience in residential building design...",
        timeline: "5 months",
      },
      {
        id: 2,
        engineer: "Fatima Al-Zahra",
        rating: 4.9,
        specializations: ["Architecture", "Interior Design"],
        proposal: "I specialize in modern residential designs with sustainable practices...",
        timeline: "4 months",
      },
    ],
    files: [
      { name: "Project Brief.pdf", size: "2.4 MB", date: "2024-01-15" },
      { name: "Site Plans.dwg", size: "5.1 MB", date: "2024-01-20" },
      { name: "Requirements.docx", size: "1.2 MB", date: "2024-01-18" },
    ],
    milestones: [
      { title: "Project Kickoff", date: "2024-01-15", status: "completed" },
      { title: "Initial Design", date: "2024-02-15", status: "completed" },
      { title: "Design Review", date: "2024-03-15", status: "inProgress" },
      { title: "Final Approval", date: "2024-04-15", status: "pending" },
    ],
  };

  const displayProject = project || fallbackProject;

  if (loading && !project) {
    return (
      <DashboardLayout userType="client">
        <div className="text-center py-12 text-hexa-text-light">
          {language === "en" ? "Loading..." : "جاري التحميل..."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="client">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/client/dashboard"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/client/dashboard");
                }}
              >
                {getDashboardText("dashboard", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/client/projects"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/client/projects");
                }}
              >
                {getDashboardText("myProjects", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {displayProject.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/client/projects")}
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-hexa-text-dark">{displayProject.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
                {getDashboardText("inProgress", language)}
              </Badge>
              <span className="text-sm text-hexa-text-light flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {displayProject.location}
              </span>
            </div>
          </div>
          {/* Cancel Project Button - Only show if project is not completed or cancelled */}
          {displayProject.status !== "Completed" && 
           displayProject.status !== "Cancelled" && 
           displayProject.status !== "cancelled" && 
           displayProject.status !== "completed" && (
            <Button
              variant="outline"
              onClick={handleCancelProject}
              disabled={cancelling}
              className="border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 hover:border-red-500"
            >
              <X className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
              {cancelling 
                ? (language === "en" ? "Cancelling..." : "جاري الإلغاء...")
                : (language === "en" ? "Cancel Project" : "إلغاء المشروع")
              }
            </Button>
          )}
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
              value="proposals"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {getDashboardText("proposals", language)}
            </TabsTrigger>
            <TabsTrigger 
              value="files"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {getDashboardText("filesAttachments", language)}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Assigned Engineer Card */}
            {displayProject.engineer && (
              <Card className="bg-hexa-card border-hexa-border border-hexa-secondary/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-hexa-text-dark text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-hexa-secondary animate-pulse"></div>
                    {language === "en" ? "Assigned Engineer" : "المهندس المعين على المشروع"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="flex items-center gap-4 p-4 bg-hexa-bg rounded-lg border border-hexa-border cursor-pointer hover:border-hexa-secondary/60 hover:bg-hexa-secondary/5 transition-all"
                    onClick={() => navigate(`/client/engineers/${displayProject.engineer?.id || 1}`)}
                  >
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-hexa-secondary text-black text-xl font-bold">
                        {displayProject.engineer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-lg text-hexa-text-dark hover:text-hexa-secondary transition-colors">{displayProject.engineer.name}</p>
                        {displayProject.engineer.rating > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-hexa-secondary/20 rounded-md">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold text-hexa-text-dark">{displayProject.engineer.rating}</span>
                          </div>
                        )}
                      </div>
                      {displayProject.engineer.specializations && displayProject.engineer.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {displayProject.engineer.specializations.map((spec: string, idx: number) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="bg-hexa-secondary/10 text-hexa-secondary border-hexa-secondary/30"
                          >
                            {spec}
                          </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark">{language === "en" ? "Project Information" : "معلومات المشروع"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">{getDashboardText("projectType", language)}</p>
                  <p className="font-medium text-hexa-text-dark">{displayProject.type}</p>
                </div>
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">{language === "en" ? "Description" : "الوصف"}</p>
                  <p className="text-hexa-text-dark">{displayProject.description || (language === "en" ? "No description available" : "لا يوجد وصف متاح")}</p>
                </div>
                {(displayProject.startDate || displayProject.endDate) && (
                  <div>
                    <p className="text-sm text-hexa-text-light mb-2">{language === "en" ? "Timeline" : "الجدول الزمني"}</p>
                    <p className="font-medium text-hexa-text-dark">
                      {displayProject.startDate ? new Date(displayProject.startDate).toLocaleDateString() : "N/A"} - {displayProject.endDate ? new Date(displayProject.endDate).toLocaleDateString() : "N/A"}
                    </p>
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
                  {language === "en" ? "No proposals found for this project" : "لم تقم بتقديم أي عروض بعد"}
                </CardContent>
              </Card>
            ) : (
              proposals.map((proposal) => {
                const engineer = proposal.engineer || {};
                const engineerName = engineer.name || engineer.email || "Unknown Engineer";
                const engineerAvatarUrl = typeof engineer.avatar === 'string' 
                  ? engineer.avatar 
                  : engineer.avatar?.url;
                
                return (
                  <Card key={proposal._id || proposal.id} className="bg-hexa-card border-hexa-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage 
                              src={engineerAvatarUrl} 
                              alt={engineerName} 
                            />
                            <AvatarFallback className="bg-hexa-secondary text-black">
                              {engineerName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg text-hexa-text-dark">{engineerName}</CardTitle>
                            {proposal.status && (
                              <Badge 
                                variant={
                                  proposal.status === "accepted" ? "default" :
                                  proposal.status === "rejected" ? "destructive" :
                                  "outline"
                                }
                                className="mt-1"
                              >
                                {proposal.status === "pending" 
                                  ? (language === "en" ? "Pending" : "قيد الانتظار")
                                  : proposal.status === "accepted"
                                  ? (language === "en" ? "Accepted" : "مقبول")
                                  : proposal.status === "rejected"
                                  ? (language === "en" ? "Rejected" : "مرفوض")
                                  : proposal.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-hexa-text-light mb-2">{language === "en" ? "Description" : "الوصف"}</p>
                        <p className="text-hexa-text-dark">{proposal.description}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {proposal.estimatedTimeline && (
                          <div>
                            <p className="text-sm text-hexa-text-light mb-2">{language === "en" ? "Estimated Timeline" : "الجدول الزمني المتوقع"}</p>
                            <p className="font-medium text-hexa-text-dark">{proposal.estimatedTimeline}</p>
                          </div>
                        )}
                        {proposal.proposedBudget && (
                          <div>
                            <p className="text-sm text-hexa-text-light mb-2">{language === "en" ? "Proposed Budget" : "الميزانية المقترحة"}</p>
                            <p className="font-medium text-hexa-text-dark">
                              {proposal.proposedBudget.amount} {proposal.proposedBudget.currency}
                            </p>
                          </div>
                        )}
                      </div>
                      {proposal.relevantExperience && (
                        <div>
                          <p className="text-sm text-hexa-text-light mb-2">{language === "en" ? "Relevant Experience" : "الخبرة ذات الصلة"}</p>
                          <p className="text-hexa-text-dark">{proposal.relevantExperience}</p>
                        </div>
                      )}
                      {proposal.createdAt && (
                        <div className="pt-2 border-t border-hexa-border">
                          <p className="text-sm text-hexa-text-light">
                            {language === "en" ? "Submitted:" : "تاريخ التقديم:"}{" "}
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark">{getDashboardText("filesAttachments", language)}</CardTitle>
              </CardHeader>
              <CardContent>
                {displayProject.files && displayProject.files.length > 0 ? (
                  <div className="space-y-3">
                    {displayProject.files.map((file: any, idx: number) => {
                      console.log("🔍 Rendering file:", file);
                      return (
                        <div key={file._id || idx} className="flex items-center justify-between p-3 border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors bg-hexa-card border">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-hexa-secondary" />
                            <div>
                              <p className="font-medium text-hexa-text-dark">{file.name}</p>
                              {(file.size || file.date) && (
                                <p className="text-sm text-hexa-text-light">
                                  {file.size} {file.size && file.date ? "•" : ""} {file.date}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (file.url) {
                                window.open(file.url, '_blank');
                              } else {
                                console.error("❌ File URL is missing:", file);
                                toast.error(
                                  language === "en" 
                                    ? "File URL is not available" 
                                    : "رابط الملف غير متاح"
                                );
                              }
                            }}
                            disabled={!file.url}
                            className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {language === "en" ? "Download" : "تحميل"}
                          </Button>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetails;

