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

  // ✅ التحقق من Authentication وRole عند تحميل الصفحة
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
        navigate("/engineer/login");
        return;
      }

      try {
        // محاولة جلب بيانات المستخدم من localStorage أو من API
        let userData = null;
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr);
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }

        // إذا لم يكن userData موجوداً، جلب البيانات من API
        if (!userData) {
          try {
            const response = await http.get("/auth/me");
            userData = response.data?.user || response.data?.data || response.data;
            if (userData) {
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (error: any) {
            // إذا فشل جلب البيانات، نستخدم بيانات الـ token
            console.warn("Could not fetch user data:", error);
          }
        }

        // ✅ التحقق من Role
        const userRole = userData?.role || "";
        if (userRole !== "engineer" && userRole !== "partner") {
          toast.error(
            language === "en" 
              ? "This page is for engineers only" 
              : "هذه الصفحة للمهندسين فقط"
          );
          navigate("/");
          return;
        }

        // ✅ التحقق من حالة الحساب (isActive)
        if (userData?.isActive === false || userData?.status === "inactive") {
          toast.error(
            language === "en" 
              ? "Your account is not activated. Please contact the administration." 
              : "حسابك غير مفعّل. يرجى التواصل مع الإدارة."
          );
          navigate("/engineer/dashboard");
          return;
        }

        setUser(userData);
      } catch (error: any) {
        console.error("Error checking authentication:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/engineer/login");
        }
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuthAndRole();
  }, [navigate, language]);

  // Fetch project data with status validation
  useEffect(() => {
    const fetchProject = async () => {
      if (!id || authChecking) return;
      
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
        
        // ✅ التحقق من حالة المشروع قبل السماح بالإرسال
        const projectStatus = projectData.status?.toLowerCase() || "";
        const isWaitingForEngineers = 
          projectStatus === "waiting for engineers" || 
          projectStatus === "waiting_for_engineers" ||
          projectStatus === "waitingforengineers" ||
          projectStatus === "published";
        
        const adminApprovalStatus = projectData.adminApproval?.status?.toLowerCase() || 
          projectData.adminApproval?.toLowerCase() || "";
        const isApproved = adminApprovalStatus === "approved" || adminApprovalStatus === "accept";
        
        // إذا لم يكن المشروع في الحالة المناسبة، عرض تحذير وإعادة التوجيه
        if (!isWaitingForEngineers) {
          toast.error(
            language === "en" 
              ? "This project is not accepting proposals. The project must be in 'Waiting for Engineers' status." 
              : "هذا المشروع لا يقبل العروض. يجب أن يكون المشروع في حالة 'في انتظار المهندسين'."
          );
          navigate("/engineer/projects");
          return;
        }

        if (!isApproved) {
          toast.error(
            language === "en" 
              ? "This project is not approved by the administration yet." 
              : "هذا المشروع غير موافق عليه من الإدارة بعد."
          );
          navigate("/engineer/projects");
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
        navigate("/engineer/projects");
      } finally {
        setProjectLoading(false);
      }
    };
    
    if (!authChecking) {
      fetchProject();
    }
  }, [id, language, navigate, authChecking]);

  // Check if proposal already exists for this project
  useEffect(() => {
    const checkExistingProposal = async () => {
      if (!id || authChecking) return;
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
      // ✅ التحقق النهائي قبل الإرسال
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

      // ✅ التحقق من Role
      if (!user || (user.role !== "engineer" && user.role !== "partner")) {
        toast.error(
          language === "en" 
            ? "This action is for engineers only. Please ensure you are logged in as an engineer." 
            : "هذه العملية للمهندسين فقط. يرجى التأكد من تسجيل الدخول كمهندس."
        );
        setLoading(false);
        return;
      }

      // ✅ التحقق من حالة الحساب
      if (user.isActive === false || user.status === "inactive") {
        toast.error(
          language === "en" 
            ? "Your account is not activated. Please contact the administration." 
            : "حسابك غير مفعّل. يرجى التواصل مع الإدارة."
        );
        setLoading(false);
        return;
      }

      // ✅ التحقق من حالة المشروع
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

      console.log("📤 Submitting proposal:", {
        projectId: id,
        isEditMode,
        proposalId,
        endpoint: isEditMode ? `PUT /proposals/${proposalId}` : `POST /proposals/project/${id}`,
        hasToken: !!token,
        tokenLength: token?.length,
        userRole: user?.role,
        isActive: user?.isActive,
        userId: user?._id || user?.id,
        userEmail: user?.email,
        proposalData,
      });
      
      // Double-check user role before submitting
      if (user?.role !== "engineer" && user?.role !== "partner") {
        toast.error(
          language === "en" 
            ? "Only engineers can submit proposals. Please log in as an engineer." 
            : "فقط المهندسين يمكنهم تقديم العروض. يرجى تسجيل الدخول كمهندس."
        );
        setLoading(false);
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/engineer/login");
        }, 2000);
        return;
      }
      
      // Check if account is active
      if (user?.isActive === false || user?.status === "inactive") {
        toast.error(
          language === "en" 
            ? "Your account is not activated. Please contact the administration." 
            : "حسابك غير مفعّل. يرجى التواصل مع الإدارة."
        );
        setLoading(false);
        return;
      }

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
      });

      // ✅ Handle different error types with specific messages
      let errorMessage = "";
      
      if (error.response?.status === 401) {
        // Unauthorized - token is invalid or expired
        errorMessage = language === "en" 
          ? "Your session has expired. Please log in again." 
          : "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.";
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => navigate("/engineer/login"), 2000);
      } else if (error.response?.status === 403) {
        // ✅ Forbidden - user doesn't have permission - معالجة مفصلة
        const backendMessage = error.response?.data?.message || "";
        
        // Log detailed error for debugging
        console.error("🔍 403 Error Details:", {
          backendMessage,
          userRole: user?.role,
          isActive: user?.isActive,
          userId: user?._id || user?.id,
          projectId: id,
        });
        
        if (backendMessage.toLowerCase().includes("engineer") || 
            backendMessage.toLowerCase().includes("مهندسين") ||
            backendMessage.toLowerCase().includes("role") ||
            backendMessage.toLowerCase().includes("دور")) {
          errorMessage = language === "en" 
            ? "This action is for engineers only. Please ensure you are logged in as an engineer." 
            : "هذه العملية للمهندسين فقط. يرجى التأكد من تسجيل الدخول كمهندس.";
          toast.error(errorMessage);
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/engineer/login");
          }, 2000);
        } else if (backendMessage.toLowerCase().includes("active") || 
                   backendMessage.toLowerCase().includes("مفعّل") ||
                   backendMessage.toLowerCase().includes("activated")) {
          errorMessage = language === "en" 
            ? "Your account is not activated. Please contact the administration." 
            : "حسابك غير مفعّل. يرجى التواصل مع الإدارة.";
        } else if (backendMessage.toLowerCase().includes("status") || 
                   backendMessage.toLowerCase().includes("حالة")) {
          errorMessage = language === "en" 
            ? "This project is not accepting proposals at this time. Please check the project status." 
            : "هذا المشروع لا يقبل العروض في الوقت الحالي. يرجى التحقق من حالة المشروع.";
        } else if (backendMessage.toLowerCase().includes("duplicate") || 
                   backendMessage.toLowerCase().includes("موجود") ||
                   backendMessage.toLowerCase().includes("already")) {
          errorMessage = language === "en" 
            ? "You have already submitted a proposal for this project." 
            : "لقد قمت بتقديم عرض لهذا المشروع بالفعل.";
        } else {
          // Use backend message if available, otherwise show generic message
          errorMessage = backendMessage || 
            (language === "en" 
              ? "You are not authorized to perform this action. Please check your account status and role." 
              : "غير مصرح لك بتنفيذ هذا الإجراء. يرجى التحقق من حالة حسابك ودورك.");
          
          // If user is company, suggest using company dashboard
          if (user?.role === "company") {
            errorMessage = language === "en"
              ? "Companies cannot submit proposals. Please use the company dashboard to manage your projects."
              : "الشركات لا يمكنها تقديم عروض. يرجى استخدام لوحة تحكم الشركة لإدارة مشاريعك.";
            setTimeout(() => navigate("/company/dashboard"), 3000);
          } else if (!user?.role || (user?.role !== "engineer" && user?.role !== "partner")) {
            errorMessage = language === "en"
              ? "Only engineers can submit proposals. Please log in as an engineer."
              : "فقط المهندسين يمكنهم تقديم العروض. يرجى تسجيل الدخول كمهندس.";
            setTimeout(() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/engineer/login");
            }, 2000);
          }
        }
      } else if (error.response?.status === 400) {
        // Bad Request - usually validation error or project status issue
        errorMessage = error.response?.data?.message || 
          error.response?.data?.error ||
          (language === "en" 
            ? "Invalid request. Please check the project status and your proposal data." 
            : "طلب غير صحيح. يرجى التحقق من حالة المشروع وبيانات العرض.");
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

  // Show loading while checking authentication
  if (authChecking) {
    return (
      <DashboardLayout userType="engineer">
        <div className="text-center py-12 text-hexa-text-light">
          {language === "en" ? "Checking authentication..." : "جاري التحقق من المصادقة..."}
        </div>
      </DashboardLayout>
    );
  }

  // Show loading while fetching project
  if (projectLoading || !project) {
    return (
      <DashboardLayout userType="engineer">
        <div className="text-center py-12 text-hexa-text-light">
          {language === "en" ? "Loading project details..." : "جاري تحميل تفاصيل المشروع..."}
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

