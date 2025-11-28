import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, MessageSquare, Star } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const EngineerProjects = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const projects = [
    {
      id: 1,
      title: "Residential Building Design",
      category: "Architecture",
      location: "Riyadh, Saudi Arabia",
      status: "inProgress",
    },
    {
      id: 2,
      title: "Office Complex Construction",
      category: "Construction",
      location: "Dubai, UAE",
      status: "waitingForAdminDecision",
    },
    {
      id: 3,
      title: "Bridge Engineering Project",
      category: "Civil Engineering",
      location: "Jeddah, Saudi Arabia",
      status: "completed",
      rating: 4.8,
      review: language === "en" ? "Excellent work! Very professional." : "عمل ممتاز! محترف جداً.",
      completedDate: "2024-01-15",
    },
    {
      id: 4,
      title: "Industrial Warehouse Design",
      category: "Mechanical Engineering",
      location: "Dammam, Saudi Arabia",
      status: "completed",
      rating: 5.0,
      review: language === "en" ? "Outstanding quality and attention to detail." : "جودة استثنائية واهتمام بالتفاصيل.",
      completedDate: "2024-01-10",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      waitingForAdminDecision: {
        label: getDashboardText("waitingForAdminDecision", language),
        variant: "outline",
      },
      inProgress: { label: getDashboardText("inProgress", language), variant: "default" },
      completed: { label: getDashboardText("completed", language), variant: "default" },
    };
    const statusInfo = statusMap[status] || statusMap.waitingForAdminDecision;
    return (
      <Badge variant={statusInfo.variant} className="bg-hexa-secondary/10 text-hexa-secondary border-hexa-secondary/20">
        {statusInfo.label}
      </Badge>
    );
  };

  const filteredProjects = activeTab === "all"
    ? projects
    : projects.filter(p => p.status === activeTab);

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
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("myProjects", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("myProjects", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Track and manage your projects" : "تتبع وإدارة مشاريعك"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-hexa-card border-hexa-border mb-6 gap-1 p-1">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light px-3 py-2 text-sm"
            >
              {language === "en" ? "All" : "الكل"}
            </TabsTrigger>
            <TabsTrigger 
              value="waitingForAdminDecision"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light px-3 py-2 text-sm"
            >
              {getDashboardText("waitingForAdminDecision", language)}
            </TabsTrigger>
            <TabsTrigger 
              value="inProgress"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light px-3 py-2 text-sm"
            >
              {getDashboardText("inProgress", language)}
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light px-3 py-2 text-sm"
            >
              {getDashboardText("completed", language)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid gap-6 grid-cols-1">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-xl hover:border-hexa-secondary/60 transition-all duration-300 bg-hexa-card border-hexa-border">
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* Left Section - Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <CardTitle className="text-lg font-bold text-hexa-text-dark line-clamp-2 flex-1">{project.title}</CardTitle>
                        <div className="flex-shrink-0">
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2 mb-4 text-hexa-text-light">
                        <MapPin className="w-4 h-4 text-hexa-secondary" />
                        {project.location}
                      </CardDescription>
                      {project.status === "completed" && project.rating && (
                        <div className="p-3 rounded-lg bg-hexa-bg border border-hexa-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(project.rating!)
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-hexa-text-light"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-hexa-text-dark">{project.rating}</span>
                          </div>
                          {project.review && (
                            <p className="text-xs text-hexa-text-light italic line-clamp-2">"{project.review}"</p>
                          )}
                          {project.completedDate && (
                            <p className="text-xs text-hexa-text-light mt-2">
                              {language === "en" ? `Completed: ${project.completedDate}` : `مكتمل: ${project.completedDate}`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Right Section - Actions */}
                    {project.status === "inProgress" && (
                      <div className="flex flex-col justify-center gap-3 md:w-auto w-full md:border-s md:border-hexa-border md:ps-6 pt-4 md:pt-0 border-t md:border-t-0 border-hexa-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/engineer/messages?project=${project.id}`)}
                          className="w-full md:w-auto border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary transition-all"
                          title={getDashboardText("chat", language)}
                        >
                          <MessageSquare className="w-4 h-4 ms-2" />
                          {getDashboardText("chat", language)}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EngineerProjects;

