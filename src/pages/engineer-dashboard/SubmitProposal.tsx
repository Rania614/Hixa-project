import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Save } from "lucide-react";
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

const SubmitProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    description: "",
    estimatedTimeline: "",
    relevantExperience: "",
    proposedBudget: {
      amount: "",
      currency: "SAR",
    },
  });

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setProjectLoading(true);
        const response = await http.get(`/projects/${id}`);
        
        // Handle different response structures
        let projectData = response.data;
        if (projectData && typeof projectData === 'object' && !Array.isArray(projectData)) {
          if (projectData.data && typeof projectData.data === 'object') {
            projectData = projectData.data;
          } else if (projectData.project && typeof projectData.project === 'object') {
            projectData = projectData.project;
          }
        }
        
        setProject({
          id: projectData._id || projectData.id || id,
          title: projectData.title || projectData.name || "Unknown Project",
          category: projectData.category || projectData.projectType || "N/A",
          location: projectData.location || "N/A",
        });
      } catch (error: any) {
        console.error("Error fetching project:", error);
        toast.error(
          language === "en" ? "Failed to load project details" : "فشل تحميل تفاصيل المشروع"
        );
        // Fallback to basic data
        setProject({
          id: id,
          title: "Unknown Project",
          category: "N/A",
          location: "N/A",
        });
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [id, language]);

  // Check if proposal already exists for this project
  useEffect(() => {
    const checkExistingProposal = async () => {
      if (!id) return;
      try {
        // Use GET /api/proposals/project/:projectId to get engineer's proposal for this project
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
        
        // Engineer sees only their proposal, so it should be a single proposal or empty array
        const existingProposal = Array.isArray(proposalsData) && proposalsData.length > 0 
          ? proposalsData[0] 
          : null;
        
        if (existingProposal) {
          setIsEditMode(true);
          setProposalId(existingProposal._id || existingProposal.id);
          
          // Check if proposal can be edited (within 1 hour of creation)
          if (existingProposal.createdAt) {
            const createdAt = new Date(existingProposal.createdAt);
            const now = new Date();
            const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
            setCanEdit(hoursDiff < 1);
          } else {
            // If createdAt is not available, allow edit (backend will handle validation)
            setCanEdit(true);
          }
          
          setFormData({
            description: existingProposal.description || "",
            estimatedTimeline: existingProposal.estimatedTimeline || "",
            relevantExperience: existingProposal.relevantExperience || "",
            proposedBudget: {
              amount: existingProposal.proposedBudget?.amount?.toString() || "",
              currency: existingProposal.proposedBudget?.currency || "SAR",
            },
          });
        }
      } catch (error: any) {
        // 404 is expected if no proposal exists yet
        if (error.response?.status !== 404) {
          console.error("Error checking existing proposal:", error);
        }
      }
    };
    checkExistingProposal();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "amount") {
      setFormData((prev) => ({
        ...prev,
        proposedBudget: {
          ...prev.proposedBudget,
          amount: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Check if token exists
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error(
          language === "en" 
            ? "You must be logged in to submit a proposal" 
            : "يجب تسجيل الدخول لتقديم عرض"
        );
        navigate("/engineer/login");
        setLoading(false);
        return;
      }

      const proposalData = {
        description: formData.description,
        estimatedTimeline: formData.estimatedTimeline,
        relevantExperience: formData.relevantExperience,
        proposedBudget: {
          amount: parseFloat(formData.proposedBudget.amount),
          currency: formData.proposedBudget.currency,
        },
      };

      console.log("📤 Submitting proposal:", {
        projectId: id,
        isEditMode,
        proposalId,
        endpoint: isEditMode ? `PUT /proposals/${proposalId}` : `POST /proposals (with projectId in body)`,
        hasToken: !!token,
        tokenLength: token?.length,
        proposalData: isEditMode ? proposalData : { ...proposalData, project: id, projectId: id },
      });

      if (isEditMode && proposalId) {
        // Check if still within 1 hour (client-side validation)
        if (!canEdit) {
          toast.error(
            language === "en" 
              ? "You can only edit proposals within 1 hour of creation" 
              : "يمكنك تعديل العروض خلال ساعة واحدة فقط من وقت الإنشاء"
          );
          setLoading(false);
          return;
        }
        
        // Update existing proposal using PUT /api/proposals/:id
        await http.put(`/proposals/${proposalId}`, proposalData);
        toast.success(language === "en" ? "Proposal updated successfully" : "تم تحديث العرض بنجاح");
      } else {
        // Create new proposal using POST /api/proposals/project/:projectId
        await http.post(`/proposals/project/${id}`, proposalData);
        toast.success(language === "en" ? "Proposal submitted successfully" : "تم إرسال العرض بنجاح");
      }
      // Redirect to My Proposals page
      navigate("/engineer/projects");
    } catch (error: any) {
      console.error("❌ Error submitting proposal:", {
        error,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });

      // Handle different error types with specific messages
      let errorMessage = "";
      
      if (error.response?.status === 401) {
        // Unauthorized - token is invalid or expired
        errorMessage = language === "en" 
          ? "Your session has expired. Please log in again." 
          : "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.";
        localStorage.removeItem("token");
        setTimeout(() => navigate("/engineer/login"), 2000);
      } else if (error.response?.status === 403) {
        // Forbidden - user doesn't have permission
        errorMessage = error.response?.data?.message || 
          (language === "en" 
            ? "You are not authorized to perform this action" 
            : "غير مصرح لك بتنفيذ هذا الإجراء");
      } else if (error.response?.status === 404) {
        errorMessage = language === "en" 
          ? "Project not found. Please check the project ID." 
          : "المشروع غير موجود. يرجى التحقق من معرف المشروع.";
      } else if (error.response?.status >= 500) {
        errorMessage = language === "en" 
          ? "Server error. Please try again later." 
          : "خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.";
      } else {
        // Try to get error message from response
        errorMessage = error.response?.data?.message || 
          error.response?.data?.error ||
          error.message ||
          (language === "en" ? "Failed to submit proposal" : "فشل تقديم العرض");
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (projectLoading || !project) {
    return (
      <DashboardLayout userType="engineer">
        <div className="text-center py-12 text-hexa-text-light">
          {language === "en" ? "Loading..." : "جاري التحميل..."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-6 max-w-5xl mx-auto">
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
              <BreadcrumbLink
                href={`/engineer/projects/${project.id}`}
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/engineer/projects/${project.id}`);
                }}
              >
                {project.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("submitProposal", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/engineer/projects/${project.id}`)}
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-hexa-text-dark">
              {getDashboardText("submitProposal", language)}
            </h1>
            <p className="text-hexa-text-light mt-1">
              {language === "en" ? `Submit your proposal for: ${project.title}` : `قدم عرضك لمشروع: ${project.title}`}
            </p>
          </div>
        </div>

        {/* Edit Mode Warning */}
        {isEditMode && !canEdit && (
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="pt-6">
              <p className="text-yellow-600 dark:text-yellow-400">
                {language === "en" 
                  ? "⚠️ You can only edit proposals within 1 hour of creation. This proposal can no longer be edited." 
                  : "⚠️ يمكنك تعديل العروض خلال ساعة واحدة فقط من وقت الإنشاء. لا يمكن تعديل هذا العرض بعد الآن."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Form Card */}
        <Card className="bg-hexa-card border-hexa-border p-8">
          <CardHeader className="pb-6">
            <CardTitle className="text-hexa-text-dark text-2xl">
              {language === "en" ? "Proposal Details" : "تفاصيل العرض"}
            </CardTitle>
            <CardDescription className="text-hexa-text-light">
              {language === "en" ? "Provide all necessary information about your proposal" : "قدم جميع المعلومات اللازمة عن عرضك"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Proposal Description */}
              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Proposal Description" : "وصف العرض"} *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={8}
                  className="min-h-[160px] bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light resize-none"
                  placeholder={language === "en" ? "Describe your approach, experience, and why you're the best fit for this project..." : "اوصف نهجك وخبرتك ولماذا أنت الأنسب لهذا المشروع..."}
                />
              </div>

              {/* Timeline */}
              <div className="space-y-2.5">
                <Label htmlFor="estimatedTimeline" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Estimated Timeline" : "الجدول الزمني المتوقع"} *
                </Label>
                <Input
                  id="estimatedTimeline"
                  name="estimatedTimeline"
                  value={formData.estimatedTimeline}
                  onChange={handleInputChange}
                  required
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  placeholder={language === "en" ? "e.g., 3 months, 6 months" : "مثل: 3 أشهر، 6 أشهر"}
                />
              </div>

              {/* Relevant Experience */}
              <div className="space-y-2.5">
                <Label htmlFor="relevantExperience" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Relevant Experience" : "الخبرة ذات الصلة"}
                </Label>
                <Textarea
                  id="relevantExperience"
                  name="relevantExperience"
                  value={formData.relevantExperience}
                  onChange={handleInputChange}
                  rows={5}
                  className="min-h-[100px] bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light resize-none"
                  placeholder={language === "en" ? "Describe your relevant experience and similar projects you've completed..." : "اوصف خبرتك ذات الصلة والمشاريع المشابهة التي أكملتها..."}
                />
              </div>

              {/* Proposed Budget */}
              <div className="space-y-2.5">
                <Label htmlFor="amount" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Proposed Budget" : "الميزانية المقترحة"} *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.proposedBudget.amount}
                    onChange={handleInputChange}
                    required
                    className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11 flex-1"
                    placeholder={language === "en" ? "Amount" : "المبلغ"}
                  />
                  <Input
                    id="currency"
                    name="currency"
                    value={formData.proposedBudget.currency}
                    onChange={handleInputChange}
                    readOnly
                    className="bg-hexa-bg border-hexa-border text-hexa-text-dark w-20 h-11"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-hexa-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/engineer/projects/${project.id}`)}
                  className="border-hexa-border bg-hexa-card text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary h-11 px-6"
                >
                  {language === "en" ? "Cancel" : "إلغاء"}
                </Button>
                <Button
                  type="submit"
                  disabled={loading || (isEditMode && !canEdit)}
                  className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {loading
                    ? language === "en"
                      ? "Submitting..."
                      : "جاري التقديم..."
                    : isEditMode
                    ? language === "en"
                      ? "Update Proposal"
                      : "تحديث العرض"
                    : getDashboardText("submitProposal", language)}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SubmitProposal;

