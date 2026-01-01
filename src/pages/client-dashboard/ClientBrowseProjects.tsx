import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye } from "lucide-react";
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
import { countriesWithCities, businessCategories } from "@/constants/filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

const ClientBrowseProjects = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch available projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Build query parameters with filters
        // Add 'browseOnly' parameter to tell backend we only want public approved projects (not own projects)
        const queryParams: any = {
          browseOnly: "true", // This tells backend to return only public approved projects, not own projects
          limit: 100, // Get more projects (default is 10, max is 100)
          page: 1, // Start from first page
        };
        if (selectedCountry && selectedCountry !== "all") queryParams.country = selectedCountry;
        if (selectedCity && selectedCity !== "all") queryParams.city = selectedCity;
        if (selectedCategory && selectedCategory !== "all") queryParams.category = selectedCategory;
        
        // Fetch projects with filters
        let response;
        let projectsData: any[] = [];
        
        try {
          console.log(`🔄 Fetching /projects with params:`, queryParams);
          response = await http.get("/projects", { params: queryParams });
            
          // Handle different response structures
          let tempData = response.data;
          
          // If response.data is already an array, use it directly
          if (Array.isArray(tempData)) {
            projectsData = tempData;
          }
          // If response.data is an object with a data property (like {data: [], meta: {}})
          else if (tempData?.data && Array.isArray(tempData.data)) {
            projectsData = tempData.data;
          }
          
          console.log(`✅ Found ${projectsData.length} projects`);
        } catch (err: any) {
          console.error("❌ Error fetching projects:", err);
          throw err;
        }
        
        // Filter projects to show only public projects (not owned by current client)
        // Backend should already filter, but we'll filter on frontend too for safety
        const userDataStr = localStorage.getItem('user');
        let userData = null;
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr);
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
        
        const currentClientId = userData?._id || userData?.id;
        
        // Backend already filters to show only public approved projects (not own projects)
        // No need for additional filtering on frontend
        const filteredProjects = projectsData;
        
        console.log("✅ Projects received from backend (already filtered):", {
          total: projectsData.length,
          projects: projectsData.map((p: any) => ({ 
            title: p.title, 
            status: p.status, 
            approved: p.adminApproval?.status || p.adminApproval,
            client: p.client?._id || p.client
          }))
        });
        
        // Transform projects to match the expected format
        const transformedProjects = filteredProjects.map((project: any) => ({
          id: project._id || project.id,
          title: project.title || project.name || "Unknown Project",
          category: project.category || "N/A",
          location: project.location || "N/A",
          description: project.description || "",
          deadline: project.deadline,
          status: project.status,
          requirements: project.requirements,
          projectType: project.projectType || project.category || "N/A",
          isActive: project.isActive,
          adminApproval: project.adminApproval || project.admin_approval,
          client: project.client,
        }));
        
        setAvailableProjects(transformedProjects);
      } catch (error: any) {
        console.error("Error fetching projects:", error);
        console.error("Error response:", error.response);
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
  }, [language, selectedCountry, selectedCity, selectedCategory]);
  
  // Reset city when country changes
  useEffect(() => {
    if (!selectedCountry || selectedCountry === "all") {
      setSelectedCity("all");
    }
  }, [selectedCountry]);
  
  // Get available cities for selected country
  const availableCities = (selectedCountry && selectedCountry !== "all") ? (countriesWithCities[selectedCountry as keyof typeof countriesWithCities] || []) : [];
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCountry("all");
    setSelectedCity("all");
    setSelectedCategory("all");
  };
  
  // Check if any filter is active
  const hasActiveFilters = (selectedCountry && selectedCountry !== "all") || (selectedCity && selectedCity !== "all") || (selectedCategory && selectedCategory !== "all");

  const filteredProjects = activeTab === "all"
    ? availableProjects
    : availableProjects.filter(p => {
        const category = (p.category || "").toLowerCase();
        const projectType = (p.projectType || "").toLowerCase();
        const tabLower = activeTab.toLowerCase();
        
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
        
        const possibleMatches = filterMappings[tabLower] || [];
        const matchesCategory = possibleMatches.some(match => 
          category.includes(match.toLowerCase()) || match.toLowerCase().includes(category)
        );
        const matchesProjectType = possibleMatches.some(match => 
          projectType.includes(match.toLowerCase()) || match.toLowerCase().includes(projectType)
        );
        
        return matchesCategory || matchesProjectType;
      });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      "Waiting for Engineers": { label: language === "en" ? "Published" : "منشور", variant: "secondary" },
      "In Progress": { label: getDashboardText("inProgress", language), variant: "default" },
      "Completed": { label: getDashboardText("completed", language), variant: "default" },
    };
    const normalizedStatus = status || "";
    const statusInfo = statusMap[normalizedStatus] || { label: status, variant: "outline" as const };
    
    return (
      <Badge variant={statusInfo.variant} className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
        {statusInfo.label}
      </Badge>
    );
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
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {language === "en" ? "Browse Projects" : "تصفح المشاريع"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-hexa-text-dark">
              {language === "en" ? "Browse Projects" : "تصفح المشاريع"}
            </h1>
            <p className="text-hexa-text-light mt-1">
              {language === "en" ? "Browse published, in-progress, and completed projects" : "تصفح المشاريع المنشورة وقيد التنفيذ والمكتملة"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {language === "en" ? "Filters" : "الفلاتر"}
            {hasActiveFilters && (
              <Badge className="ml-1 bg-hexa-secondary text-black">
                {[selectedCountry, selectedCity, selectedCategory].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="bg-hexa-card border-hexa-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold text-hexa-text-dark">
                {language === "en" ? "Filter Projects" : "فلترة المشاريع"}
              </CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-hexa-text-light hover:text-hexa-secondary"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {language === "en" ? "Clear" : "مسح"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-hexa-text-dark">
                    {language === "en" ? "Country" : "الدولة"}
                  </label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="bg-hexa-bg border-hexa-border">
                      <SelectValue placeholder={language === "en" ? "Select country" : "اختر الدولة"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "en" ? "All Countries" : "جميع الدول"}</SelectItem>
                      {Object.keys(countriesWithCities).map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-hexa-text-dark">
                    {language === "en" ? "City" : "المدينة"}
                  </label>
                  <Select 
                    value={selectedCity} 
                    onValueChange={setSelectedCity}
                    disabled={!selectedCountry || selectedCountry === "all"}
                  >
                    <SelectTrigger className="bg-hexa-bg border-hexa-border" disabled={!selectedCountry || selectedCountry === "all"}>
                      <SelectValue placeholder={language === "en" ? "Select city" : "اختر المدينة"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "en" ? "All Cities" : "جميع المدن"}</SelectItem>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-hexa-text-dark">
                    {language === "en" ? "Business Scope" : "نطاق الأعمال"}
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-hexa-bg border-hexa-border">
                      <SelectValue placeholder={language === "en" ? "Select category" : "اختر نطاق الأعمال"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">{language === "en" ? "All Categories" : "جميع النطاقات"}</SelectItem>
                      {businessCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                          {getStatusBadge(project.status)}
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
                          onClick={() => navigate(`/client/projects/${project.id}`)}
                          className="w-full md:w-auto border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary transition-all"
                        >
                          <Eye className="w-4 h-4 ms-2" />
                          {getDashboardText("viewDetails", language)}
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

export default ClientBrowseProjects;

