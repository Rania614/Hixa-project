import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, FileText, Download, Eye } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const EngineerProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock project data
  const project = {
    id: id,
    title: "Modern Office Building Design",
    category: "Architecture",
    location: "Riyadh, Saudi Arabia",
    description: "Looking for an experienced architect to design a modern office building with sustainable features. The project requires expertise in sustainable architecture and urban planning.",
    requirements: "Minimum 5 years of experience in commercial building design. Must have portfolio of similar projects.",
    deadline: "2024-06-30",
    files: [
      { name: "Project Brief.pdf", size: "2.4 MB", date: "2024-01-15" },
      { name: "Site Plans.dwg", size: "5.1 MB", date: "2024-01-20" },
      { name: "Requirements.docx", size: "1.2 MB", date: "2024-01-18" },
    ],
  };

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-6">
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
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {project.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/engineer/available-projects")}
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-hexa-text-dark">{project.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-hexa-secondary text-black font-bold">
                {getDashboardText("newProject", language)}
              </Badge>
              <span className="text-sm text-hexa-text-light flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {project.location}
              </span>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/engineer/projects/${project.id}/proposal`)}
            className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold"
          >
            <FileText className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
            {getDashboardText("submitProposal", language)}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-hexa-card border-hexa-border">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {getDashboardText("overview", language)}
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {getDashboardText("filesAttachments", language)}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark">
                  {language === "en" ? "Project Information" : "معلومات المشروع"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">
                    {getDashboardText("category", language)}
                  </p>
                  <Badge variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border">
                    {project.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">
                    {language === "en" ? "Description" : "الوصف"}
                  </p>
                  <p className="text-hexa-text-dark">{project.description}</p>
                </div>
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">
                    {language === "en" ? "Requirements" : "المتطلبات"}
                  </p>
                  <p className="text-hexa-text-dark">{project.requirements}</p>
                </div>
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">
                    {language === "en" ? "Expected Deadline" : "الموعد المتوقع"}
                  </p>
                  <p className="font-medium text-hexa-text-dark">{project.deadline}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark">
                  {getDashboardText("filesAttachments", language)}
                </CardTitle>
                <CardDescription className="text-hexa-text-light">
                  {language === "en" ? "Download project files and documents" : "تحميل ملفات ومستندات المشروع"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-hexa-secondary/20 rounded-lg">
                          <FileText className="w-5 h-5 text-hexa-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-hexa-text-dark">{file.name}</p>
                          <p className="text-sm text-hexa-text-light">
                            {file.size} • {file.date}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
                      >
                        <Download className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                        {language === "en" ? "Download" : "تحميل"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EngineerProjectDetails;

