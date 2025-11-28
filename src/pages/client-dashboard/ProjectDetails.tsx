import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, FileText, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock project data
  const project = {
    id: id,
    title: "Residential Building Design",
    type: "Architecture",
    location: "Riyadh, Saudi Arabia",
    status: "inProgress",
    description: "A modern residential building design project requiring expertise in sustainable architecture and urban planning.",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    engineer: {
      name: "Ahmed Al-Mansouri",
      rating: 4.8,
      specializations: ["Architecture", "Urban Planning", "Sustainable Design"],
    },
    proposals: [
      {
        id: 1,
        engineer: "Ahmed Al-Mansouri",
        rating: 4.8,
        specializations: ["Architecture", "Urban Planning"],
        proposal: "I have 10+ years of experience in residential building design...",
        timeline: "5 months",
      },
      {
        id: 2,
        engineer: "Fatima Al-Zahra",
        rating: 4.9,
        specializations: ["Architecture", "Interior Design"],
        proposal: "I specialize in modern residential designs with sustainable practices...",
        timeline: "4 months",
      },
    ],
    files: [
      { name: "Project Brief.pdf", size: "2.4 MB", date: "2024-01-15" },
      { name: "Site Plans.dwg", size: "5.1 MB", date: "2024-01-20" },
      { name: "Requirements.docx", size: "1.2 MB", date: "2024-01-18" },
    ],
    milestones: [
      { title: "Project Kickoff", date: "2024-01-15", status: "completed" },
      { title: "Initial Design", date: "2024-02-15", status: "completed" },
      { title: "Design Review", date: "2024-03-15", status: "inProgress" },
      { title: "Final Approval", date: "2024-04-15", status: "pending" },
    ],
  };

  return (
    <DashboardLayout userType="client">
      <div className="space-y-6">
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
            onClick={() => navigate("/client/projects")}
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-hexa-text-dark">{project.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
                {getDashboardText("inProgress", language)}
              </Badge>
              <span className="text-sm text-hexa-text-light flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {project.location}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-hexa-card border-hexa-border">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {getDashboardText("overview", language)}
            </TabsTrigger>
            <TabsTrigger 
              value="proposals"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {getDashboardText("proposals", language)}
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
            {/* Assigned Engineer Card */}
            {project.engineer && (
              <Card className="bg-hexa-card border-hexa-border border-hexa-secondary/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-hexa-text-dark text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-hexa-secondary animate-pulse"></div>
                    {language === "en" ? "Assigned Engineer" : "المهندس المعين على المشروع"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="flex items-center gap-4 p-4 bg-hexa-bg rounded-lg border border-hexa-border cursor-pointer hover:border-hexa-secondary/60 hover:bg-hexa-secondary/5 transition-all"
                    onClick={() => navigate(`/client/engineers/${project.engineer.id || 1}`)}
                  >
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-hexa-secondary text-black text-xl font-bold">
                        {project.engineer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-lg text-hexa-text-dark hover:text-hexa-secondary transition-colors">{project.engineer.name}</p>
                        <div className="flex items-center gap-1 px-2 py-1 bg-hexa-secondary/20 rounded-md">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-hexa-text-dark">{project.engineer.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.engineer.specializations.map((spec, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="bg-hexa-secondary/10 text-hexa-secondary border-hexa-secondary/30"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark">{language === "en" ? "Project Information" : "معلومات المشروع"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">{getDashboardText("projectType", language)}</p>
                  <p className="font-medium text-hexa-text-dark">{project.type}</p>
                </div>
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">{language === "en" ? "Description" : "الوصف"}</p>
                  <p className="text-hexa-text-dark">{project.description}</p>
                </div>
                <div>
                  <p className="text-sm text-hexa-text-light mb-2">{language === "en" ? "Timeline" : "الجدول الزمني"}</p>
                  <p className="font-medium text-hexa-text-dark">{project.startDate} - {project.endDate}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-4">
            {project.proposals.map((proposal) => (
              <Card key={proposal.id} className="bg-hexa-card border-hexa-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-hexa-secondary text-black">
                          {proposal.engineer.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-hexa-text-dark">{proposal.engineer}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-hexa-text-light">{proposal.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-hexa-text-light mb-2">{getDashboardText("specializations", language)}</p>
                    <div className="flex flex-wrap gap-2">
                      {proposal.specializations.map((spec, idx) => (
                        <Badge key={idx} variant="outline" className="border-hexa-border bg-hexa-bg text-hexa-text-light">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-hexa-text-light mb-2">{language === "en" ? "Proposal" : "العرض"}</p>
                    <p className="text-hexa-text-dark">{proposal.proposal}</p>
                  </div>
                  <div className="pt-2 border-t border-hexa-border">
                    <div>
                      <p className="text-sm text-hexa-text-light">{language === "en" ? "Timeline" : "الجدول الزمني"}</p>
                      <p className="font-medium text-hexa-text-dark">{proposal.timeline}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark">{getDashboardText("filesAttachments", language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors bg-hexa-card border">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-hexa-secondary" />
                        <div>
                          <p className="font-medium text-hexa-text-dark">{file.name}</p>
                          <p className="text-sm text-hexa-text-light">{file.size} • {file.date}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
                      >
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

export default ProjectDetails;

