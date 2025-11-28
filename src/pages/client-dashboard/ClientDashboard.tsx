import React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Clock, MessageSquare, FolderKanban, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const ClientDashboard = () => {
  const { language } = useApp();
  const navigate = useNavigate();

  // Mock project data
  const activeProjects = [
    {
      id: 1,
      title: "Residential Building Design",
      type: "Architecture",
      location: "Riyadh, Saudi Arabia",
      status: "inProgress",
      engineer: "Ahmed Al-Mansouri",
    },
    {
      id: 2,
      title: "Office Complex Construction",
      type: "Construction",
      location: "Dubai, UAE",
      status: "waitingForEngineers",
      engineer: null,
    },
    {
      id: 3,
      title: "Bridge Engineering Project",
      type: "Civil Engineering",
      location: "Jeddah, Saudi Arabia",
      status: "pendingReview",
      engineer: null,
    },
    {
      id: 4,
      title: "Industrial Plant Design",
      type: "Mechanical Engineering",
      location: "Dammam, Saudi Arabia",
      status: "completed",
      engineer: "Fatima Al-Zahra",
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
      <Badge variant={statusInfo.variant} className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
        {statusInfo.label}
      </Badge>
    );
  };

  // Calculate stats
  const stats = {
    total: activeProjects.length,
    inProgress: activeProjects.filter(p => p.status === "inProgress").length,
    pending: activeProjects.filter(p => p.status === "pendingReview" || p.status === "waitingForEngineers").length,
    completed: activeProjects.filter(p => p.status === "completed").length,
  };

  return (
    <DashboardLayout userType="client">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("clientDashboard", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("clientDashboard", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Manage your projects and connect with engineers" : "إدارة مشاريعك والتواصل مع المهندسين"}
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-hexa-card border-hexa-border hover:border-hexa-secondary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hexa-text-light mb-1">
                    {language === "en" ? "Total Projects" : "إجمالي المشاريع"}
                  </p>
                  <p className="text-2xl font-bold text-hexa-text-dark">{stats.total}</p>
                </div>
                <div className="p-3 bg-hexa-secondary/20 rounded-lg">
                  <FolderKanban className="w-6 h-6 text-hexa-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-hexa-card border-hexa-border hover:border-hexa-secondary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hexa-text-light mb-1">
                    {getDashboardText("inProgress", language)}
                  </p>
                  <p className="text-2xl font-bold text-hexa-text-dark">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-hexa-secondary/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-hexa-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-hexa-card border-hexa-border hover:border-hexa-secondary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hexa-text-light mb-1">
                    {language === "en" ? "Pending" : "قيد الانتظار"}
                  </p>
                  <p className="text-2xl font-bold text-hexa-text-dark">{stats.pending}</p>
                </div>
                <div className="p-3 bg-hexa-secondary/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-hexa-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-hexa-card border-hexa-border hover:border-hexa-secondary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hexa-text-light mb-1">
                    {getDashboardText("completed", language)}
                  </p>
                  <p className="text-2xl font-bold text-hexa-text-dark">{stats.completed}</p>
                </div>
                <div className="p-3 bg-hexa-secondary/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-hexa-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects Section */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-hexa-text-dark text-xl">
                {getDashboardText("activeProjects", language)}
              </CardTitle>
              <CardDescription className="text-hexa-text-light mt-1">
                {language === "en" ? "View and manage your active projects" : "عرض وإدارة مشاريعك النشطة"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/client/projects")}
              className="border-hexa-border bg-hexa-card text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary"
            >
              {language === "en" ? "View All" : "عرض الكل"}
            </Button>
          </CardHeader>
          <CardContent>
            {activeProjects.length > 0 ? (
              <div className="grid gap-6 grid-cols-1">
                {activeProjects.slice(0, 6).map((project) => (
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
                        
                        {/* Location */}
                        <div className="flex items-center gap-2 text-hexa-text-light mb-4">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-hexa-secondary" />
                          <span className="text-sm truncate">{project.location}</span>
                        </div>

                        {/* Project Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-hexa-bg/50">
                            <div className="w-10 h-10 rounded-lg bg-hexa-secondary/10 flex items-center justify-center flex-shrink-0">
                              <FolderKanban className="w-5 h-5 text-hexa-secondary" />
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
                                <Clock className="w-5 h-5 text-hexa-secondary" />
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
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="w-16 h-16 text-hexa-text-light mx-auto mb-4 opacity-50" />
                <p className="text-hexa-text-light mb-4">
                  {language === "en" ? "No projects yet" : "لا توجد مشاريع بعد"}
                </p>
                <Button
                  onClick={() => navigate("/client/projects/new")}
                  className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black"
                >
                  <Plus className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {getDashboardText("createNewProject", language)}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;

