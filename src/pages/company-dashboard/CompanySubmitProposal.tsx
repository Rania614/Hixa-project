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
import { projectsApi } from "@/services/projectsApi";

const CompanySubmitProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [formData, setFormData] = useState({
    description: "",
    estimatedTimeline: "",
    relevantExperience: "",
    proposedBudget: {
      amount: "",
      currency: "SAR",
    },
  });

  // Check authentication and role
  useEffect(() => {
    const checkAuthAndRole = async () => {
      const token = localStorage.getItem("token");
      const userDataStr = localStorage.getItem("user");
      
      if (!token) {
        toast.error(
          language === "en" 
            ? "You must be logged in to submit a proposal" 
            : "يجب تسجيل الدخول لتقديم عرض"
        );
        navigate("/company/login");
        return;
      }

      try {
        let userData = null;
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr);
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }

        if (!userData) {
          try {
            const response = await http.get("/users/me");
            userData = response.data?.data || response.data?.user || response.data;
            if (userData) {
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (error: any) {
            console.warn("Could not fetch user data:", error);
          }
        }

        // Check if user is company
        const userRole = userData?.role || "";
        const bio = userData?.bio || '';
        const hasCompanyName = userData?.companyName !== undefined && userData?.companyName !== null;
        const hasContactPersonInBio = bio && bio.includes('Contact Person:');
        const savedPartnerType = localStorage.getItem('partnerType');
        
        const isCompany = savedPartnerType === 'company' ||
                          userRole === 'company' || 
                          userRole === 'Company' ||
                          userData?.isCompany === true ||
                          hasCompanyName ||
                          hasContactPersonInBio;

        if (!isCompany) {
          toast.error(
            language === "en" 
              ? "This page is for companies only" 
              : "هذه الصفحة للشركات فقط"
          );
          navigate("/company/login");
          return;
        }

        if (userData?.isActive === false || userData?.status === "inactive") {
          toast.error(
            language === "en" 
              ? "Your account is not activated. Please contact the administration." 
              : "حسابك غير مفعّل. يرجى التواصل مع الإدارة."
          );
          navigate("/company/dashboard");
          return;
        }

        setUser(userData);
      } catch (error: any) {
        console.error("Error checking authentication:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/company/login");
        }
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuthAndRole();
  }, [navigate, language]);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!id || authChecking) return;
      
      try {
        setProjectLoading(true);
        const projectData = await projectsApi.getProjectById(id);
        
        const projectStatus = projectData.status?.toLowerCase() || "";
        const isWaitingForEngineers = 
          projectStatus === "waiting for engineers" || 
          projectStatus === "waiting_for_engineers" ||
          projectStatus === "waitingforengineers" ||
          projectStatus === "published" ||
          projectStatus === "approved";
        
        const adminApprovalStatus = projectData.adminApproval?.status?.toLowerCase() || 
          projectData.adminApproval?.toLowerCase() || "";
        const isApproved = adminApprovalStatus === "approved" || adminApprovalStatus === "accept" || adminApprovalStatus === "";
        
        if (!isWaitingForEngineers) {
          toast.error(
            language === "en" 
              ? "This project is not accepting proposals. The project must be in 'Waiting for Engineers' status." 
              : "هذا المشروع لا يقبل العروض. يجب أن يكون المشروع في حالة 'في انتظار المهندسين'."
          );
          navigate("/company/available-projects");
          return;
        }

        if (!isApproved && adminApprovalStatus !== "") {
          toast.error(
            language === "en" 
              ? "This project is not approved by the administration yet." 
              : "هذا المشروع غير موافق عليه من الإدارة بعد."
          );
          navigate("/company/available-projects");
          return;
        }
        
        setProject({
          id: projectData._id || projectData.id || id,
          title: projectData.title || projectData.name || "Unknown Project",
          category: projectData.category || projectData.projectType || "N/A",
          location: projectData.location || "N/A",
          status: projectData.status,
          adminApproval: projectData.adminApproval,
        });
      } catch (error: any) {
        console.error("Error fetching project:", error);
        toast.error(
          language === "en" ? "Failed to load project details" : "فشل تحميل تفاصيل المشروع"
        );
        navigate("/company/available-projects");
      } finally {
        setProjectLoading(false);
      }
    };
    
    if (!authChecking) {
      fetchProject();
    }
  }, [id, language, navigate, authChecking]);

  // Check if proposal already exists
  useEffect(() => {
    const checkExistingProposal = async () => {
      if (!id || authChecking) return;
      try {
        const response = await http.get(`/proposals/project/${id}`);
        
        let proposalsData = response.data;
        if (proposalsData && typeof proposalsData === 'object' && !Array.isArray(proposalsData)) {
          if (proposalsData.data && Array.isArray(proposalsData.data)) {
            proposalsData = proposalsData.data;
          } else if (proposalsData.proposals && Array.isArray(proposalsData.proposals)) {
            proposalsData = proposalsData.proposals;
          } else {
            proposalsData = [];
          }
        }
        
        if (!Array.isArray(proposalsData)) {
          proposalsData = [];
        }
        
        // Find company's proposal
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
        const existingProposal = proposalsData.find((p: any) => {
          const proposalCompanyId = p.company?._id || p.company || p.engineer?._id || p.engineer;
          return proposalCompanyId === companyId;
        });
        
        if (existingProposal) {
          setIsEditMode(true);
          setProposalId(existingProposal._id || existingProposal.id);
          
          if (existingProposal.createdAt) {
            const createdAt = new Date(existingProposal.createdAt);
            const now = new Date();
            const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
            setCanEdit(hoursDiff < 1);
          } else {
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
        if (error.response?.status !== 404) {
          console.error("Error checking existing proposal:", error);
        }
      }
    };
    if (!authChecking) {
      checkExistingProposal();
    }
  }, [id, authChecking]);

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
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error(
          language === "en" 
            ? "You must be logged in to submit a proposal" 
            : "يجب تسجيل الدخول لتقديم عرض"
        );
        navigate("/company/login");
        setLoading(false);
        return;
      }

      if (!project || !id) {
        toast.error(
          language === "en" 
            ? "Project information is not available. Please refresh the page." 
            : "معلومات المشروع غير متوفرة. يرجى تحديث الصفحة."
        );
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

      if (isEditMode && proposalId) {
        if (!canEdit) {
          toast.error(
            language === "en" 
              ? "You can only edit proposals within 1 hour of creation" 
              : "يمكنك تعديل العروض خلال ساعة واحدة فقط من وقت الإنشاء"
          );
          setLoading(false);
          return;
        }
        
        await http.put(`/proposals/${proposalId}`, proposalData);
        toast.success(language === "en" ? "Proposal updated successfully" : "تم تحديث العرض بنجاح");
      } else {
        await http.post(`/proposals/project/${id}`, proposalData);
        toast.success(language === "en" ? "Proposal submitted successfully" : "تم إرسال العرض بنجاح");
      }
      
      navigate("/company/projects");
    } catch (error: any) {
      console.error("Error submitting proposal:", error);
      
      let errorMessage = "";
      
      if (error.response?.status === 401) {
        errorMessage = language === "en" 
          ? "Your session has expired. Please log in again." 
          : "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.";
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => navigate("/company/login"), 2000);
      } else if (error.response?.status === 403) {
        const backendMessage = error.response?.data?.message || "";
        errorMessage = backendMessage || 
          (language === "en" 
            ? "You are not authorized to perform this action." 
            : "غير مصرح لك بتنفيذ هذا الإجراء.");
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 
          (language === "en" 
            ? "Invalid request. Please check your proposal data." 
            : "طلب غير صحيح. يرجى التحقق من بيانات العرض.");
      } else {
        errorMessage = error.response?.data?.message || 
          error.message ||
          (language === "en" ? "Failed to submit proposal" : "فشل تقديم العرض");
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <DashboardLayout userType="company">
        <div className="text-center py-12 text-hexa-text-light">
          {language === "en" ? "Checking authentication..." : "جاري التحقق من المصادقة..."}
        </div>
      </DashboardLayout>
    );
  }

  if (projectLoading || !project) {
    return (
      <DashboardLayout userType="company">
        <div className="text-center py-12 text-hexa-text-light">
          {language === "en" ? "Loading project details..." : "جاري تحميل تفاصيل المشروع..."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6 max-w-5xl mx-auto">
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
              <BreadcrumbLink
                href={`/company/projects/${project.id}`}
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/company/projects/${project.id}`);
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
            onClick={() => navigate(`/company/projects/${project.id}`)}
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
                    className="bg-hexa-bg border-hexa-border text-hexa-text-light w-20 h-11"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-hexa-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/company/projects/${project.id}`)}
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

export default CompanySubmitProposal;

