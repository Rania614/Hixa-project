import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { addPortfolioWork, updatePortfolioWork, getPortfolioWorkById } from "@/services/portfolioApi";
import { businessCategories } from "@/constants/filters";

const AddWork = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const isEditMode = !!id;
  
  // Determine user type from path
  const isCompany = location.pathname.includes('/company/');
  const userType = isCompany ? 'company' : 'engineer';
  const basePath = isCompany ? '/company' : '/engineer';
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    image: null as File | null,
    imagePreview: "",
    existingImage: "",
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchWorkData();
    }
  }, [id, isEditMode]);

  const fetchWorkData = async () => {
    if (!id) return;
    try {
      setFetching(true);
      const work = await getPortfolioWorkById(id);
      setFormData({
        title: work.title || "",
        description: work.description || "",
        category: work.category || "",
        date: work.date || "",
        image: null,
        imagePreview: typeof work.image === 'string' ? work.image : "",
        existingImage: typeof work.image === 'string' ? work.image : "",
      });
    } catch (error) {
      console.error("Failed to fetch work:", error);
      navigate(`${basePath}/portfolio`);
    } finally {
      setFetching(false);
    }
  };

  // Use the same categories as defined in backend validation (Arabic values from filters.ts)
  const categories = businessCategories.map(category => ({
    value: category,
    label: category
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
        existingImage: "", // Clear existing image when new one is selected
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate category is selected
    if (!formData.category || formData.category.trim() === "") {
      toast.error(language === "en" ? "Please select a category" : "يرجى اختيار نطاق الأعمال");
      return;
    }
    
    // Validate category is from allowed list
    const isValidCategory = businessCategories.includes(formData.category.trim());
    if (!isValidCategory) {
      console.error("Invalid category:", formData.category);
      console.error("Allowed categories:", businessCategories);
      toast.error(language === "en" ? "Invalid category selected" : "نطاق الأعمال غير صحيح");
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData if image exists, otherwise send JSON
      if (formData.image) {
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("category", formData.category.trim());
        formDataToSend.append("date", formData.date);
        formDataToSend.append("image", formData.image);
        
        console.log("📤 Sending FormData with image:", {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category.trim(),
          categoryLength: formData.category.trim().length,
          date: formData.date,
          hasImage: !!formData.image
        });
        
        // Log FormData entries
        console.log("📤 FormData entries:");
        for (const [key, value] of formDataToSend.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
          } else {
            console.log(`  ${key}: "${value}" (length: ${value.length})`);
          }
        }
        
        if (isEditMode && id) {
          const result = await updatePortfolioWork(id, formDataToSend);
          console.log("Update result:", result);
        } else {
          const result = await addPortfolioWork(formDataToSend);
          console.log("Add result:", result);
        }
      } else {
        const workData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category.trim(),
          date: formData.date,
        };
        
        console.log("📤 Sending JSON data:", workData);
        console.log("📤 Category value:", workData.category);
        console.log("📤 Category length:", workData.category.length);
        console.log("📤 Is valid category?", businessCategories.includes(workData.category));
        
        if (isEditMode && id) {
          const result = await updatePortfolioWork(id, workData);
          console.log("Update result:", result);
        } else {
          const result = await addPortfolioWork(workData);
          console.log("Add result:", result);
        }
      }
      
      // Wait a bit before navigating to ensure data is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(`${basePath}/portfolio`);
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'add'} work:`, error);
      // Error toast is handled in the API function
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`${basePath}/dashboard`}
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`${basePath}/dashboard`);
                }}
              >
                {getDashboardText("dashboard", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`${basePath}/portfolio`}
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`${basePath}/portfolio`);
                }}
              >
                {getDashboardText("portfolio", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {isEditMode 
                  ? (language === "en" ? "Edit Work" : "تعديل العمل")
                  : getDashboardText("addWork", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/engineer/portfolio")}
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-hexa-text-dark">
              {isEditMode 
                ? (language === "en" ? "Edit Work" : "تعديل العمل")
                : getDashboardText("addWork", language)}
            </h1>
            <p className="text-hexa-text-light mt-1">
              {isEditMode
                ? (language === "en" ? "Update your work information" : "قم بتحديث معلومات عملك")
                : (language === "en" ? "Add a new work to your portfolio" : "أضف عملاً جديداً إلى معرض أعمالك")}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-hexa-card border-hexa-border p-8">
          <CardHeader className="pb-6">
            <CardTitle className="text-hexa-text-dark text-2xl">
              {language === "en" ? "Work Information" : "معلومات العمل"}
            </CardTitle>
            <CardDescription className="text-hexa-text-light">
              {language === "en" ? "Provide all necessary details about your work" : "قدم جميع التفاصيل اللازمة عن عملك"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-hexa-secondary animate-spin" />
                <span className="ml-3 text-hexa-text-light">
                  {language === "en" ? "Loading work data..." : "جاري تحميل بيانات العمل..."}
                </span>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Work Title */}
              <div className="space-y-2.5">
                <Label htmlFor="title" className="text-hexa-text-dark text-base font-medium">
                  {getDashboardText("workTitle", language)} *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  placeholder={language === "en" ? "Enter work title" : "أدخل عنوان العمل"}
                />
              </div>

              {/* Category */}
              <div className="space-y-2.5">
                <Label htmlFor="category" className="text-hexa-text-dark text-base font-medium">
                  {getDashboardText("category", language)} *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11">
                    <SelectValue placeholder={language === "en" ? "Select category" : "اختر الفئة"} />
                  </SelectTrigger>
                  <SelectContent className="bg-hexa-card border-hexa-border">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        value={cat.value}
                        className="text-hexa-text-dark hover:bg-hexa-secondary/20"
                      >
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2.5">
                <Label htmlFor="date" className="text-hexa-text-dark text-base font-medium">
                  {getDashboardText("workDate", language)} *
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark h-11"
                />
              </div>

              {/* Work Description */}
              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-hexa-text-dark text-base font-medium">
                  {getDashboardText("workDescription", language)} *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="min-h-[120px] bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light resize-none"
                  placeholder={language === "en" ? "Describe your work in detail..." : "اوصف عملك بالتفصيل..."}
                />
              </div>

              {/* Work Image */}
              <div className="space-y-2.5">
                <Label htmlFor="image" className="text-hexa-text-dark text-base font-medium">
                  {getDashboardText("workImage", language)} {!isEditMode && "*"}
                </Label>
                <div className="space-y-4">
                  {formData.imagePreview || formData.existingImage ? (
                    <div className="relative">
                      <img
                        src={formData.imagePreview || formData.existingImage}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border border-hexa-border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            image: null,
                            imagePreview: "",
                            existingImage: "",
                          }));
                        }}
                        className="absolute top-2 right-2 border-hexa-border bg-hexa-card text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
                      >
                        {language === "en" ? "Remove" : "إزالة"}
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-hexa-border rounded-lg p-8 text-center hover:border-hexa-secondary/50 transition-colors">
                      <ImageIcon className="w-12 h-12 text-hexa-text-light mx-auto mb-4 opacity-50" />
                      <Label
                        htmlFor="image"
                        className="cursor-pointer inline-flex items-center gap-2 bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {language === "en" ? "Upload Image" : "رفع صورة"}
                      </Label>
                      <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!isEditMode}
                        className="hidden"
                      />
                      <p className="text-sm text-hexa-text-light mt-2">
                        {language === "en" ? "JPG, PNG or GIF. Max size 5MB" : "JPG أو PNG أو GIF. الحد الأقصى للحجم 5MB"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-hexa-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`${basePath}/portfolio`)}
                  className="border-hexa-border bg-hexa-card text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary h-11 px-6"
                >
                  {language === "en" ? "Cancel" : "إلغاء"}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11 px-6 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className={`w-4 h-4 animate-spin ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {isEditMode 
                        ? (language === "en" ? "Updating..." : "جاري التحديث...")
                        : (language === "en" ? "Adding..." : "جاري الإضافة...")}
                    </>
                  ) : (
                    <>
                      <Save className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {isEditMode 
                        ? (language === "en" ? "Update Work" : "تحديث العمل")
                        : (language === "en" ? "Add Work" : "إضافة العمل")}
                    </>
                  )}
                </Button>
              </div>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddWork;

