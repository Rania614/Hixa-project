import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Star, Award, MapPin, Mail, Phone, Image as ImageIcon, Calendar, Loader2 } from "lucide-react";
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

// Engineer interface matching the proposal schema
interface Engineer {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: {
    url?: string;
    publicId?: string;
  };
  location?: string;
  bio?: string;
  specializations?: string[];
  certifications?: Array<{ name: string; year: string }>;
  portfolio?: Array<{
    id: number;
    title: string;
    description: string;
    image: string;
    date: string;
    category: string;
  }>;
  reviews?: Array<{
    id: number;
    client: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

const EngineerProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch engineer data from API
  useEffect(() => {
    const fetchEngineer = async () => {
      if (!id) {
        setError(language === "en" ? "Invalid engineer ID" : "معرف المهندس غير صحيح");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await http.get(`/users/${id}`);
        
        // Handle different response structures
        let engineerData = response.data?.data || response.data?.user || response.data;
        
        // Normalize engineer data to match proposal schema
        const normalizedEngineer: Engineer = {
          _id: engineerData._id || engineerData.id,
          id: engineerData._id || engineerData.id,
          name: engineerData.name,
          email: engineerData.email,
          phone: engineerData.phone || engineerData.phoneNumber,
          role: engineerData.role,
          avatar: engineerData.avatar ? {
            url: typeof engineerData.avatar === 'string' 
              ? engineerData.avatar 
              : engineerData.avatar.url || engineerData.avatar.path,
            publicId: typeof engineerData.avatar === 'object' 
              ? engineerData.avatar.publicId 
              : undefined
          } : undefined,
          location: engineerData.location || engineerData.address || engineerData.city,
          bio: engineerData.bio || engineerData.description,
          specializations: engineerData.specializations || [],
          certifications: engineerData.certifications || [],
          portfolio: engineerData.portfolio || [],
          reviews: engineerData.reviews || [],
        };

        setEngineer(normalizedEngineer);
      } catch (error: any) {
        console.error("Error fetching engineer:", error);
        const errorMessage = error.response?.data?.message || 
          (language === "en" ? "Failed to load engineer profile" : "فشل تحميل ملف المهندس");
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEngineer();
  }, [id, language]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-hexa-secondary mx-auto mb-4" />
            <p className="text-hexa-text-light">
              {language === "en" ? "Loading engineer profile..." : "جاري تحميل ملف المهندس..."}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !engineer) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              {error || (language === "en" ? "Engineer not found" : "المهندس غير موجود")}
            </p>
            <Button onClick={() => navigate(-1)}>
              {language === "en" ? "Go Back" : "رجوع"}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get avatar URL from schema
  const avatarUrl = engineer.avatar?.url;
  const engineerName = engineer.name || (language === "en" ? "Unknown Engineer" : "مهندس غير معروف");
  const engineerEmail = engineer.email || "";
  const engineerPhone = engineer.phone || "";
  const engineerLocation = engineer.location || "";
  const engineerBio = engineer.bio || "";
  const engineerSpecializations = engineer.specializations || [];
  const engineerCertifications = engineer.certifications || [];
  const engineerPortfolio = engineer.portfolio || [];
  const engineerReviews = engineer.reviews || [];

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
                {engineerName}
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
            <h1 className="text-3xl font-bold text-hexa-text-dark">{engineerName}</h1>
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
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={engineerName} />
                ) : null}
                <AvatarFallback className="bg-hexa-secondary text-black text-2xl font-bold">
                  {engineerName.charAt(0)?.toUpperCase() || 'E'}
                </AvatarFallback>
              </Avatar>
              {engineerBio && (
                <div className="flex-1">
                  <p className="text-hexa-text-dark mb-4">{engineerBio}</p>
                  {engineerSpecializations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {engineerSpecializations.map((spec, idx) => (
                        <Badge key={idx} variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
              {engineerEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-hexa-secondary" />
                  <span className="text-hexa-text-dark">{engineerEmail}</span>
                </div>
              )}
              {engineerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-hexa-secondary" />
                  <span className="text-hexa-text-dark">{engineerPhone}</span>
                </div>
              )}
              {engineerLocation && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-hexa-secondary" />
                  <span className="text-hexa-text-dark">{engineerLocation}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        {engineerCertifications.length > 0 && (
          <Card className="bg-hexa-card border-hexa-border">
            <CardHeader>
              <CardTitle className="text-hexa-text-dark flex items-center gap-2">
                <Award className="w-5 h-5 text-hexa-secondary" />
                {language === "en" ? "Certifications" : "الشهادات"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {engineerCertifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-hexa-border rounded-lg bg-hexa-bg">
                    <span className="text-hexa-text-dark">{cert.name}</span>
                    {cert.year && (
                      <span className="text-sm text-hexa-text-light">{cert.year}</span>
                    )}
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
            {engineerPortfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {engineerPortfolio.map((work) => (
                  <div
                    key={work.id}
                    className="group border border-hexa-border rounded-lg overflow-hidden hover:border-hexa-secondary/50 transition-all bg-hexa-bg"
                  >
                    <div className="h-48 bg-hexa-card flex items-center justify-center border-b border-hexa-border">
                      <ImageIcon className="w-12 h-12 text-hexa-text-light opacity-50" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        {work.category && (
                          <Badge variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border text-xs">
                            {work.category}
                          </Badge>
                        )}
                        {work.date && (
                          <div className="flex items-center gap-1 text-xs text-hexa-text-light">
                            <Calendar className="w-3 h-3" />
                            {work.date}
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-hexa-text-dark mb-2 line-clamp-1">
                        {work.title}
                      </h3>
                      {work.description && (
                        <p className="text-sm text-hexa-text-light line-clamp-2">
                          {work.description}
                        </p>
                      )}
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
        {engineerReviews.length > 0 && (
          <Card className="bg-hexa-card border-hexa-border">
            <CardHeader>
              <CardTitle className="text-hexa-text-dark">
                {language === "en" ? "Reviews" : "التقييمات"}
              </CardTitle>
              <CardDescription className="text-hexa-text-light">
                {language === "en" 
                  ? `${engineerReviews.length} client reviews` 
                  : `${engineerReviews.length} تقييم من العملاء`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineerReviews.map((review) => (
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
                      {review.date && (
                        <span className="text-xs text-hexa-text-light">{review.date}</span>
                      )}
                    </div>
                    {review.client && (
                      <p className="text-sm text-hexa-text-light mb-1">
                        {language === "en" ? `By ${review.client}` : `من ${review.client}`}
                      </p>
                    )}
                    {review.comment && (
                      <p className="text-hexa-text-dark">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EngineerProfileView;

