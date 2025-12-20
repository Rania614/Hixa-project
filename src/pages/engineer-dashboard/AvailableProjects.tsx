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
        let projectsData: any[] = [];
        
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
        
        // Try each parameter set until we find one that returns projects
        for (const params of possibleParams) {
          try {
            console.log(`🔄 Trying /projects with params:`, params);
            response = await http.get("/projects", { params });
            
            // Handle different response structures
            let tempData = response.data;
            
            // If response.data is already an array, use it directly
            if (Array.isArray(tempData)) {
              projectsData = tempData;
            }
            // If response.data is an object with a data property (like {data: [], meta: {}})
            else if (tempData && typeof tempData === 'object' && !Array.isArray(tempData)) {
              if (tempData.data && Array.isArray(tempData.data)) {
                projectsData = tempData.data;
              } else if (tempData.projects && Array.isArray(tempData.projects)) {
                projectsData = tempData.projects;
              } else if (tempData.items && Array.isArray(tempData.items)) {
                projectsData = tempData.items;
              } else if (tempData.results && Array.isArray(tempData.results)) {
                projectsData = tempData.results;
              } else {
                // Try to find any array property
                const arrayKey = Object.keys(tempData).find(key => Array.isArray(tempData[key]));
                if (arrayKey) {
                  projectsData = tempData[arrayKey];
                }
              }
            }
            
            // Only break if we actually got projects
            if (projectsData.length > 0) {
              console.log(`✅ Found ${projectsData.length} projects with params:`, params);
              break; // Success, exit loop
            } else {
              console.log(`⚠️ Empty response with params:`, params);
              console.log(`⚠️ Full response structure:`, {
                responseData: response.data,
                responseDataKeys: response.data ? Object.keys(response.data) : null,
                responseDataType: typeof response.data,
                isArray: Array.isArray(response.data),
                meta: response.data?.meta,
                total: response.data?.meta?.total,
                count: response.data?.meta?.count,
              });
            }
          } catch (err: any) {
            console.warn(`⚠️ Error with params ${JSON.stringify(params)}:`, err.response?.status || err.message);
            continue;
          }
        }
        
        // If still no projects found, try one more time without params
        if (projectsData.length === 0 && !response) {
          try {
            console.log("🔄 Final attempt: /projects without params");
            response = await http.get("/projects");
            
            let tempData = response.data;
            if (Array.isArray(tempData)) {
              projectsData = tempData;
            } else if (tempData?.data && Array.isArray(tempData.data)) {
              projectsData = tempData.data;
            } else if (tempData?.projects && Array.isArray(tempData.projects)) {
              projectsData = tempData.projects;
            }
          } catch (err: any) {
            console.error("❌ Final attempt failed:", err);
          }
        }
        
        // Debug: Log the final result
        console.log("🔍 Final projects data:", {
          count: projectsData.length,
          sample: projectsData.length > 0 ? projectsData[0] : null,
          fullResponse: response?.data
        });
        
        if (projectsData.length === 0) {
          console.warn("⚠️ No projects found! Full response:", response?.data);
          console.warn("⚠️ This might be a backend issue - check if projects exist in database");
        }
        
        // Filter projects on the frontend to show only available projects for engineers
        // Show all projects except those explicitly marked as inactive or completed
        const excludedStatuses = ['Completed', 'completed', 'Cancelled', 'cancelled', 'Rejected', 'rejected', 'closed', 'Closed'];
        const filteredProjects = projectsData.filter((project: any) => {
          // Log each project for debugging
          console.log("🔍 Checking project:", {
            id: project._id || project.id,
            title: project.title || project.name,
            isActive: project.isActive,
            status: project.status,
          });
          
          // Check if project is explicitly inactive (only exclude if isActive === false)
          const isExplicitlyInactive = project.isActive === false;
          
          // Get status (handle different formats and null/undefined)
          const status = project.status ? project.status.toString().trim() : '';
          
          // Exclude completed/cancelled projects (case-insensitive)
          const isExcludedStatus = status && excludedStatuses.some(excludedStatus => 
            status.toLowerCase() === excludedStatus.toLowerCase()
          );
          
          // Show project if it's not explicitly inactive and not in excluded status
          const shouldInclude = !isExplicitlyInactive && !isExcludedStatus;
          
          if (!shouldInclude) {
            console.log(`❌ Project excluded:`, {
              title: project.title || project.name,
              reason: isExplicitlyInactive ? 'isActive === false' : isExcludedStatus ? `status: ${status}` : 'unknown'
            });
          }
          
          return shouldInclude;
        });
        
        console.log(`📊 Projects after filtering: ${filteredProjects.length} out of ${projectsData.length}`);
        
        // If no projects after filtering but we have projects in data, show all for debugging
        // TODO: Remove this after fixing the backend/API issue
        const projectsToUse = filteredProjects.length === 0 && projectsData.length > 0 
          ? projectsData 
          : filteredProjects;
        
        if (projectsToUse.length !== filteredProjects.length) {
          console.warn("⚠️ Showing all projects (filtering disabled) for debugging. Projects were filtered out.");
        }
        
        // Transform projects to match the expected format
        const transformedProjects = projectsToUse.map((project: any) => ({
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

