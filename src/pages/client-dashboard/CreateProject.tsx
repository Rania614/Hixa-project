import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, MapPin, Upload, X, Loader2 } from "lucide-react";
import { http } from "@/services/http";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { businessCategories } from "@/constants/filters";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const CreateProject = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    category: "",
    businessScope: "", // نطاق الأعمال - مطلوب
    country: "",
    city: "",
    location: "",
    description: "",
    requirements: "",
    deadline: "",
    startDate: "",
    budgetAmount: "",
    budgetCurrency: "SAR",
    tags: [] as string[],
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // التحقق من businessScope أولاً (مطلوب)
      if (!formData.businessScope?.trim()) {
        toast.error(
          language === "en" 
            ? "Business scope is required. Please select a business scope." 
            : "نطاق الأعمال مطلوب. يرجى اختيار نطاق الأعمال."
        );
        return;
      }

      // القيم المسموحة من الباك إند (case-sensitive)
      const validProjectTypes = [
        "Architecture",
        "Construction",
        "Civil Engineering",
        "Mechanical Engineering",
        "Electrical Engineering",
        "Interior Design",
        "Landscape Design",
        "Structural Engineering",
        "Other"
      ];
      
      const selectedProjectType = formData.type.trim();
      
      // التحقق من صحة projectType قبل الإرسال
      if (!validProjectTypes.includes(selectedProjectType)) {
        toast.error(
          language === "en" 
            ? "Invalid project type. Please select a valid type." 
            : "نوع المشروع غير صحيح. يرجى اختيار نوع صحيح."
        );
        return;
      }

      // Get country and city labels (not codes)
      const selectedCountry = countries.find(c => c.value === formData.country);
      const selectedCity = availableCities.find(c => c.value === formData.city);
      
      // Prepare payload matching database structure
      const payload: any = {
        title: formData.title.trim(),
        projectType: selectedProjectType,
        country: selectedCountry?.label || formData.country.trim(),
        city: selectedCity 
          ? (language === "en" ? selectedCity.label.en : selectedCity.label.ar)
          : formData.city.trim(),
        description: formData.description.trim(),
      };

      // Add optional location (if empty, backend will auto-generate)
      if (formData.location?.trim()) {
        payload.location = formData.location.trim();
      }

      // Add businessScope as category (نطاق الأعمال) - backend uses 'category' field for business scope
      // businessScope is required, so we always set it as category
      if (formData.businessScope?.trim()) {
        // Validate that the businessScope value is from the allowed list
        const isValidBusinessScope = businessCategories.includes(formData.businessScope.trim());
        if (!isValidBusinessScope) {
          toast.error(
            language === "en" 
              ? "Invalid business scope. Please select a valid business scope from the list." 
              : "نطاق الأعمال غير صحيح. يرجى اختيار نطاق أعمال صحيح من القائمة."
          );
          return;
        }
        payload.category = formData.businessScope.trim();
        console.log("✅ Valid business scope selected:", formData.businessScope.trim());
      }
      
      // Note: The separate 'category' input field is not used - businessScope replaces it

      // Add optional requirements
      if (formData.requirements?.trim()) {
        payload.requirements = formData.requirements.trim();
      }

      // Add optional deadline
      if (formData.deadline?.trim()) {
        payload.deadline = formData.deadline.trim();
      }

      // Add optional startDate
      if (formData.startDate?.trim()) {
        payload.startDate = formData.startDate.trim();
      }

      // Add optional budget
      if (formData.budgetAmount?.trim()) {
        payload.budget = {
          amount: parseFloat(formData.budgetAmount),
          currency: formData.budgetCurrency || "SAR",
        };
      }

      // Add optional tags
      if (formData.tags.length > 0) {
        payload.tags = formData.tags;
      }

      console.log("📤 Sending project data:", JSON.stringify(payload, null, 2));
      console.log("📤 Payload keys:", Object.keys(payload));
      console.log("📤 businessScope value:", formData.businessScope);
      console.log("📤 category in payload:", payload.category);

      // Send POST request to /projects endpoint
      const response = await http.post('/projects', payload);

      console.log("✅ Project created successfully:", response.data);
      console.log("📦 Full response:", JSON.stringify(response.data, null, 2));

      // Get project ID from response - backend returns { message, data: { id, ... } }
      // sanitizeProject returns 'id' field, not '_id'
      const projectId = response.data?.data?.id || 
                       response.data?.data?._id || 
                       response.data?.id || 
                       response.data?._id ||
                       response.data?.project?.id ||
                       response.data?.project?._id;
      
      console.log("🆔 Extracted project ID:", projectId);
      console.log("📎 Attachments to upload:", attachments.length);
      
      // Upload attachments if any
      if (attachments.length > 0) {
        if (!projectId) {
          console.error("❌ No project ID found in response!");
          toast.error(
            language === "en" 
              ? "Project created but could not get project ID. Please add files manually." 
              : "تم إنشاء المشروع لكن لم يتم الحصول على معرف المشروع. يرجى إضافة الملفات يدوياً."
          );
        } else {
          setUploading(true);
          setUploadProgress(0);
          
          try {
            // Upload files one by one
            for (let i = 0; i < attachments.length; i++) {
              const file = attachments[i];
              console.log(`📤 Uploading file ${i + 1}/${attachments.length}:`, file.name);
              
              const formData = new FormData();
              formData.append('file', file);
              formData.append('name', file.name);
              
              // Update progress
              const currentProgress = Math.round(((i + 1) / attachments.length) * 100);
              setUploadProgress(currentProgress);
              
              // Upload file - http.js automatically handles FormData and removes Content-Type header
              const uploadResponse = await http.post(`/projects/${projectId}/attachments`, formData);
              
              console.log(`✅ File ${i + 1} uploaded successfully:`, uploadResponse.data);
            }
            
            setUploadProgress(100);
            console.log("✅ All attachments uploaded successfully");
            toast.success(
              language === "en" 
                ? `Project created and ${attachments.length} file(s) uploaded successfully!` 
                : `تم إنشاء المشروع ورفع ${attachments.length} ملف(ات) بنجاح!`
            );
          } catch (uploadError: any) {
            console.error("❌ Error uploading attachments:", uploadError);
            console.error("❌ Upload error response:", uploadError.response?.data);
            console.error("❌ Upload error status:", uploadError.response?.status);
            
            // Show detailed error message
            const errorMessage = uploadError.response?.data?.message || 
                               uploadError.message || 
                               (language === "en" 
                                 ? "Failed to upload files" 
                                 : "فشل رفع الملفات");
            
            toast.error(
              language === "en" 
                ? `Project created, but file upload failed: ${errorMessage}` 
                : `تم إنشاء المشروع، لكن فشل رفع الملفات: ${errorMessage}`
            );
          } finally {
            setUploading(false);
          }
        }
      }

      // Show success message (only if no files were uploaded, or files were uploaded successfully)
      if (attachments.length === 0 || (attachments.length > 0 && projectId)) {
        // Message will be shown in the upload section if files were uploaded
        if (attachments.length === 0) {
          toast.success(
            language === "en" 
              ? "Project created successfully!" 
              : "تم إنشاء المشروع بنجاح!"
          );
        }
      }

      // Navigate to projects list only after successful creation and file uploads (if any)
      // Wait a bit to ensure all toasts are shown
      setTimeout(() => {
        navigate("/client/projects");
      }, attachments.length > 0 ? 1500 : 500);
    } catch (error: any) {
      console.error("❌ Error creating project:", error);
      console.error("❌ Error response data:", error.response?.data);
      console.error("❌ Error response status:", error.response?.status);
      
      // Extract error message from response
      const getErrorMessage = () => {
        if (!error.response?.data) {
          return language === "en" 
            ? "Failed to create project. Please try again." 
            : "فشل إنشاء المشروع. يرجى المحاولة مرة أخرى.";
        }

        // Log full error data for debugging
        const errorData = error.response.data;
        console.log("🔍 Full error data:", JSON.stringify(errorData, null, 2));

        // Handle validation errors that might be in errors array or fields object
        if (errorData.errors) {
          const validationErrors = Array.isArray(errorData.errors) 
            ? errorData.errors.join(", ")
            : Object.values(errorData.errors).flat().join(", ");
          return validationErrors;
        }

        if (typeof errorData === "string") {
          return errorData;
        }

        return errorData.message || 
               errorData.error || 
               errorData.msg || 
               (language === "en" 
                 ? "Failed to create project. Please check your input and try again." 
                 : "فشل إنشاء المشروع. يرجى التحقق من المدخلات والمحاولة مرة أخرى.");
      };

      const errorMessage = getErrorMessage();
      toast.error(errorMessage);
    }
  };

  // القيم المسموحة من الباك إند (case-sensitive مع مسافات)
  const projectTypes = [
    { value: "Architecture", label: language === "en" ? "Architecture" : "الهندسة المعمارية" },
    { value: "Construction", label: language === "en" ? "Construction" : "البناء" },
    { value: "Civil Engineering", label: language === "en" ? "Civil Engineering" : "الهندسة المدنية" },
    { value: "Mechanical Engineering", label: language === "en" ? "Mechanical Engineering" : "الهندسة الميكانيكية" },
    { value: "Electrical Engineering", label: language === "en" ? "Electrical Engineering" : "الهندسة الكهربائية" },
    { value: "Interior Design", label: language === "en" ? "Interior Design" : "التصميم الداخلي" },
    { value: "Landscape Design", label: language === "en" ? "Landscape Design" : "تصميم المناظر الطبيعية" },
    { value: "Structural Engineering", label: language === "en" ? "Structural Engineering" : "الهندسة الإنشائية" },
    { value: "Other", label: language === "en" ? "Other" : "أخرى" },
  ];

  const countries = [
    { value: "SA", label: language === "en" ? "Saudi Arabia" : "السعودية" },
    { value: "EG", label: language === "en" ? "Egypt" : "مصر" },
    { value: "AE", label: language === "en" ? "United Arab Emirates" : "الإمارات العربية المتحدة" },
    { value: "KW", label: language === "en" ? "Kuwait" : "الكويت" },
    { value: "QA", label: language === "en" ? "Qatar" : "قطر" },
    { value: "BH", label: language === "en" ? "Bahrain" : "البحرين" },
    { value: "OM", label: language === "en" ? "Oman" : "عمان" },
    { value: "JO", label: language === "en" ? "Jordan" : "الأردن" },
    { value: "LB", label: language === "en" ? "Lebanon" : "لبنان" },
  ];

  const citiesByCountry: { [key: string]: { value: string; label: { en: string; ar: string } }[] } = {
    SA: [
      { value: "Riyadh", label: { en: "Riyadh", ar: "الرياض" } },
      { value: "Jeddah", label: { en: "Jeddah", ar: "جدة" } },
      { value: "Dammam", label: { en: "Dammam", ar: "الدمام" } },
      { value: "Mecca", label: { en: "Mecca", ar: "مكة المكرمة" } },
      { value: "Medina", label: { en: "Medina", ar: "المدينة المنورة" } },
      { value: "Khobar", label: { en: "Khobar", ar: "الخبر" } },
      { value: "Abha", label: { en: "Abha", ar: "أبها" } },
      { value: "Tabuk", label: { en: "Tabuk", ar: "تبوك" } },
      { value: "Taif", label: { en: "Taif", ar: "الطائف" } },
      { value: "Buraydah", label: { en: "Buraydah", ar: "بريدة" } },
    ],
    EG: [
      { value: "Cairo", label: { en: "Cairo", ar: "القاهرة" } },
      { value: "Alexandria", label: { en: "Alexandria", ar: "الإسكندرية" } },
      { value: "Giza", label: { en: "Giza", ar: "الجيزة" } },
      { value: "Port Said", label: { en: "Port Said", ar: "بورسعيد" } },
      { value: "Suez", label: { en: "Suez", ar: "السويس" } },
      { value: "Luxor", label: { en: "Luxor", ar: "الأقصر" } },
      { value: "Aswan", label: { en: "Aswan", ar: "أسوان" } },
    ],
    AE: [
      { value: "Dubai", label: { en: "Dubai", ar: "دبي" } },
      { value: "Abu Dhabi", label: { en: "Abu Dhabi", ar: "أبو ظبي" } },
      { value: "Sharjah", label: { en: "Sharjah", ar: "الشارقة" } },
      { value: "Al Ain", label: { en: "Al Ain", ar: "العين" } },
      { value: "Ajman", label: { en: "Ajman", ar: "عجمان" } },
    ],
    KW: [
      { value: "Kuwait City", label: { en: "Kuwait City", ar: "مدينة الكويت" } },
      { value: "Al Ahmadi", label: { en: "Al Ahmadi", ar: "الأحمدي" } },
      { value: "Hawalli", label: { en: "Hawalli", ar: "حولي" } },
    ],
    QA: [
      { value: "Doha", label: { en: "Doha", ar: "الدوحة" } },
      { value: "Al Rayyan", label: { en: "Al Rayyan", ar: "الريان" } },
      { value: "Al Wakrah", label: { en: "Al Wakrah", ar: "الوكرة" } },
    ],
    BH: [
      { value: "Manama", label: { en: "Manama", ar: "المنامة" } },
      { value: "Riffa", label: { en: "Riffa", ar: "الرفاع" } },
      { value: "Muharraq", label: { en: "Muharraq", ar: "المحرق" } },
    ],
    OM: [
      { value: "Muscat", label: { en: "Muscat", ar: "مسقط" } },
      { value: "Salalah", label: { en: "Salalah", ar: "صلالة" } },
      { value: "Sohar", label: { en: "Sohar", ar: "صحار" } },
    ],
    JO: [
      { value: "Amman", label: { en: "Amman", ar: "عمان" } },
      { value: "Zarqa", label: { en: "Zarqa", ar: "الزرقاء" } },
      { value: "Irbid", label: { en: "Irbid", ar: "إربد" } },
    ],
    LB: [
      { value: "Beirut", label: { en: "Beirut", ar: "بيروت" } },
      { value: "Tripoli", label: { en: "Tripoli", ar: "طرابلس" } },
      { value: "Sidon", label: { en: "Sidon", ar: "صيدا" } },
    ],
  };

  const getCitiesForCountry = (countryCode: string) => {
    return citiesByCountry[countryCode] || [];
  };

  const availableCities = getCitiesForCountry(formData.country);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const invalidFiles = files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.error(
        language === "en" 
          ? `File size exceeds 10MB: ${invalidFiles.map(f => f.name).join(', ')}`
          : `حجم الملف يتجاوز 10 ميجابايت: ${invalidFiles.map(f => f.name).join(', ')}`
      );
      const validFiles = files.filter(file => file.size <= maxSize);
      if (validFiles.length > 0) {
        setAttachments((prev) => [...prev, ...validFiles]);
      }
    } else {
      setAttachments((prev) => [...prev, ...files]);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag.length > 50) {
        toast.error(
          language === "en" 
            ? "Tag must be 50 characters or less"
            : "يجب ألا يتجاوز الوسم 50 حرف"
        );
        return;
      }
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <DashboardLayout userType="client">
      <div className="space-y-6 max-w-5xl mx-auto">
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
                {getDashboardText("createNewProject", language)}
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
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-hexa-text-dark">
              {getDashboardText("createNewProject", language)}
            </h1>
            <p className="text-hexa-text-light mt-1">
              {language === "en" ? "Fill in the project details below" : "املأ تفاصيل المشروع أدناه"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader className="pb-6">
            <CardTitle className="text-hexa-text-dark text-2xl">
              {language === "en" ? "Project Information" : "معلومات المشروع"}
            </CardTitle>
            <CardDescription className="text-hexa-text-light mt-2">
              {language === "en" ? "Provide all necessary details about your project" : "قدم جميع التفاصيل اللازمة عن مشروعك"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title */}
              <div className="space-y-2.5">
                <Label htmlFor="title" className="text-hexa-text-dark text-base font-medium">
                  {getDashboardText("projectTitle", language)} *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  placeholder={language === "en" ? "Enter project title" : "أدخل عنوان المشروع"}
                />
              </div>

              {/* Project Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="type" className="text-hexa-text-dark text-base font-medium">
                    {getDashboardText("projectType", language)} *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                    required
                  >
                    <SelectTrigger className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11">
                      <SelectValue placeholder={language === "en" ? "Select project type" : "اختر نوع المشروع"} />
                    </SelectTrigger>
                    <SelectContent className="bg-hexa-card border-hexa-border">
                      {projectTypes.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="text-hexa-text-dark hover:bg-hexa-secondary/20"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="category" className="text-hexa-text-dark text-base font-medium">
                    {language === "en" ? "Category" : "الفئة"}
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                    placeholder={language === "en" ? "e.g., Residential, Commercial" : "مثل: سكني، تجاري"}
                  />
                </div>
              </div>

              {/* Business Scope (نطاق الأعمال) - Required */}
              <div className="space-y-2.5">
                <Label htmlFor="businessScope" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Business Scope" : "نطاق الأعمال"} *
                </Label>
                <Select
                  value={formData.businessScope}
                  onValueChange={(value) => handleSelectChange("businessScope", value)}
                  required
                >
                  <SelectTrigger className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11">
                    <SelectValue placeholder={language === "en" ? "Select business scope" : "اختر نطاق الأعمال"} />
                  </SelectTrigger>
                  <SelectContent className="bg-hexa-card border-hexa-border max-h-[300px]">
                    {businessCategories.map((scope) => (
                      <SelectItem
                        key={scope}
                        value={scope}
                        className="text-hexa-text-dark hover:bg-hexa-secondary/20"
                      >
                        {scope}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-hexa-text-light">
                  {language === "en" 
                    ? "Select the business scope that best describes your project"
                    : "اختر نطاق الأعمال الذي يصف مشروعك بشكل أفضل"}
                </p>
              </div>

              {/* Location - Country and City */}
              <div className="space-y-4">
                <Label className="text-hexa-text-dark text-base font-medium block">
                  {getDashboardText("location", language)} *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country Select */}
                  <div className="space-y-2.5">
                    <Label htmlFor="country" className="text-hexa-text-dark text-sm font-medium">
                      {language === "en" ? "Country" : "الدولة"} *
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => {
                        handleSelectChange("country", value);
                        // Reset city when country changes
                        setFormData((prev) => ({ ...prev, city: "", location: "" }));
                      }}
                      required
                    >
                      <SelectTrigger className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11">
                        <SelectValue placeholder={language === "en" ? "Select country" : "اختر الدولة"} />
                      </SelectTrigger>
                      <SelectContent className="bg-hexa-card border-hexa-border">
                        {countries.map((country) => (
                          <SelectItem
                            key={country.value}
                            value={country.value}
                            className="text-hexa-text-dark hover:bg-hexa-secondary/20 focus:bg-hexa-secondary/20"
                          >
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City Select */}
                  <div className="space-y-2.5">
                    <Label htmlFor="city" className="text-hexa-text-dark text-sm font-medium">
                      {language === "en" ? "City" : "المدينة"} *
                    </Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => {
                        handleSelectChange("city", value);
                        // Update location field
                        const selectedCity = availableCities.find(c => c.value === value);
                        const selectedCountry = countries.find(c => c.value === formData.country);
                        if (selectedCity && selectedCountry) {
                          const locationValue = language === "en" 
                            ? `${selectedCity.label.en}, ${selectedCountry.label}`
                            : `${selectedCity.label.ar}، ${selectedCountry.label}`;
                          setFormData((prev) => ({ ...prev, location: locationValue }));
                        }
                      }}
                      required
                      disabled={!formData.country || availableCities.length === 0}
                    >
                      <SelectTrigger className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-hexa-text-light" />
                          <SelectValue placeholder={
                            !formData.country 
                              ? (language === "en" ? "Select country first" : "اختر الدولة أولاً")
                              : (language === "en" ? "Select city" : "اختر المدينة")
                          } />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-hexa-card border-hexa-border">
                        {availableCities.length > 0 ? (
                          availableCities.map((city) => (
                            <SelectItem
                              key={city.value}
                              value={city.value}
                              className="text-hexa-text-dark hover:bg-hexa-secondary/20 focus:bg-hexa-secondary/20"
                            >
                              {language === "en" ? city.label.en : city.label.ar}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-hexa-text-light text-center">
                            {language === "en" ? "No cities available" : "لا توجد مدن متاحة"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Start Date and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="startDate" className="text-hexa-text-dark text-base font-medium">
                    {language === "en" ? "Start Date" : "تاريخ البدء"}
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="deadline" className="text-hexa-text-dark text-base font-medium">
                    {language === "en" ? "Expected Deadline" : "الموعد المتوقع"}
                  </Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11"
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2.5">
                <Label className="text-hexa-text-dark text-base font-medium block">
                  {language === "en" ? "Budget" : "الميزانية"}
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2.5">
                    <Label htmlFor="budgetAmount" className="text-hexa-text-dark text-sm font-medium">
                      {language === "en" ? "Amount" : "المبلغ"}
                    </Label>
                    <Input
                      id="budgetAmount"
                      name="budgetAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.budgetAmount}
                      onChange={handleInputChange}
                      className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11"
                      placeholder={language === "en" ? "e.g., 500000" : "مثال: 500000"}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="budgetCurrency" className="text-hexa-text-dark text-sm font-medium">
                      {language === "en" ? "Currency" : "العملة"}
                    </Label>
                    <Select
                      value={formData.budgetCurrency}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, budgetCurrency: value }))}
                    >
                      <SelectTrigger className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-hexa-card border-hexa-border">
                        <SelectItem value="SAR" className="text-hexa-text-dark">SAR</SelectItem>
                        <SelectItem value="USD" className="text-hexa-text-dark">USD</SelectItem>
                        <SelectItem value="EUR" className="text-hexa-text-dark">EUR</SelectItem>
                        <SelectItem value="AED" className="text-hexa-text-dark">AED</SelectItem>
                        <SelectItem value="EGP" className="text-hexa-text-dark">EGP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Project Description" : "وصف المشروع"} *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light resize-none min-h-[140px]"
                  placeholder={language === "en" ? "Describe your project in detail..." : "اوصف مشروعك بالتفصيل..."}
                />
              </div>

              {/* Requirements */}
              <div className="space-y-2.5">
                <Label htmlFor="requirements" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Requirements & Specifications" : "المتطلبات والمواصفات"}
                </Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={5}
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light resize-none min-h-[120px]"
                  placeholder={language === "en" ? "List any specific requirements..." : "اذكر أي متطلبات محددة..."}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2.5">
                <Label htmlFor="tags" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Tags" : "الوسوم"}
                </Label>
                <Input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11"
                  placeholder={language === "en" ? "Press Enter to add a tag" : "اضغط Enter لإضافة وسم"}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-hexa-secondary/20 text-hexa-text-dark hover:bg-hexa-secondary/30 px-3 py-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-hexa-text-light">
                  {language === "en" 
                    ? "Add tags to help categorize your project (max 50 characters per tag)"
                    : "أضف وسوماً لمساعدة في تصنيف مشروعك (حد أقصى 50 حرف لكل وسم)"}
                </p>
              </div>

              {/* Attachments */}
              <div className="space-y-2.5">
                <Label className="text-hexa-text-dark text-base font-medium block">
                  {language === "en" ? "Attachments" : "المرفقات"}
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary"
                  disabled={uploading}
                >
                  <Upload className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {language === "en" ? "Upload Files" : "رفع ملفات"}
                </Button>
                {uploading && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-hexa-secondary" />
                      <span className="text-sm text-hexa-text-light">
                        {language === "en" ? "Uploading..." : "جاري الرفع..."} {uploadProgress}%
                      </span>
                    </div>
                  </div>
                )}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => {
                      const fileSize = file.size > 1024 * 1024 
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                        : `${(file.size / 1024).toFixed(2)} KB`;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-hexa-bg border border-hexa-border rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm text-hexa-text-dark truncate">{file.name}</span>
                            <span className="text-xs text-hexa-text-light">({fileSize})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="ml-2 hover:text-red-500 text-hexa-text-light"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-hexa-text-light">
                  {language === "en" 
                    ? "Upload images, PDFs, or documents (max 10MB per file)"
                    : "ارفع صوراً أو ملفات PDF أو مستندات (حد أقصى 10 ميجابايت لكل ملف)"}
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-hexa-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/client/projects")}
                  className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary px-6 h-11"
                >
                  {language === "en" ? "Cancel" : "إلغاء"}
                </Button>
                <Button
                  type="submit"
                  className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold px-6 h-11"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className={`w-4 h-4 animate-spin ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {language === "en" ? "Creating..." : "جاري الإنشاء..."}
                    </>
                  ) : (
                    <>
                      <Save className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {language === "en" ? "Create Project" : "إنشاء المشروع"}
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

export default CreateProject;

