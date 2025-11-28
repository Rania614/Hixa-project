import React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon, Calendar } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const EngineerPortfolio = () => {
  const { language } = useApp();
  const navigate = useNavigate();

  const portfolioWorks = [
    {
      id: 1,
      title: "Modern Residential Complex",
      description: "A sustainable residential complex with 200 units, featuring green architecture and energy-efficient systems.",
      image: "/placeholder-work.jpg",
      date: "2023-12-15",
      category: "Architecture",
    },
    {
      id: 2,
      title: "Commercial Tower Design",
      description: "50-story commercial tower with innovative structural design and modern facade.",
      image: "/placeholder-work.jpg",
      date: "2023-10-20",
      category: "Architecture",
    },
    {
      id: 3,
      title: "Urban Planning Project",
      description: "Comprehensive urban planning for a new district with sustainable infrastructure.",
      image: "/placeholder-work.jpg",
      date: "2023-08-10",
      category: "Urban Planning",
    },
    {
      id: 4,
      title: "Sustainable Office Building",
      description: "LEED-certified office building with renewable energy systems and green spaces.",
      image: "/placeholder-work.jpg",
      date: "2023-06-05",
      category: "Architecture",
    },
    {
      id: 5,
      title: "Bridge Engineering Project",
      description: "Modern bridge design with advanced structural engineering and aesthetic appeal.",
      image: "/placeholder-work.jpg",
      date: "2023-04-18",
      category: "Civil Engineering",
    },
    {
      id: 6,
      title: "Industrial Complex Design",
      description: "Large-scale industrial complex with efficient layout and modern facilities.",
      image: "/placeholder-work.jpg",
      date: "2023-02-12",
      category: "Industrial Design",
    },
  ];

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-6 max-w-7xl mx-auto">
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
          <Button 
            onClick={() => navigate("/engineer/portfolio/add")}
            className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11 px-6"
          >
            <Plus className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
            {getDashboardText("addWork", language)}
          </Button>
        </div>

        <Card className="bg-hexa-card border-hexa-border">
          <CardContent className="p-6 md:p-8">
            {portfolioWorks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioWorks.map((work) => (
                  <div
                    key={work.id}
                    onClick={() => navigate(`/engineer/portfolio/${work.id}`)}
                    className="group border border-hexa-border rounded-lg overflow-hidden hover:border-hexa-secondary/50 transition-all bg-hexa-bg cursor-pointer"
                  >
                    <div className="h-48 bg-hexa-card flex items-center justify-center border-b border-hexa-border">
                      <ImageIcon className="w-12 h-12 text-hexa-text-light opacity-50" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border text-xs">
                          {work.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-hexa-text-light">
                          <Calendar className="w-3 h-3" />
                          {work.date}
                        </div>
                      </div>
                      <h3 className="font-semibold text-hexa-text-dark mb-2 line-clamp-1">
                        {work.title}
                      </h3>
                      <p className="text-sm text-hexa-text-light line-clamp-2">
                        {work.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-hexa-text-light mx-auto mb-4 opacity-50" />
                <p className="text-hexa-text-light mb-4">
                  {getDashboardText("noWorks", language)}
                </p>
                <Button 
                  onClick={() => navigate("/engineer/portfolio/add")}
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

export default EngineerPortfolio;

