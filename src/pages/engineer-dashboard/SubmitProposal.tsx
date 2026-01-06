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
import { ArrowLeft, FileText, Save, Plus, Trash2, UploadCloud } from "lucide-react";
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

  // الحالة الموسعة لتشمل البنود والملفات
  const [formData, setFormData] = useState({
    description: "",
    estimatedTimeline: "",
    relevantExperience: "",
    proposedBudget: {
      amount: "",
      currency: "SAR",
    },
    milestones: [
      { label: "", percentage: "", amount: "" }
    ],
    attachments: [] as File[],
  });

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const token = localStorage.getItem("token");
      const userDataStr = localStorage.getItem("user");
      
      if (!token) {
        toast.error(language === "en" ? "You must be logged in" : "يجب تسجيل الدخول");
        navigate("/engineer/login");
        return;
      }

      try {
        let userData = userDataStr ? JSON.parse(userDataStr) : null;
        if (!userData) {
          const response = await http.get("/auth/me");
          userData = response.data?.user || response.data;
          localStorage.setItem("user", JSON.stringify(userData));
        }
        setUser(userData);
      } catch (error) {
        console.error("Auth error", error);
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuthAndRole();
  }, [navigate, language]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || authChecking) return;
      try {
        setProjectLoading(true);
        const response = await http.get(`/projects/${id}`);
        let projectData = response.data?.data || response.data;
        setProject({
          id: projectData._id || id,
          title: projectData.title || "Unknown Project",
        });
      } catch (error) {
        toast.error(language === "en" ? "Failed to load project" : "فشل تحميل المشروع");
        navigate("/engineer/projects");
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [id, authChecking]);

  // دالة إضافة بند دفع جديد
  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { label: "", percentage: "", amount: "" }]
    });
  };

  // دالة حذف بند دفع
  const removeMilestone = (index: number) => {
    const updated = [...formData.milestones];
    updated.splice(index, 1);
    setFormData({ ...formData, milestones: updated });
  };

  // تحديث بيانات البند وحساب المبلغ تلقائياً
  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = [...formData.milestones];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === "percentage") {
      const total = parseFloat(formData.proposedBudget.amount) || 0;
      const calculatedAmount = ((total * parseFloat(value)) / 100).toFixed(2);
      updated[index].amount = isNaN(parseFloat(calculatedAmount)) ? "" : calculatedAmount;
    }
    setFormData({ ...formData, milestones: updated });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "amount") {
      setFormData((prev) => ({
        ...prev,
        proposedBudget: { ...prev.proposedBudget, amount: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // استخدام FormData لدعم رفع الملفات
      const submissionData = new FormData();
      submissionData.append("description", formData.description);
      submissionData.append("estimatedTimeline", formData.estimatedTimeline);
      submissionData.append("relevantExperience", formData.relevantExperience);
      submissionData.append("proposedBudget[amount]", formData.proposedBudget.amount);
      submissionData.append("proposedBudget[currency]", formData.proposedBudget.currency);
      submissionData.append("milestones", JSON.stringify(formData.milestones));
      
      formData.attachments.forEach((file) => {
        submissionData.append("attachments", file);
      });

      if (isEditMode && proposalId) {
        await http.put(`/proposals/${proposalId}`, submissionData);
      } else {
        await http.post(`/proposals/project/${id}`, submissionData);
      }

      toast.success(language === "en" ? "Submitted successfully" : "تم التقديم بنجاح");
      navigate("/engineer/projects");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (authChecking || projectLoading) {
    return (
      <DashboardLayout userType="engineer">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hexa-secondary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-6 max-w-5xl mx-auto pb-20">
        {/* Breadcrumb - (نفس الكود السابق) */}
        <Breadcrumb>
           <BreadcrumbList>
             <BreadcrumbItem>
               <BreadcrumbLink onClick={() => navigate("/engineer/dashboard")} className="cursor-pointer">
                 {getDashboardText("dashboard", language)}
               </BreadcrumbLink>
             </BreadcrumbItem>
             <BreadcrumbSeparator />
             <BreadcrumbItem>
               <BreadcrumbPage className="text-hexa-secondary font-semibold">
                 {getDashboardText("submitProposal", language)}
               </BreadcrumbPage>
             </BreadcrumbItem>
           </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-hexa-text-dark">
              {getDashboardText("submitProposal", language)}
            </h1>
            <p className="text-hexa-text-light">{project?.title}</p>
          </div>
        </div>

        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader>
            <CardTitle>{language === "en" ? "Proposal Details" : "تفاصيل العرض الهندسي"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* القسم الأساسي */}
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Description" : "وصف العرض التنفيذي"}</Label>
                  <Textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                    className="min-h-[120px] bg-hexa-bg"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Total Budget" : "إجمالي الميزانية المقترحة"}</Label>
                    <div className="flex gap-2">
                      <Input name="amount" type="number" value={formData.proposedBudget.amount} onChange={handleInputChange} required className="bg-hexa-bg" />
                      <Input value="SAR" readOnly className="w-20 bg-muted" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Timeline" : "الجدول الزمني (مثلاً: 4 أشهر)"}</Label>
                    <Input name="estimatedTimeline" value={formData.estimatedTimeline} onChange={handleInputChange} required className="bg-hexa-bg" />
                  </div>
                </div>
              </div>

              {/* قسم بنود الدفع (Milestones) */}
              <div className="space-y-4 pt-6 border-t border-hexa-border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Label className="text-lg font-bold">{language === "en" ? "Payment Milestones" : "هيكلة دفعات المشروع"}</Label>
                    <span className="text-xs bg-hexa-secondary/10 text-hexa-secondary px-2 py-1 rounded">
                      {language === "en" ? "Recommended: 3-5 stages" : "يفضل: 3-5 مراحل"}
                    </span>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="border-hexa-secondary text-hexa-secondary hover:bg-hexa-secondary/10">
                    <Plus className="w-4 h-4 mr-1" /> {language === "en" ? "Add Milestone" : "إضافة مرحلة دفع"}
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-hexa-bg/40 rounded-xl border border-hexa-border group relative">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] uppercase text-hexa-text-light">{language === "en" ? "Milestone Label" : "وصف المرحلة"}</Label>
                        <Input 
                          placeholder={language === "en" ? "e.g. Initial Submission" : "مثلاً: التصاميم المعمارية"} 
                          value={milestone.label} 
                          onChange={(e) => updateMilestone(index, "label", e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="w-full md:w-32 space-y-1">
                        <Label className="text-[10px] uppercase text-hexa-text-light">{language === "en" ? "Percentage (%)" : "النسبة (%)"}</Label>
                        <Input 
                          type="number" 
                          placeholder="25" 
                          value={milestone.percentage} 
                          onChange={(e) => updateMilestone(index, "percentage", e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="w-full md:w-40 space-y-1">
                        <Label className="text-[10px] uppercase text-hexa-text-light">{language === "en" ? "Amount" : "المبلغ التقريبي"}</Label>
                        <Input value={milestone.amount} readOnly className="h-9 bg-muted/50 border-none font-mono text-hexa-secondary" />
                      </div>
                      {formData.milestones.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeMilestone(index)}
                          className="text-destructive hover:bg-destructive/10 mt-5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* قسم المرفقات (File Upload) */}
              <div className="space-y-4 pt-6 border-t border-hexa-border">
                <Label className="text-lg font-bold">{language === "en" ? "Attachments" : "المرفقات الفنية"}</Label>
                <div className="relative group">
                  <div className="border-2 border-dashed border-hexa-border group-hover:border-hexa-secondary rounded-2xl p-8 transition-all bg-hexa-bg/20 flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-12 h-12 text-hexa-text-light group-hover:text-hexa-secondary mb-4 transition-colors" />
                    <div className="space-y-1">
                      <p className="text-base font-medium">{language === "en" ? "Click to upload project files" : "اضغط لرفع ملفات سابقة الأعمال أو ملفات توضيحية"}</p>
                      <p className="text-xs text-hexa-text-light">PDF, DOCX, JPG (Max 10MB each)</p>
                    </div>
                    <Input 
                      type="file" 
                      multiple 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => {
                        if (e.target.files) {
                          setFormData({ ...formData, attachments: [...formData.attachments, ...Array.from(e.target.files)] });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* قائمة الملفات المرفوعة */}
                {formData.attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    {formData.attachments.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-hexa-secondary/5 border border-hexa-secondary/20 rounded-lg">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className="w-5 h-5 text-hexa-secondary shrink-0" />
                          <span className="text-sm truncate font-medium">{file.name}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            const updated = [...formData.attachments];
                            updated.splice(i, 1);
                            setFormData({...formData, attachments: updated});
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* أزرار التحكم */}
              <div className="flex items-center justify-end gap-4 pt-10 mt-10 border-t border-hexa-border">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="h-12 px-8">
                  {language === "en" ? "Cancel" : "إلغاء"}
                </Button>
                <Button type="submit" disabled={loading} className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-bold h-12 px-10 min-w-[160px]">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                      {language === "en" ? "Sending..." : "جاري الإرسال..."}
                    </span>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditMode ? (language === "en" ? "Update Proposal" : "تحديث العرض") : (language === "en" ? "Submit Proposal" : "إرسال العرض النهائي")}
                    </>
                  )}
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