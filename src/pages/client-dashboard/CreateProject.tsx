import React, { useState } from "react";
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
import { ArrowLeft, Save } from "lucide-react";
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
    location: "",
    description: "",
    requirements: "",
    deadline: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Project Data:", formData);
    // Navigate back to projects list after submission
    navigate("/client/projects");
  };

  const projectTypes = [
    { value: "architecture", label: language === "en" ? "Architecture" : "الهندسة المعمارية" },
    { value: "construction", label: language === "en" ? "Construction" : "البناء" },
    { value: "civil", label: language === "en" ? "Civil Engineering" : "الهندسة المدنية" },
    { value: "mechanical", label: language === "en" ? "Mechanical Engineering" : "الهندسة الميكانيكية" },
    { value: "electrical", label: language === "en" ? "Electrical Engineering" : "الهندسة الكهربائية" },
  ];

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

              {/* Location */}
              <div className="space-y-2.5">
                <Label htmlFor="location" className="text-hexa-text-dark text-base font-medium">
                  {getDashboardText("location", language)} *
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  placeholder={language === "en" ? "e.g., Riyadh, Saudi Arabia" : "مثل: الرياض، السعودية"}
                />
              </div>

              {/* Deadline */}
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
                >
                  <Save className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {language === "en" ? "Create Project" : "إنشاء المشروع"}
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

