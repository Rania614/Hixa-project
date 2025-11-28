import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Upload, Image as ImageIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const AddWork = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    image: null as File | null,
    imagePreview: "",
  });

  const categories = [
    { value: "Architecture", label: language === "en" ? "Architecture" : "الهندسة المعمارية" },
    { value: "Urban Planning", label: language === "en" ? "Urban Planning" : "التخطيط العمراني" },
    { value: "Civil Engineering", label: language === "en" ? "Civil Engineering" : "الهندسة المدنية" },
    { value: "Mechanical Engineering", label: language === "en" ? "Mechanical Engineering" : "الهندسة الميكانيكية" },
    { value: "Electrical Engineering", label: language === "en" ? "Electrical Engineering" : "الهندسة الكهربائية" },
    { value: "Industrial Design", label: language === "en" ? "Industrial Design" : "التصميم الصناعي" },
    { value: "Interior Design", label: language === "en" ? "Interior Design" : "التصميم الداخلي" },
  ];

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
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Work submitted:", formData);
    navigate("/engineer/portfolio");
  };

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
                href="/engineer/portfolio"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/engineer/portfolio");
                }}
              >
                {getDashboardText("portfolio", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("addWork", language)}
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
              {getDashboardText("addWork", language)}
            </h1>
            <p className="text-hexa-text-light mt-1">
              {language === "en" ? "Add a new work to your portfolio" : "أضف عملاً جديداً إلى معرض أعمالك"}
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
                  {getDashboardText("workImage", language)} *
                </Label>
                <div className="space-y-4">
                  {formData.imagePreview ? (
                    <div className="relative">
                      <img
                        src={formData.imagePreview}
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
                        required
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
                  onClick={() => navigate("/engineer/portfolio")}
                  className="border-hexa-border bg-hexa-card text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary h-11 px-6"
                >
                  {language === "en" ? "Cancel" : "إلغاء"}
                </Button>
                <Button
                  type="submit"
                  className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11 px-6"
                >
                  <Save className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {language === "en" ? "Add Work" : "إضافة العمل"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddWork;

