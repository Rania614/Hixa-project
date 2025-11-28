import React, { useState } from "react";
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

const SubmitProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    proposal: "",
    timeline: "",
    experience: "",
  });

  // Mock project data
  const project = {
    id: id,
    title: "Modern Office Building Design",
    category: "Architecture",
    location: "Riyadh, Saudi Arabia",
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle proposal submission
    console.log("Proposal submitted:", formData);
    navigate("/engineer/projects");
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
                <Label htmlFor="proposal" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Proposal Description" : "وصف العرض"} *
                </Label>
                <Textarea
                  id="proposal"
                  name="proposal"
                  value={formData.proposal}
                  onChange={handleInputChange}
                  required
                  rows={8}
                  className="min-h-[160px] bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light resize-none"
                  placeholder={language === "en" ? "Describe your approach, experience, and why you're the best fit for this project..." : "اوصف نهجك وخبرتك ولماذا أنت الأنسب لهذا المشروع..."}
                />
              </div>

              {/* Timeline */}
              <div className="space-y-2.5">
                <Label htmlFor="timeline" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Estimated Timeline" : "الجدول الزمني المتوقع"} *
                </Label>
                <Input
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  required
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  placeholder={language === "en" ? "e.g., 3 months, 6 months" : "مثل: 3 أشهر، 6 أشهر"}
                />
              </div>

              {/* Relevant Experience */}
              <div className="space-y-2.5">
                <Label htmlFor="experience" className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Relevant Experience" : "الخبرة ذات الصلة"}
                </Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={5}
                  className="min-h-[100px] bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light resize-none"
                  placeholder={language === "en" ? "Describe your relevant experience and similar projects you've completed..." : "اوصف خبرتك ذات الصلة والمشاريع المشابهة التي أكملتها..."}
                />
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
                  className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11 px-6"
                >
                  <Save className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {getDashboardText("submitProposal", language)}
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

