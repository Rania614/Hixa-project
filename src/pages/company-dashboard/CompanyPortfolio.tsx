import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon, Calendar, Loader2, RefreshCw } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAllPortfolioWorks, PortfolioWork } from "@/services/portfolioApi";

// Helper function to get full image URL
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  // If it's already a full URL (http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, it's an absolute path from the API base
  if (imagePath.startsWith('/')) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    // Remove trailing slash from base URL if exists
    const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    return `${base}${imagePath}`;
  }
  
  // Otherwise, treat as relative path
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  return `${base}/${imagePath}`;
};

const CompanyPortfolio = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [portfolioWorks, setPortfolioWorks] = useState<PortfolioWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioWorks();
  }, [location.pathname]); // Re-fetch when pathname changes (e.g., returning from add/edit page)

  const fetchPortfolioWorks = async () => {
    try {
      setLoading(true);
      console.log("Fetching portfolio works...");
      
      // Get user ID from localStorage
      const userStr = localStorage.getItem("user");
      let userId: string | undefined;
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user._id || user.id;
          console.log("Found user ID:", userId);
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }
      
      // Use user-specific endpoint if userId is available
      const works = userId 
        ? await getAllPortfolioWorks(userId)
        : await getAllPortfolioWorks();
      console.log("Raw fetched portfolio works:", works);
      console.log("Type of works:", typeof works);
      console.log("Is array?", Array.isArray(works));
      
      // Handle different response formats
      // API might return array directly or wrapped in an object
      let worksArray: PortfolioWork[] = [];
      if (Array.isArray(works)) {
        worksArray = works;
        console.log("Works is array, using directly");
      } else if (works && typeof works === 'object' && 'data' in works && Array.isArray(works.data)) {
        worksArray = works.data;
        console.log("Works has data array, using works.data");
      } else if (works && typeof works === 'object' && 'items' in works && Array.isArray(works.items)) {
        worksArray = works.items;
        console.log("Works has items array, using works.items");
      } else if (works && typeof works === 'object' && 'works' in works && Array.isArray(works.works)) {
        worksArray = works.works;
        console.log("Works has works array, using works.works");
      } else if (works && typeof works === 'object') {
        // If it's a single object, wrap it in an array
        worksArray = [works as PortfolioWork];
        console.log("Works is single object, wrapping in array");
      } else {
        console.warn("Unknown works format:", works);
        worksArray = [];
      }
      
      console.log("Final processed portfolio works array:", worksArray);
      console.log("Number of works:", worksArray.length);
      worksArray.forEach((work, index) => {
        console.log(`Work ${index}:`, work);
      });
      
      setPortfolioWorks(worksArray);
    } catch (error) {
      console.error("Failed to fetch portfolio works:", error);
      console.error("Error details:", error);
      // Keep empty array on error
      setPortfolioWorks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/company/dashboard"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/company/dashboard");
                }}
              >
                {getDashboardText("dashboard", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("portfolio", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-hexa-text-dark">
              {getDashboardText("portfolio", language)}
            </h1>
            <p className="text-hexa-text-light mt-1">
              {language === "en" ? "Showcase your completed projects and works" : "اعرض مشاريعك وأعمالك المكتملة"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={fetchPortfolioWorks}
              variant="outline"
              className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary h-11 px-6"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"} ${loading ? "animate-spin" : ""}`} />
              {language === "en" ? "Refresh" : "تحديث"}
            </Button>
            <Button 
              onClick={() => navigate("/company/portfolio/add")}
              className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11 px-6"
            >
              <Plus className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
              {getDashboardText("addWork", language)}
            </Button>
          </div>
        </div>

        <Card className="bg-hexa-card border-hexa-border">
          <CardContent className="p-6 md:p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-hexa-secondary animate-spin" />
                <span className="ml-3 text-hexa-text-light">
                  {language === "en" ? "Loading portfolio..." : "جاري تحميل المعرض..."}
                </span>
              </div>
            ) : portfolioWorks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioWorks.map((work, index) => {
                  // Use work.id or fallback to index
                  const workId = work.id || work._id || index;
                  // Check all possible image field names - API uses 'mainImage' which is an object with 'url'
                  const workImage = 
                    (work.mainImage && typeof work.mainImage === 'object' ? work.mainImage.url : null) ||
                    (typeof work.mainImage === 'string' ? work.mainImage : null) ||
                    work.image || 
                    work.imageUrl || 
                    work.photo || 
                    work.photoUrl || 
                    work.imagePath || 
                    work.file || 
                    work.attachment;
                  const workTitle = work.title || work.name || 'Untitled';
                  const workDescription = work.description || work.desc || '';
                  const workCategory = work.category || work.type || 'Uncategorized';
                  const workDate = work.date || work.createdAt || work.dateCreated || '';
                  
                  return (
                    <div
                      key={workId}
                      onClick={() => navigate(`/company/portfolio/${workId}`)}
                      className="group border border-hexa-border rounded-lg overflow-hidden hover:border-hexa-secondary/50 transition-all bg-hexa-bg cursor-pointer"
                    >
                      <div className="h-48 bg-hexa-card flex items-center justify-center border-b border-hexa-border overflow-hidden relative">
                        {workImage && typeof workImage === 'string' ? (() => {
                          const imageUrl = getImageUrl(workImage);
                          console.log("Displaying image for work:", workId, "URL:", imageUrl, "Original:", workImage);
                          return imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={workTitle}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error("Image load error for work:", workId, "URL:", imageUrl, "Original:", workImage);
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                          ) : null;
                        })() : null}
                        <ImageIcon className={`w-12 h-12 text-hexa-text-light opacity-50 ${workImage && typeof workImage === 'string' ? 'hidden' : ''}`} />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border text-xs">
                            {workCategory}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-hexa-text-light">
                            <Calendar className="w-3 h-3" />
                            {workDate ? new Date(workDate).toLocaleDateString() : 'No date'}
                          </div>
                        </div>
                        <h3 className="font-semibold text-hexa-text-dark mb-2 line-clamp-1">
                          {workTitle}
                        </h3>
                        <p className="text-sm text-hexa-text-light line-clamp-2">
                          {workDescription}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-hexa-text-light mx-auto mb-4 opacity-50" />
                <p className="text-hexa-text-light mb-4">
                  {getDashboardText("noWorks", language)}
                </p>
                <Button 
                  onClick={() => navigate("/company/portfolio/add")}
                  className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold"
                >
                  <Plus className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {getDashboardText("addWork", language)}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompanyPortfolio;

