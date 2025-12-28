import React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageSquare, FileText, Briefcase, Send, CheckCircle, Star } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const CompanyDashboard = () => {
  const { language } = useApp();
  const navigate = useNavigate();

  const stats = [
    { label: language === "en" ? "Active Projects" : "المشاريع النشطة", value: "8", icon: FileText, description: language === "en" ? "Projects you're working on" : "المشاريع التي تعمل عليها", path: "/company/projects?tab=inProgress" },
    { label: language === "en" ? "Submitted Proposals" : "العروض المقدمة", value: "12", icon: Send, description: language === "en" ? "Proposals you've submitted" : "العروض التي قدمتها", path: "/company/projects?tab=waitingForAdminDecision" },
    { label: language === "en" ? "Completed Projects" : "المشاريع المكتملة", value: "24", icon: CheckCircle, description: language === "en" ? "Projects you've completed" : "المشاريع التي أكملتها", path: "/company/projects?tab=completed" },
    { label: language === "en" ? "Available Projects" : "المشاريع المتاحة", value: "24", icon: Briefcase, description: language === "en" ? "Projects you can apply to" : "المشاريع التي يمكنك التقدم عليها", path: "/company/available-projects" },
  ];

  const recentProjects = [
    {
      id: 1,
      title: "Residential Building Design",
      status: "inProgress",
    },
    {
      id: 2,
      title: "Office Complex Construction",
      status: "inProgress",
    },
  ];

  const completedProjects = [
    {
      id: 3,
      title: "Bridge Engineering Project",
      category: "Civil Engineering",
      location: "Jeddah, Saudi Arabia",
      completedDate: "2024-01-15",
      rating: 4.8,
      review: language === "en" ? "Excellent work! Very professional and delivered on time." : "عمل ممتاز! محترف جداً وسلم في الوقت المحدد.",
    },
    {
      id: 4,
      title: "Industrial Warehouse Design",
      category: "Mechanical Engineering",
      location: "Dammam, Saudi Arabia",
      completedDate: "2024-01-10",
      rating: 5.0,
      review: language === "en" ? "Outstanding quality and attention to detail." : "جودة استثنائية واهتمام بالتفاصيل.",
    },
    {
      id: 5,
      title: "Shopping Mall Architecture",
      category: "Architecture",
      location: "Riyadh, Saudi Arabia",
      completedDate: "2024-01-05",
      rating: 4.5,
      review: language === "en" ? "Great communication and design skills." : "تواصل ممتاز ومهارات تصميم رائعة.",
    },
  ];

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("companyDashboard", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("companyDashboard", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Welcome back! Here's your dashboard overview" : "مرحباً بعودتك! إليك نظرة عامة على لوحة التحكم"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={idx} 
                className="bg-hexa-card border-hexa-border hover:border-hexa-secondary/50 transition-colors cursor-pointer"
                onClick={() => navigate(stat.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-hexa-text-light mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-hexa-text-dark mb-1">{stat.value}</p>
                      <p className="text-xs text-hexa-text-light">{stat.description}</p>
                    </div>
                    <div className="p-3 bg-hexa-secondary/20 rounded-lg">
                      <Icon className="w-6 h-6 text-hexa-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Projects */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader>
            <CardTitle className="text-hexa-text-dark">{getDashboardText("myProjects", language)}</CardTitle>
            <CardDescription className="text-hexa-text-light">
              {language === "en" ? "Your active projects" : "مشاريعك النشطة"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="p-4 border border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors bg-hexa-bg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-hexa-text-dark">{project.title}</h3>
                      </div>
                      <Badge className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
                        {getDashboardText("inProgress", language)}
                      </Badge>
                    </div>
                    {project.status === "inProgress" && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/company/messages?project=${project.id}`);
                          }}
                          className="flex-1 border-hexa-border bg-hexa-card text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary transition-all"
                        >
                          <MessageSquare className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                          {getDashboardText("chat", language)}
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-hexa-text-light mx-auto mb-4 opacity-50" />
                  <p className="text-hexa-text-light">
                    {language === "en" ? "No active projects yet" : "لا توجد مشاريع نشطة بعد"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Projects with Ratings */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader>
            <CardTitle className="text-hexa-text-dark">
              {language === "en" ? "Completed Projects" : "المشاريع المكتملة"}
            </CardTitle>
            <CardDescription className="text-hexa-text-light">
              {language === "en" ? "Your completed projects with ratings" : "مشاريعك المكتملة مع التقييمات"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedProjects.length > 0 ? (
                completedProjects.map((project) => (
                  <div key={project.id} className="p-4 border border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors bg-hexa-bg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-hexa-text-dark mb-1">{project.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-hexa-text-light">
                          <MapPin className="w-4 h-4 text-hexa-secondary" />
                          <span>{project.location}</span>
                          <span className="mx-1">•</span>
                          <span>{project.category}</span>
                        </div>
                      </div>
                      <Badge className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
                        {getDashboardText("completed", language)}
                      </Badge>
                    </div>
                    <div className="space-y-3 pt-3 border-t border-hexa-border">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(project.rating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-hexa-text-light"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-hexa-text-dark">{project.rating}</span>
                        <span className="text-xs text-hexa-text-light">
                          {language === "en" ? `Completed on ${project.completedDate}` : `مكتمل في ${project.completedDate}`}
                        </span>
                      </div>
                      {project.review && (
                        <div className="p-3 bg-hexa-card rounded-lg border border-hexa-border/50">
                          <p className="text-sm text-hexa-text-light italic">"{project.review}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-hexa-text-light mx-auto mb-4 opacity-50" />
                  <p className="text-hexa-text-light">
                    {language === "en" ? "No completed projects yet" : "لا توجد مشاريع مكتملة بعد"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;

