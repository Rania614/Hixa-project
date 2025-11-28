import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Image as ImageIcon, Edit, Trash2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const WorkDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();

  // Mock work data
  const work = {
    id: id,
    title: "Modern Residential Complex",
    description: "A sustainable residential complex with 200 units, featuring green architecture and energy-efficient systems. This project showcases innovative design solutions that combine functionality with environmental consciousness. The complex includes solar panels, rainwater harvesting systems, and green spaces that promote sustainable living.",
    category: "Architecture",
    date: "2023-12-15",
    location: "Riyadh, Saudi Arabia",
    client: "ABC Development Company",
    status: "Completed",
    images: [
      "/placeholder-work.jpg",
      "/placeholder-work.jpg",
      "/placeholder-work.jpg",
    ],
    features: [
      "200 residential units",
      "Solar panel integration",
      "Rainwater harvesting",
      "Green spaces and parks",
      "Energy-efficient systems",
    ],
  };

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-6 max-w-6xl mx-auto">
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
              <BreadcrumbLink
                href="/engineer/portfolio"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/engineer/portfolio");
                }}
              >
                {getDashboardText("portfolio", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {work.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/engineer/portfolio")}
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-hexa-text-dark">{work.title}</h1>
              <Badge className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
                {getDashboardText("completed", language)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-hexa-text-light">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {work.date}
              </div>
              <span>•</span>
              <Badge variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border">
                {work.category}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/engineer/portfolio/${work.id}/edit`)}
              className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
            >
              <Edit className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
              {language === "en" ? "Edit" : "تعديل"}
            </Button>
            <Button
              variant="outline"
              className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-red-500/20 hover:text-red-500 hover:border-red-500"
            >
              <Trash2 className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
              {language === "en" ? "Delete" : "حذف"}
            </Button>
          </div>
        </div>

        {/* Main Image */}
        <Card className="bg-hexa-card border-hexa-border overflow-hidden">
          <div className="h-96 bg-hexa-bg flex items-center justify-center">
            <ImageIcon className="w-24 h-24 text-hexa-text-light opacity-30" />
          </div>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark">
                  {language === "en" ? "Description" : "الوصف"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-hexa-text-dark leading-relaxed whitespace-pre-line">
                  {work.description}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark">
                  {language === "en" ? "Key Features" : "المميزات الرئيسية"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {work.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-hexa-text-dark">
                      <span className="text-hexa-secondary mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Additional Images */}
            {work.images.length > 1 && (
              <Card className="bg-hexa-card border-hexa-border">
                <CardHeader>
                  <CardTitle className="text-hexa-text-dark">
                    {language === "en" ? "Additional Images" : "صور إضافية"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {work.images.slice(1).map((image, idx) => (
                      <div
                        key={idx}
                        className="aspect-square bg-hexa-bg rounded-lg flex items-center justify-center border border-hexa-border hover:border-hexa-secondary/50 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-8 h-8 text-hexa-text-light opacity-30" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Information */}
            <Card className="bg-hexa-card border-hexa-border">
              <CardHeader>
                <CardTitle className="text-hexa-text-dark text-lg">
                  {language === "en" ? "Project Information" : "معلومات المشروع"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-hexa-text-light mb-1">
                    {getDashboardText("category", language)}
                  </p>
                  <Badge variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border">
                    {work.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-hexa-text-light mb-1">
                    {getDashboardText("workDate", language)}
                  </p>
                  <p className="text-hexa-text-dark font-medium">{work.date}</p>
                </div>
                {work.location && (
                  <div>
                    <p className="text-sm text-hexa-text-light mb-1">
                      {getDashboardText("location", language)}
                    </p>
                    <p className="text-hexa-text-dark font-medium">{work.location}</p>
                  </div>
                )}
                {work.client && (
                  <div>
                    <p className="text-sm text-hexa-text-light mb-1">
                      {language === "en" ? "Client" : "العميل"}
                    </p>
                    <p className="text-hexa-text-dark font-medium">{work.client}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-hexa-text-light mb-1">
                    {language === "en" ? "Status" : "الحالة"}
                  </p>
                  <Badge className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
                    {getDashboardText("completed", language)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkDetails;

