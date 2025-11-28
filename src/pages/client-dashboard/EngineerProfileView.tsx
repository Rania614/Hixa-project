import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Star, Award, MapPin, Mail, Phone, Image as ImageIcon, Calendar } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const EngineerProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();

  // Mock engineer data
  const engineer = {
    id: id,
    name: "Ahmed Al-Mansouri",
    email: "ahmed@example.com",
    phone: "+966 50 123 4567",
    location: "Riyadh, Saudi Arabia",
    rating: 4.8,
    totalReviews: 24,
    bio: "Experienced architect with 10+ years in residential and commercial building design. Specialized in sustainable architecture and urban planning.",
    specializations: ["Architecture", "Urban Planning", "Sustainable Design"],
    certifications: [
      { name: "Professional Engineer License", year: "2020" },
      { name: "LEED Certified", year: "2021" },
    ],
    portfolio: [
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
    ],
    reviews: [
      {
        id: 1,
        client: "Client A",
        rating: 5,
        comment: "Excellent work! Very professional and delivered on time.",
        date: "2024-01-10",
      },
      {
        id: 2,
        client: "Client B",
        rating: 4.5,
        comment: "Great communication and attention to detail.",
        date: "2023-12-05",
      },
      {
        id: 3,
        client: "Client C",
        rating: 5,
        comment: "Highly recommended. The design exceeded our expectations.",
        date: "2023-11-20",
      },
    ],
  };

  return (
    <DashboardLayout userType="client">
      <div className="space-y-6 max-w-6xl mx-auto">
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
                {engineer.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-hexa-secondary/20 text-hexa-text-light hover:text-hexa-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-hexa-text-dark">{engineer.name}</h1>
            <p className="text-hexa-text-light mt-1">
              {language === "en" ? "Engineer Profile" : "ملف المهندس الشخصي"}
            </p>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24 flex-shrink-0">
                <AvatarFallback className="bg-hexa-secondary text-black text-2xl font-bold">
                  {engineer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-hexa-text-dark">{engineer.rating}</span>
                  </div>
                  <div>
                    <p className="text-sm text-hexa-text-light">
                      {language === "en" ? "Average Rating" : "متوسط التقييم"}
                    </p>
                    <p className="text-sm text-hexa-text-light">
                      {language === "en" 
                        ? `Based on ${engineer.totalReviews} reviews` 
                        : `بناءً على ${engineer.totalReviews} تقييم`}
                    </p>
                  </div>
                </div>
                <p className="text-hexa-text-dark mb-4">{engineer.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {engineer.specializations.map((spec, idx) => (
                    <Badge key={idx} variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader>
            <CardTitle className="text-hexa-text-dark">
              {language === "en" ? "Contact Information" : "معلومات الاتصال"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-hexa-secondary" />
                <span className="text-hexa-text-dark">{engineer.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-hexa-secondary" />
                <span className="text-hexa-text-dark">{engineer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-hexa-secondary" />
                <span className="text-hexa-text-dark">{engineer.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        {engineer.certifications.length > 0 && (
          <Card className="bg-hexa-card border-hexa-border">
            <CardHeader>
              <CardTitle className="text-hexa-text-dark flex items-center gap-2">
                <Award className="w-5 h-5 text-hexa-secondary" />
                {language === "en" ? "Certifications" : "الشهادات"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {engineer.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-hexa-border rounded-lg bg-hexa-bg">
                    <span className="text-hexa-text-dark">{cert.name}</span>
                    <span className="text-sm text-hexa-text-light">{cert.year}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader>
            <CardTitle className="text-hexa-text-dark">
              {language === "en" ? "Portfolio" : "معرض الأعمال"}
            </CardTitle>
            <CardDescription className="text-hexa-text-light">
              {language === "en" ? "Completed projects and works" : "المشاريع والأعمال المكتملة"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {engineer.portfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {engineer.portfolio.map((work) => (
                  <div
                    key={work.id}
                    className="group border border-hexa-border rounded-lg overflow-hidden hover:border-hexa-secondary/50 transition-all bg-hexa-bg"
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
              <p className="text-hexa-text-light text-center py-8">
                {language === "en" ? "No portfolio items yet" : "لا توجد أعمال في المعرض بعد"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader>
            <CardTitle className="text-hexa-text-dark">
              {language === "en" ? "Reviews" : "التقييمات"}
            </CardTitle>
            <CardDescription className="text-hexa-text-light">
              {language === "en" 
                ? `${engineer.reviews.length} client reviews` 
                : `${engineer.reviews.length} تقييم من العملاء`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engineer.reviews.map((review) => (
                <div key={review.id} className="p-4 border border-hexa-border rounded-lg bg-hexa-bg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(review.rating)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-hexa-text-light"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-hexa-text-dark">{review.rating}</span>
                    </div>
                    <span className="text-xs text-hexa-text-light">{review.date}</span>
                  </div>
                  <p className="text-sm text-hexa-text-light mb-1">
                    {language === "en" ? `By ${review.client}` : `من ${review.client}`}
                  </p>
                  <p className="text-hexa-text-dark">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EngineerProfileView;

