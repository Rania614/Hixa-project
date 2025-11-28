import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, MessageSquare, FileText, Eye, Plus } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ClientProjects = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // Mock projects data
  const projects = [
    {
      id: 1,
      title: "Residential Building Design",
      type: "Architecture",
      location: "Riyadh, Saudi Arabia",
      status: "inProgress",
      engineer: "Ahmed Al-Mansouri",
      proposals: 5,
    },
    {
      id: 2,
      title: "Office Complex Construction",
      type: "Construction",
      location: "Dubai, UAE",
      status: "waitingForEngineers",
      engineer: null,
      proposals: 12,
    },
    {
      id: 3,
      title: "Bridge Engineering Project",
      type: "Civil Engineering",
      location: "Jeddah, Saudi Arabia",
      status: "pendingReview",
      engineer: null,
      proposals: 0,
    },
    {
      id: 4,
      title: "Industrial Plant Design",
      type: "Mechanical Engineering",
      location: "Dammam, Saudi Arabia",
      status: "completed",
      engineer: "Fatima Al-Zahra",
      proposals: 8,
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pendingReview: { label: getDashboardText("pendingReview", language), variant: "outline" },
      waitingForEngineers: { label: getDashboardText("waitingForEngineers", language), variant: "secondary" },
      inProgress: { label: getDashboardText("inProgress", language), variant: "default" },
      completed: { label: getDashboardText("completed", language), variant: "default" },
    };
    const statusInfo = statusMap[status] || statusMap.pendingReview;
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
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("myProjects", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-hexa-text-dark">
              {getDashboardText("myProjects", language)}
            </h1>
            <p className="text-hexa-text-light mt-1">
              {language === "en" ? "Manage all your projects" : "إدارة جميع مشاريعك"}
            </p>
          </div>
          <Button
            onClick={() => navigate("/client/projects/new")}
            className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black shadow-md font-semibold"
          >
            <Plus className="w-4 h-4 ms-2" />
            {getDashboardText("createNewProject", language)}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-hexa-card border-hexa-border gap-1 p-1">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light px-3 py-2 text-sm"
            >
              {language === "en" ? "All" : "الكل"}
            </TabsTrigger>
            <TabsTrigger 
              value="pendingReview"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light px-3 py-2 text-sm"
            >
              {getDashboardText("pendingReview", language)}
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

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-6 grid-cols-1">
              {filteredProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="group hover:shadow-xl hover:border-hexa-secondary/60 transition-all duration-300 cursor-pointer bg-hexa-card border-hexa-border overflow-hidden"
                  onClick={() => navigate(`/client/projects/${project.id}`)}
                >
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* Left Section - Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-hexa-text-dark line-clamp-2 mb-2 group-hover:text-hexa-secondary transition-colors">
                            {project.title}
                          </CardTitle>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-hexa-text-light mb-4">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-hexa-secondary" />
                        <span className="text-sm truncate">{project.location}</span>
                      </CardDescription>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-hexa-bg/50">
                          <div className="w-10 h-10 rounded-lg bg-hexa-secondary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-hexa-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-hexa-text-light mb-0.5">
                              {getDashboardText("projectType", language)}
                            </p>
                            <p className="text-sm font-semibold text-hexa-text-dark truncate">
                              {project.type}
                            </p>
                          </div>
                        </div>
                        {project.engineer && (
                          <div 
                            className="flex items-center gap-3 p-3 rounded-lg bg-hexa-bg/50 cursor-pointer hover:bg-hexa-secondary/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/client/engineers/${project.id}`);
                            }}
                          >
                            <div className="w-10 h-10 rounded-lg bg-hexa-secondary/10 flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-5 h-5 text-hexa-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-hexa-text-light mb-0.5">
                                {language === "en" ? "Assigned Engineer" : "المهندس المعين"}
                              </p>
                              <p className="text-sm font-semibold text-hexa-text-dark truncate hover:text-hexa-secondary transition-colors">
                                {project.engineer}
                              </p>
                            </div>
                          </div>
                        )}
                        {project.proposals > 0 && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-hexa-bg/50">
                            <div className="w-10 h-10 rounded-lg bg-hexa-secondary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-hexa-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-hexa-text-light mb-0.5">
                                {getDashboardText("proposals", language)}
                              </p>
                              <p className="text-sm font-semibold text-hexa-text-dark">
                                {project.proposals} {language === "en" ? "proposals" : "عروض"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Right Section - Actions */}
                    <div className="flex flex-col justify-center gap-3 md:w-auto w-full md:border-s md:border-hexa-border md:ps-6 pt-4 md:pt-0 border-t md:border-t-0 border-hexa-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/client/projects/${project.id}`);
                        }}
                        className="w-full md:w-auto border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary transition-all text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 ms-2" />
                        {getDashboardText("viewDetails", language)}
                      </Button>
                      {project.status === "inProgress" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/client/messages?project=${project.id}`);
                          }}
                          className="w-full md:w-auto border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary transition-all px-4"
                          title={getDashboardText("chat", language)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
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

export default ClientProjects;

