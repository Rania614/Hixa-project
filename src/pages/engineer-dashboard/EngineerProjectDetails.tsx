import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, FileText, Download, Eye, Edit } from "lucide-react";
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

const EngineerProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(false);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await http.get(`/projects/${id}`);
        const projectData = response.data;
        
        // Transform project data to match expected format
        setProject({
          id: projectData._id || projectData.id || id,
          title: projectData.name || projectData.title || "Unknown Project",
          category: projectData.category || "N/A",
          location: projectData.location || "N/A",
          description: projectData.description || "",
          requirements: projectData.requirements || projectData.requirement || "",
          deadline: projectData.deadline || projectData.endDate || "",
          files: projectData.files || projectData.attachments || [],
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
        setProposals(response.data || []);
      } catch (error: any) {
        console.error("Error fetching proposals:", error);
        // Don't show error toast for 404, as project might not have proposals yet
        if (error.response?.status !== 404) {
          toast.error(
            language === "en" ? "Failed to load proposals" : "فشل تحميل العروض"
          );
        }
      } finally {
        setProposalsLoading(false);
      }
    };
    fetchProposals();
  }, [id, language]);

  if (loading || !project) {
    return (
      <DashboardLayout userType="engineer">
        <div className="text-center py-12 text-hexa-text-light">
          {language === "en" ? "Loading project..." : "جاري تحميل المشروع..."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/engineer/dashboard"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/engineer/dashboard");
                }}
              >
                {getDashboardText("dashboard", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/engineer/available-projects"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/engineer/available-projects");
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
            onClick={() => navigate("/engineer/available-projects")}
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-hexa-text-dark">{project.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-hexa-secondary text-black font-bold">
                {getDashboardText("newProject", language)}
              </Badge>
              <span className="text-sm text-hexa-text-light flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {project.location}
              </span>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/engineer/projects/${project.id}/proposal`)}
            className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold"
          >
            <FileText className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
            {getDashboardText("submitProposal", language)}
          </Button>
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
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">
                    {language === "en" ? "Description" : "الوصف"}
                  </p>
                  <p className="text-hexa-text-dark">{project.description}</p>
                </div>
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">
                    {language === "en" ? "Requirements" : "المتطلبات"}
                  </p>
                  <p className="text-hexa-text-dark">{project.requirements}</p>
                </div>
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">
                    {language === "en" ? "Expected Deadline" : "الموعد المتوقع"}
                  </p>
                  <p className="font-medium text-hexa-text-dark">{project.deadline}</p>
                </div>
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
                <div className="space-y-3">
                  {project.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-hexa-secondary/20 rounded-lg">
                          <FileText className="w-5 h-5 text-hexa-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-hexa-text-dark">{file.name}</p>
                          <p className="text-sm text-hexa-text-light">
                            {file.size} • {file.date}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
                      >
                        <Download className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                        {language === "en" ? "Download" : "تحميل"}
                      </Button>
                    </div>
                  ))}
                </div>
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
                        {proposal.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/engineer/projects/${id}/proposal`)}
                            className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
                          >
                            <Edit className="w-4 h-4 ms-2" />
                            {language === "en" ? "Edit" : "تعديل"}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-hexa-text-light mb-2">
                          {language === "en" ? "Description" : "الوصف"}
                        </p>
                        <p className="text-hexa-text-dark">{proposal.description}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-hexa-text-light mb-2">
                            {language === "en" ? "Estimated Timeline" : "الجدول الزمني المتوقع"}
                          </p>
                          <p className="text-hexa-text-dark font-medium">{proposal.estimatedTimeline}</p>
                        </div>
                        <div>
                          <p className="text-sm text-hexa-text-light mb-2">
                            {language === "en" ? "Proposed Budget" : "الميزانية المقترحة"}
                          </p>
                          <p className="text-hexa-text-dark font-medium">
                            {proposal.proposedBudget?.amount} {proposal.proposedBudget?.currency}
                          </p>
                        </div>
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

export default EngineerProjectDetails;

