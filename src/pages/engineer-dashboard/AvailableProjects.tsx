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
        
        // Fetch all projects from /api/projects
        // Try with different query parameters to get available projects for engineers
        let response;
        const possibleParams = [
          {}, // Try without params first
          { available: true },
          { isActive: true },
          { status: 'Draft' },
          { available: true, isActive: true },
          { status: 'Draft', isActive: true },
          { forEngineers: true },
          { role: 'engineer' }
        ];
        
        for (const params of possibleParams) {
          try {
            console.log(`🔄 Trying /projects with params:`, params);
            response = await http.get("/projects", { params });
            
            // Extract data to check if we got projects
            const data = response.data?.data || response.data?.projects || response.data?.items || response.data;
            const projectsArray = Array.isArray(data) ? data : (Array.isArray(response.data) ? response.data : []);
            
            if (projectsArray.length > 0) {
              console.log(`✅ Found ${projectsArray.length} projects with params:`, params);
              break; // Success, exit loop
            } else {
              console.log(`⚠️ Empty response with params:`, params);
            }
          } catch (err: any) {
            console.warn(`⚠️ Error with params ${JSON.stringify(params)}:`, err.response?.status || err.message);
            continue;
          }
        }
        
        // If still no response, use the last attempt
        if (!response) {
          response = await http.get("/projects");
        }
        
        // Debug: Log the response structure
        console.log("🔍 Response structure:", {
          type: typeof response.data,
          isArray: Array.isArray(response.data),
          keys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : null,
          data: response.data
        });
        
        // Handle different response structures
        let projectsData = response.data;
        
        // If response.data is already an array, use it directly
        if (Array.isArray(projectsData)) {
          console.log("✅ Response.data is already an array, using it directly");
          // projectsData is already set correctly, no need to change it
        }
        // If response.data is an object with a data property (like {data: [], meta: {}})
        else if (projectsData && typeof projectsData === 'object' && !Array.isArray(projectsData)) {
          // Check if it has a data property that is an array
          if (projectsData.data && Array.isArray(projectsData.data)) {
            console.log("✅ Found projects in response.data.data");
            projectsData = projectsData.data;
          } else if (projectsData.projects && Array.isArray(projectsData.projects)) {
            console.log("✅ Found projects in response.data.projects");
            projectsData = projectsData.projects;
          } else if (projectsData.items && Array.isArray(projectsData.items)) {
            console.log("✅ Found projects in response.data.items");
            projectsData = projectsData.items;
          } else if (projectsData.results && Array.isArray(projectsData.results)) {
            console.log("✅ Found projects in response.data.results");
            projectsData = projectsData.results;
          } else {
            // If it's an object, check if it has array-like structure
            // Sometimes the response might be wrapped in another object
            console.warn("⚠️ Could not find array in response.data. Checking all keys...");
            console.warn("Available keys:", Object.keys(projectsData));
            // Try to find any array property
            const arrayKey = Object.keys(projectsData).find(key => Array.isArray(projectsData[key]));
            if (arrayKey) {
              console.log(`✅ Found array in response.data.${arrayKey}`);
              projectsData = projectsData[arrayKey];
            } else {
              projectsData = [];
            }
          }
        }
        
        // Ensure it's always an array
        if (!Array.isArray(projectsData)) {
          console.warn("⚠️ Projects data is not an array:", typeof projectsData);
          console.warn("⚠️ Projects data value:", projectsData);
          projectsData = [];
        }
        
        console.log(`📊 Total projects fetched: ${projectsData.length}`);
        if (projectsData.length > 0) {
          console.log("📋 First project sample:", projectsData[0]);
        } else {
          console.warn("⚠️ No projects found! Response.data was:", response.data);
        }
        
        // Filter projects on the frontend to show only available projects for engineers
        // Show all projects except those explicitly marked as inactive or completed
        const excludedStatuses = ['Completed', 'completed', 'Cancelled', 'cancelled', 'Rejected', 'rejected', 'closed', 'Closed'];
        const filteredProjects = projectsData.filter((project: any) => {
          // Check if project is explicitly inactive (only exclude if isActive === false)
          const isExplicitlyInactive = project.isActive === false;
          
          // Get status (handle different formats and null/undefined)
          const status = project.status ? project.status.toString().trim() : '';
          
          // Exclude completed/cancelled projects (case-insensitive)
          const isExcludedStatus = status && excludedStatuses.some(excludedStatus => 
            status.toLowerCase() === excludedStatus.toLowerCase()
          );
          
          // Show project if it's not explicitly inactive and not in excluded status
          return !isExplicitlyInactive && !isExcludedStatus;
        });
        
        // Transform projects to match the expected format
        const transformedProjects = filteredProjects.map((project: any) => ({
          id: project._id || project.id,
          title: project.title || project.name || "Unknown Project",
          category: project.category || "N/A", // Keep category separate from projectType
          location: project.location || "N/A",
          description: project.description || "",
          isNew: project.isNew !== undefined ? project.isNew : project.isActive !== false,
          deadline: project.deadline,
          status: project.status,
          requirements: project.requirements,
          projectType: project.projectType || project.category || "N/A", // Use projectType for filtering
          isActive: project.isActive,
        }));
        
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
        // Get both category and projectType for filtering
        const category = (p.category || "").toLowerCase();
        const projectType = (p.projectType || "").toLowerCase();
        const tabLower = activeTab.toLowerCase();
        
        // Map filter values to possible matches (Arabic and English)
        const filterMappings: Record<string, string[]> = {
          architecture: [
            "architecture", "architect", "architectural", "معماري", "معمارية", 
            "الهندسة المعمارية", "هندسة معمارية", "architectural engineering"
          ],
          construction: [
            "construction", "construct", "بناء", "البناء", "construction engineering"
          ],
          civil: [
            "civil", "مدني", "المدنية", "مدنية", "civil engineering", 
            "هندسة مدنية", "الهندسة المدنية"
          ],
          mechanical: [
            "mechanical", "ميكانيكي", "الميكانيكية", "ميكانيكية", 
            "mechanical engineering", "هندسة ميكانيكية", "الهندسة الميكانيكية"
          ]
        };
        
        // Get possible matches for the selected tab
        const possibleMatches = filterMappings[tabLower] || [];
        
        // Check if category or projectType matches any of the possible values
        const matchesCategory = possibleMatches.some(match => 
          category.includes(match.toLowerCase()) || match.toLowerCase().includes(category)
        );
        
        const matchesProjectType = possibleMatches.some(match => 
          projectType.includes(match.toLowerCase()) || match.toLowerCase().includes(projectType)
        );
        
        const shouldInclude = matchesCategory || matchesProjectType;
        
        // Debug logging (can be removed later)
        if (!shouldInclude && availableProjects.length > 0) {
          console.log(`🔍 Filtering project "${p.title}":`, {
            activeTab: tabLower,
            category,
            projectType,
            possibleMatches,
            matchesCategory,
            matchesProjectType,
            shouldInclude
          });
        }
        
        return shouldInclude;
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

