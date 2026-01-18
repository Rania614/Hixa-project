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
      amount: 0, // سيُحسب تلقائياً من البنود
      currency: "SAR",
      items: [
        { description: "", amount: "" }
      ],
    },
    attachments: [] as File[],
  });

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const token = localStorage.getItem("token");
      const userDataStr = localStorage.getItem("user");
      
      if (!token) {
        toast.error(language === "en" ? "You must be logged in" : "يجب تسجيل الدخول");
        navigate("/auth/partner");
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

  // دالة إضافة بند ميزانية جديد
  const addBudgetItem = () => {
    setFormData({
      ...formData,
      proposedBudget: {
        ...formData.proposedBudget,
        items: [...formData.proposedBudget.items, { description: "", amount: "" }]
      }
    });
  };

  // دالة حذف بند ميزانية
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

  // تحديث بيانات البند وحساب الإجمالي تلقائياً
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
      // استخدام FormData لدعم رفع الملفات
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

                <div className="space-y-2">
                  <Label>{language === "en" ? "Timeline" : "الجدول الزمني (مثلاً: 4 أشهر)"}</Label>
                  <Input name="estimatedTimeline" value={formData.estimatedTimeline} onChange={handleInputChange} required className="bg-hexa-bg" />
                </div>
              </div>

              {/* قسم بنود الميزانية */}
              <div className="space-y-4 pt-6 border-t border-hexa-border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Label className="text-lg font-bold">{language === "en" ? "Budget Items" : "بنود الميزانية"}</Label>
                    <span className="text-xs bg-hexa-secondary/10 text-hexa-secondary px-2 py-1 rounded">
                      {language === "en" ? "Add items with prices" : "أضف البنود مع الأسعار"}
                    </span>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addBudgetItem} className="border-hexa-secondary text-hexa-secondary hover:bg-hexa-secondary/10">
                    <Plus className="w-4 h-4 mr-1" /> {language === "en" ? "Add Item" : "إضافة بند"}
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.proposedBudget.items.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-hexa-bg/40 rounded-xl border border-hexa-border group relative">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] uppercase text-hexa-text-light">{language === "en" ? "Item Description" : "وصف البند"}</Label>
                        <Input 
                          placeholder={language === "en" ? "e.g. Architectural Designs" : "مثلاً: التصاميم المعمارية"} 
                          value={item.description} 
                          onChange={(e) => updateBudgetItem(index, "description", e.target.value)}
                          className="h-9"
                          required
                        />
                      </div>
                      <div className="w-full md:w-40 space-y-1">
                        <Label className="text-[10px] uppercase text-hexa-text-light">{language === "en" ? "Amount (SAR)" : "المبلغ (ريال)"}</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={item.amount} 
                          onChange={(e) => updateBudgetItem(index, "amount", e.target.value)}
                          className="h-9"
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
                          className="text-destructive hover:bg-destructive/10 mt-5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* عرض الإجمالي */}
                <div className="mt-4 p-4 bg-hexa-secondary/10 rounded-xl border border-hexa-secondary/20">
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