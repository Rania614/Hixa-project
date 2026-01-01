import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, MessageSquare, FileText, Eye, Plus, Loader2, X } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { http } from "@/services/http";
import { toast } from "@/components/ui/sonner";

const ClientProjects = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingProjectId, setCancellingProjectId] = useState<string | null>(null);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Try different possible endpoints (baseURL already includes /api)
      let response;
      const possibleEndpoints = [
        '/projects',  // Try /projects first (most common)
        '/client/projects',  // Try /client/projects as fallback
      ];
      
      let lastError;
      for (const endpoint of possibleEndpoints) {
        try {
          response = await http.get(endpoint);
          if (response && response.data) {
            console.log(`✅ Successfully fetched from ${endpoint}`);
            break; // Success, exit loop
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`⚠️ Failed to fetch from ${endpoint}:`, err.response?.status || err.message);
          // Continue to next endpoint
          continue;
        }
      }
      
      if (!response || !response.data) {
        throw lastError || new Error('No valid endpoint found');
      }
      
      // Transform API data to match component structure
      const projectsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.projects || response.data.items || response.data.data || []);
      
      const transformedProjects = projectsData.map((project: any) => {
        const mappedStatus = mapStatusToComponent(project.status);
        console.log('🔍 Project status mapping:', {
          original: project.status,
          mapped: mappedStatus,
          projectTitle: project.title || project.name
        });
        
        return {
          id: project._id || project.id,
          title: project.title || project.name || '',
          type: project.projectType || project.category || project.type || '',
          location: project.location || '',
          status: mappedStatus, // Use mapped status, don't let original override it
          engineer: project.assignedEngineer?.name || project.assignedEngineer || null,
          proposals: project.proposalsCount || project.proposals?.length || 0,
          description: project.description || '',
          requirements: project.requirements || '',
          budget: project.budget || null,
          deadline: project.deadline || null,
          attachments: project.attachments || [],
          tags: project.tags || [],
          isActive: project.isActive !== false,
          // Keep original data but exclude status to prevent override
          ...Object.fromEntries(
            Object.entries(project).filter(([key]) => key !== 'status')
          )
        };
      });
      
      setProjects(transformedProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      const errorMessage = error.response?.data?.message || error.message || '';
      
      // Don't show error toast if it's just a 404 - endpoint might not be implemented yet
      if (error.response?.status !== 404) {
        toast.error(
          language === 'en' 
            ? `Failed to load projects${errorMessage ? ': ' + errorMessage : ''}` 
            : `فشل تحميل المشاريع${errorMessage ? ': ' + errorMessage : ''}`
        );
      } else {
        console.warn('Projects endpoint not found - this is expected if backend endpoint is not implemented yet');
      }
      
      // Keep empty array on error
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Cancel project
  const handleCancelProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    const confirmMessage = language === "en" 
      ? "Are you sure you want to cancel this project? This action cannot be undone."
      : "هل أنت متأكد من إلغاء هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.";
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      setCancellingProjectId(projectId);
      await http.patch(`/projects/${projectId}/cancel`);
      toast.success(
        language === "en" 
          ? "Project cancelled successfully" 
          : "تم إلغاء المشروع بنجاح"
      );
      // Refresh projects list
      fetchProjects();
    } catch (error: any) {
      console.error("Error cancelling project:", error);
      const errorMessage = error.response?.data?.message || 
        (language === "en" ? "Failed to cancel project" : "فشل إلغاء المشروع");
      toast.error(errorMessage);
    } finally {
      setCancellingProjectId(null);
    }
  };

  // Map API status to component status
  const mapStatusToComponent = (status: string) => {
    if (!status) return 'pendingReview';
    
    const statusLower = status.toLowerCase().trim();
    console.log('🔍 Mapping status:', { original: status, lower: statusLower });
    
    const statusMap: Record<string, string> = {
      'draft': 'pendingReview',
      'pending': 'pendingReview',
      'pending review': 'pendingReview',
      'pending_review': 'pendingReview',
      'waiting for engineers': 'waitingForEngineers',
      'waiting_for_engineers': 'waitingForEngineers',
      'waiting': 'waitingForEngineers',
      'in progress': 'inProgress',
      'in_progress': 'inProgress',
      'inprogress': 'inProgress',
      'active': 'inProgress',
      'completed': 'completed',
      'done': 'completed',
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
      'review': 'pendingReview'
    };
    
    const mapped = statusMap[statusLower] || 'pendingReview';
    console.log('🔍 Mapped result:', mapped);
    return mapped;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pendingReview: { label: getDashboardText("pendingReview", language), variant: "outline" },
      waitingForEngineers: { label: getDashboardText("waitingForEngineers", language), variant: "secondary" },
      inProgress: { label: getDashboardText("inProgress", language), variant: "default" },
      completed: { label: getDashboardText("completed", language), variant: "default" },
      cancelled: { label: language === "en" ? "Cancelled" : "ملغي", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || statusMap.pendingReview;
    return (
      <Badge variant={statusInfo.variant} className={status === "cancelled" 
        ? "bg-red-500/10 text-red-500 border-red-500/20" 
        : "bg-hexa-secondary/10 text-hexa-secondary border-hexa-secondary/20"}>
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-hexa-secondary" />
                <span className="ml-3 text-hexa-text-light">
                  {language === "en" ? "Loading projects..." : "جاري تحميل المشاريع..."}
                </span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-hexa-text-light text-lg">
                  {language === "en" ? "No projects found" : "لا توجد مشاريع"}
                </p>
                <Button
                  onClick={() => navigate("/client/projects/new")}
                  className="mt-4 bg-hexa-secondary hover:bg-hexa-secondary/90 text-black shadow-md font-semibold"
                >
                  <Plus className="w-4 h-4 ms-2" />
                  {getDashboardText("createNewProject", language)}
                </Button>
              </div>
            ) : (
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
                      {/* Cancel Project Button - Only show if project is not completed or cancelled */}
                      {project.status !== "Completed" && 
                       project.status !== "Cancelled" && 
                       project.status !== "cancelled" && 
                       project.status !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleCancelProject(project.id, e)}
                          disabled={cancellingProjectId === project.id}
                          className="w-full md:w-auto border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 hover:border-red-500 transition-all text-sm font-medium"
                        >
                          <X className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                          {cancellingProjectId === project.id
                            ? (language === "en" ? "Cancelling..." : "جاري الإلغاء...")
                            : (language === "en" ? "Cancel" : "إلغاء")
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientProjects;

