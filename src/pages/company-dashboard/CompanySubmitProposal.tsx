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
      amount: 0, // سيُحسب تلقائياً من البنود
      currency: "SAR",
      items: [
        { description: "", amount: "" }
      ],
    },
    attachments: [] as File[],
  });

  // Check authentication and role
  useEffect(() => {
    const checkAuthAndRole = async () => {
      const token = localStorage.getItem("token");
      const userDataStr = localStorage.getItem("user");
      
      if (!token) {
        toast.error(language === "en" ? "You must be logged in" : "يجب تسجيل الدخول");
        navigate("/company/login");
        return;
      }

      try {
        let userData = userDataStr ? JSON.parse(userDataStr) : null;
        if (!userData) {
          const response = await http.get("/users/me");
          userData = response.data?.data || response.data?.user || response.data;
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

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!id || authChecking) return;
      try {
        setProjectLoading(true);
        const projectData = await projectsApi.getProjectById(id);
        setProject({
          id: projectData._id || id,
          title: projectData.title || "Project",
        });
      } catch (error) {
        toast.error(language === "en" ? "Failed to load project" : "فشل تحميل المشروع");
        navigate("/company/available-projects");
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [id, authChecking]);

  // Budget Item Handlers
  const addBudgetItem = () => {
    setFormData({
      ...formData,
      proposedBudget: {
        ...formData.proposedBudget,
        items: [...formData.proposedBudget.items, { description: "", amount: "" }]
      }
    });
  };

  const removeBudgetItem = (index: number) => {
    const updated = [...formData.proposedBudget.items];
    updated.splice(index, 1);
    const newItems = updated;
    const total = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    setFormData({ 
      ...formData, 
      proposedBudget: {
        ...formData.proposedBudget,
        items: newItems,
        amount: total,
      }
    });
  };

  const updateBudgetItem = (index: number, field: string, value: string) => {
    const updated = [...formData.proposedBudget.items];
    updated[index] = { ...updated[index], [field]: value };
    
    // حساب الإجمالي من جميع البنود
    const total = updated.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    setFormData({ 
      ...formData, 
      proposedBudget: {
        ...formData.proposedBudget,
        items: updated,
        amount: total,
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = new FormData();
      submissionData.append("description", formData.description);
      submissionData.append("estimatedTimeline", formData.estimatedTimeline);
      submissionData.append("relevantExperience", formData.relevantExperience);
      submissionData.append("proposedBudget", JSON.stringify({
        amount: formData.proposedBudget.amount,
        currency: formData.proposedBudget.currency,
        items: formData.proposedBudget.items.map(item => ({
          description: item.description,
          amount: parseFloat(item.amount) || 0,
        })),
      }));
      
      formData.attachments.forEach((file) => {
        submissionData.append("attachments", file);
      });

      if (isEditMode && proposalId) {
        await http.put(`/proposals/${proposalId}`, submissionData);
        toast.success(language === "en" ? "Updated successfully" : "تم التحديث بنجاح");
      } else {
        await http.post(`/proposals/project/${id}`, submissionData);
        toast.success(language === "en" ? "Submitted successfully" : "تم التقديم بنجاح");
      }

      navigate("/company/projects");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (authChecking || projectLoading) {
    return (
      <DashboardLayout userType="company">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hexa-secondary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6 max-w-5xl mx-auto pb-20">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/company/dashboard")} className="cursor-pointer text-hexa-text-light hover:text-hexa-secondary">
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-hexa-secondary/10">
            <ArrowLeft className="w-5 h-5 text-hexa-text-light" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-hexa-text-dark">
              {getDashboardText("submitProposal", language)}
            </h1>
            <p className="text-hexa-text-light">{project?.title}</p>
          </div>
        </div>

        <Card className="bg-hexa-card border-hexa-border shadow-sm">
          <CardHeader className="border-b border-hexa-border/50 pb-6">
            <CardTitle className="text-xl">{language === "en" ? "Proposal Submission Form" : "نموذج تقديم العرض الفني والمالي"}</CardTitle>
            <CardDescription>{language === "en" ? "Fill in the details to apply for this project" : "يرجى تعبئة كافة البيانات للتقديم على هذا المشروع"}</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* القسم الأول: المعلومات الأساسية */}
              <div className="grid gap-6">
                <div className="space-y-2.5">
                  <Label className="text-base font-semibold">{language === "en" ? "Proposal Description" : "وصف العرض التنفيذي"}</Label>
                  <Textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                    placeholder={language === "en" ? "Outline your implementation strategy..." : "اكتب استراتيجيتك لتنفيذ المشروع..."}
                    className="min-h-[150px] bg-hexa-bg/50 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-base font-semibold">{language === "en" ? "Completion Timeline" : "مدة التنفيذ المتوقعة"}</Label>
                  <Input name="estimatedTimeline" value={formData.estimatedTimeline} onChange={handleInputChange} required placeholder="e.g. 90 Days" className="bg-hexa-bg/50" />
                </div>

                <div className="space-y-2.5">
                    <Label className="text-base font-semibold">{language === "en" ? "Company Experience" : "خبرات الشركة السابقة"}</Label>
                    <Textarea 
                      name="relevantExperience" 
                      value={formData.relevantExperience} 
                      onChange={handleInputChange} 
                      className="min-h-[100px] bg-hexa-bg/50"
                    />
                </div>
              </div>

              {/* القسم الثاني: بنود الميزانية */}
              <div className="space-y-6 pt-6 border-t border-hexa-border">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-hexa-text-dark">{language === "en" ? "Budget Items" : "بنود الميزانية"}</h3>
                    <p className="text-xs text-hexa-text-light mt-1">{language === "en" ? "Add items with prices" : "أضف البنود مع الأسعار"}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addBudgetItem} className="border-hexa-secondary text-hexa-secondary hover:bg-hexa-secondary/10">
                    <Plus className="w-4 h-4 mr-1" /> {language === "en" ? "Add Item" : "إضافة بند"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.proposedBudget.items.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 p-5 bg-hexa-bg/30 rounded-2xl border border-hexa-border hover:border-hexa-secondary/30 transition-colors relative group">
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs text-hexa-text-light">{language === "en" ? "Item Description" : "وصف البند"}</Label>
                        <Input 
                          placeholder={language === "en" ? "e.g. Architectural Designs" : "مثلاً: التصاميم المعمارية"} 
                          value={item.description} 
                          onChange={(e) => updateBudgetItem(index, "description", e.target.value)}
                          className="h-10 bg-white"
                          required
                        />
                      </div>
                      <div className="w-full md:w-44 space-y-2">
                        <Label className="text-xs text-hexa-text-light">{language === "en" ? "Amount (SAR)" : "المبلغ (ريال)"}</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={item.amount} 
                          onChange={(e) => updateBudgetItem(index, "amount", e.target.value)}
                          className="h-10 bg-white"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {formData.proposedBudget.items.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeBudgetItem(index)}
                          className="text-destructive hover:bg-destructive/10 md:mt-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* عرض الإجمالي */}
                <div className="mt-4 p-5 bg-hexa-secondary/10 rounded-2xl border border-hexa-secondary/20">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-bold">{language === "en" ? "Total Budget" : "إجمالي الميزانية"}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-hexa-secondary">
                        {formData.proposedBudget.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-lg text-hexa-text-light">SAR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* القسم الثالث: المرفقات */}
              <div className="space-y-6 pt-6 border-t border-hexa-border">
                <h3 className="text-lg font-bold text-hexa-text-dark">{language === "en" ? "Technical Attachments" : "المرفقات والملفات الفنية"}</h3>
                <div className="relative">
                  <div className="border-2 border-dashed border-hexa-border hover:border-hexa-secondary rounded-2xl p-10 transition-all bg-hexa-bg/20 flex flex-col items-center justify-center text-center group cursor-pointer">
                    <UploadCloud className="w-14 h-14 text-hexa-text-light group-hover:text-hexa-secondary mb-4 transition-transform group-hover:scale-110" />
                    <div className="space-y-2">
                      <p className="text-base font-semibold">{language === "en" ? "Upload Company Profile or Proposal PDF" : "ارفع ملف الشركة أو العرض الفني (PDF)"}</p>
                      <p className="text-xs text-hexa-text-light">{language === "en" ? "Drag and drop or click to browse" : "اسحب الملفات هنا أو اضغط للتصفح"}</p>
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

                {formData.attachments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.attachments.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-hexa-border rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="bg-hexa-secondary/10 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-hexa-secondary" />
                          </div>
                          <span className="text-sm truncate font-medium text-hexa-text-dark">{file.name}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
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

              {/* أزرار الإجراءات */}
              <div className="flex items-center justify-end gap-4 pt-8 border-t border-hexa-border">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="h-12 px-8 border-hexa-border">
                  {language === "en" ? "Cancel" : "إلغاء"}
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-bold h-12 px-12 transition-all shadow-lg shadow-hexa-secondary/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                      {language === "en" ? "Processing..." : "جاري المعالجة..."}
                    </span>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditMode ? (language === "en" ? "Update Proposal" : "تحديث العرض") : (language === "en" ? "Submit Final Proposal" : "إرسال العرض النهائي")}
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

export default CompanySubmitProposal;