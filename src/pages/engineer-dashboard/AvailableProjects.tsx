import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const AvailableProjects = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Try different endpoints and query parameters
        let response;
        try {
          // First try engineer-specific endpoint with query params
          response = await http.get("/engineer/projects", {
            params: {
              available: true,
              isActive: true,
              status: ['Draft', 'Pending Review', 'Active'].join(',')
            }
          });
        } catch (err: any) {
          // If that fails, try the general projects endpoint with query params
          if (err.response?.status === 404 || err.response?.status === 400) {
            try {
              response = await http.get("/projects", {
                params: {
                  available: true,
                  isActive: true
                }
              });
            } catch (err2: any) {
              // If that also fails, try without params
              response = await http.get("/projects");
            }
          } else {
            throw err;
          }
        }
        
        // Log the response for debugging
        console.log("Projects API Response:", response.data);
        console.log("Full response:", response);
        
        // Handle different response structures
        let projectsData = response.data;
        
        // If response.data is an object with a data property (like {data: [], meta: {}})
        if (projectsData && typeof projectsData === 'object' && !Array.isArray(projectsData)) {
          // Check if it has a data property that is an array
          if (projectsData.data && Array.isArray(projectsData.data)) {
            projectsData = projectsData.data;
          } else if (projectsData.projects && Array.isArray(projectsData.projects)) {
            projectsData = projectsData.projects;
          } else if (projectsData.items && Array.isArray(projectsData.items)) {
            projectsData = projectsData.items;
          } else {
            // If it's an object but not an array, try to extract array from it
            projectsData = [];
            console.warn("Could not find array in response.data:", projectsData);
          }
        }
        
        // Ensure it's always an array
        if (!Array.isArray(projectsData)) {
          console.warn("Projects data is not an array:", projectsData);
          projectsData = [];
        }
        
        console.log("Processed projects data:", projectsData);
        console.log("Projects count:", projectsData.length);
        
        // If no projects found, log warning
        if (projectsData.length === 0) {
          console.warn("⚠️ No projects found in API response!");
          console.warn("Response structure:", response.data);
          console.warn("This might mean:");
          console.warn("1. Backend is filtering projects based on user role");
          console.warn("2. Projects are not active or available for engineers");
          console.warn("3. Need different endpoint or query parameters");
        }
        
        // Transform projects to match the expected format
        // Based on the database schema: _id, title, description, location, category, etc.
        const transformedProjects = projectsData.map((project: any) => ({
          id: project._id || project.id,
          title: project.title || project.name || "Unknown Project",
          category: project.category || project.projectType || "N/A",
          location: project.location || "N/A",
          description: project.description || "",
          isNew: project.isNew !== undefined ? project.isNew : project.isActive !== false,
          deadline: project.deadline,
          status: project.status,
          requirements: project.requirements,
          projectType: project.projectType,
          isActive: project.isActive,
        }));
        
        console.log("Transformed projects:", transformedProjects);
        console.log("Number of projects:", transformedProjects.length);
        
        // Filter out inactive projects if needed (optional - you can remove this if you want to show all)
        // const activeProjects = transformedProjects.filter(p => p.isActive !== false);
        // setAvailableProjects(activeProjects);
        
        setAvailableProjects(transformedProjects);
      } catch (error: any) {
        console.error("Error fetching projects:", error);
        console.error("Error response:", error.response);
        // Show error message
        if (error.response?.status !== 404) {
          toast.error(
            language === "en" 
              ? `Failed to load projects: ${error.response?.data?.message || error.message}` 
              : `فشل تحميل المشاريع: ${error.response?.data?.message || error.message}`
          );
        }
        setAvailableProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [language]);

  const filteredProjects = activeTab === "all"
    ? availableProjects
    : availableProjects.filter(p => {
        const categoryLower = (p.category || "").toLowerCase();
        const tabLower = activeTab.toLowerCase();
        return categoryLower.includes(tabLower) || 
               (tabLower === "architecture" && categoryLower.includes("architect")) ||
               (tabLower === "construction" && categoryLower.includes("construct")) ||
               (tabLower === "civil" && categoryLower.includes("civil")) ||
               (tabLower === "mechanical" && categoryLower.includes("mechanical"));
      });

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
                {getDashboardText("browseProjects", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("browseProjects", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Browse and apply to available projects" : "تصفح والتقدم للمشاريع المتاحة"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full max-w-2xl grid-cols-5 bg-hexa-card border-hexa-border ${language === "ar" ? "ml-auto" : "mr-auto"}`}>
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {language === "en" ? "All" : "الكل"}
            </TabsTrigger>
            <TabsTrigger 
              value="architecture"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {language === "en" ? "Architecture" : "الهندسة المعمارية"}
            </TabsTrigger>
            <TabsTrigger 
              value="construction"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {language === "en" ? "Construction" : "البناء"}
            </TabsTrigger>
            <TabsTrigger 
              value="civil"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {language === "en" ? "Civil" : "المدنية"}
            </TabsTrigger>
            <TabsTrigger 
              value="mechanical"
              className="data-[state=active]:bg-hexa-secondary data-[state=active]:text-black data-[state=active]:font-semibold text-hexa-text-light"
            >
              {language === "en" ? "Mechanical" : "الميكانيكية"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-hexa-text-light">
                {language === "en" ? "Loading projects..." : "جاري تحميل المشاريع..."}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-hexa-text-light">
                <p className="mb-2">{language === "en" ? "No projects available" : "لا توجد مشاريع متاحة"}</p>
                {availableProjects.length > 0 && (
                  <p className="text-sm">
                    {language === "en" 
                      ? `Found ${availableProjects.length} project(s) but none match the selected filter.` 
                      : `تم العثور على ${availableProjects.length} مشروع ولكن لا يوجد أي منها يطابق الفلتر المحدد.`}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-xl hover:border-hexa-secondary/60 transition-all duration-300 bg-hexa-card border-hexa-border">
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      {/* Left Section - Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <CardTitle className="text-lg font-bold text-hexa-text-dark line-clamp-2 flex-1">{project.title}</CardTitle>
                          {project.isNew && (
                            <Badge className="bg-hexa-secondary text-black font-bold flex-shrink-0">
                              {getDashboardText("newProject", language)}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-2 mb-4 text-hexa-text-light">
                          <MapPin className="w-4 h-4 text-hexa-secondary" />
                          {project.location}
                        </CardDescription>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-hexa-text-light mb-1">
                              {getDashboardText("category", language)}
                            </p>
                            <Badge variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border">{project.category}</Badge>
                          </div>
                          {project.description && (
                            <div>
                              <p className="text-sm text-hexa-text-light mb-1">
                                {getDashboardText("shortDescription", language)}
                              </p>
                              <p className="text-sm text-hexa-text-dark line-clamp-2">
                                {project.description}
                              </p>
                            </div>
                          )}
                          {project.deadline && (
                            <div>
                              <p className="text-sm text-hexa-text-light mb-1">
                                {language === "en" ? "Deadline" : "الموعد النهائي"}
                              </p>
                              <p className="text-sm text-hexa-text-dark">
                                {new Date(project.deadline).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Right Section - Actions */}
                      <div className="flex flex-col justify-center gap-3 md:w-auto w-full md:border-s md:border-hexa-border md:ps-6 pt-4 md:pt-0 border-t md:border-t-0 border-hexa-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/engineer/projects/${project.id}`)}
                          className="w-full md:w-auto border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary transition-all"
                        >
                          <Eye className="w-4 h-4 ms-2" />
                          {getDashboardText("viewDetails", language)}
                        </Button>
                        <Button
                          onClick={() => navigate(`/engineer/projects/${project.id}/proposal`)}
                          className="w-full md:w-auto bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold"
                        >
                          <FileText className="w-4 h-4 ms-2" />
                          {getDashboardText("submitProposal", language)}
                        </Button>
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

export default AvailableProjects;

