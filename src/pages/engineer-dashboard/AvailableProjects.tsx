import React, { useState } from "react";
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

const AvailableProjects = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const availableProjects = [
    {
      id: 1,
      title: "Modern Office Building Design",
      category: "Architecture",
      location: "Riyadh, Saudi Arabia",
      description: "Looking for an experienced architect to design a modern office building with sustainable features.",
      isNew: true,
    },
    {
      id: 2,
      title: "Residential Complex Construction",
      category: "Construction",
      location: "Dubai, UAE",
      description: "Large-scale residential complex construction project requiring expertise in project management.",
      isNew: true,
    },
    {
      id: 3,
      title: "Highway Bridge Engineering",
      category: "Civil Engineering",
      location: "Jeddah, Saudi Arabia",
      description: "Design and engineering of a major highway bridge with modern structural solutions.",
      isNew: false,
    },
    {
      id: 4,
      title: "Industrial Warehouse Design",
      category: "Mechanical Engineering",
      location: "Dammam, Saudi Arabia",
      description: "Design of a large industrial warehouse with advanced mechanical systems.",
      isNew: false,
    },
  ];

  const filteredProjects = activeTab === "all"
    ? availableProjects
    : availableProjects.filter(p => p.category.toLowerCase().includes(activeTab.toLowerCase()));

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
                        <div>
                          <p className="text-sm text-hexa-text-light mb-1">
                            {getDashboardText("shortDescription", language)}
                          </p>
                          <p className="text-sm text-hexa-text-dark line-clamp-2">
                            {project.description}
                          </p>
                        </div>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AvailableProjects;

