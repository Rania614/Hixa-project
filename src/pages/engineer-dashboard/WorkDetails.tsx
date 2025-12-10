import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Image as ImageIcon, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  getPortfolioWorkById,
  deletePortfolioWork,
  PortfolioWork,
} from "@/services/portfolioApi";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WorkDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useApp();
  const navigate = useNavigate();
  const [work, setWork] = useState<PortfolioWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWork();
    }
  }, [id]);

  const fetchWork = async () => {
    if (!id) return;
    try {
      setLoading(true);
      console.log("Fetching work with ID:", id);
      const workData = await getPortfolioWorkById(id);
      console.log("Fetched work data:", workData);
      
      console.log("Raw workData keys:", Object.keys(workData || {}));
      console.log("workData.mainImage:", workData.mainImage);
      console.log("workData.mainImage type:", typeof workData.mainImage);
      console.log("workData.mainImage?.url:", workData.mainImage?.url);
      console.log("workData.gallery:", workData.gallery);
      
      // Extract image URL from mainImage object or use string directly
      let mainImageUrl = null;
      if (workData.mainImage) {
        if (typeof workData.mainImage === 'object' && workData.mainImage.url) {
          mainImageUrl = workData.mainImage.url;
        } else if (typeof workData.mainImage === 'string') {
          mainImageUrl = workData.mainImage;
        }
      }
      
      // Extract gallery images - handle array of objects or strings
      let galleryImages: string[] | undefined = undefined;
      if (workData.gallery && Array.isArray(workData.gallery)) {
        galleryImages = workData.gallery.map((img: any) => {
          if (typeof img === 'object' && img.url) {
            return img.url;
          } else if (typeof img === 'string') {
            return img;
          }
          return null;
        }).filter((url: string | null) => url !== null) as string[];
      }
      
      // Handle different field names - API uses 'mainImage' and 'gallery'
      const processedWork: PortfolioWork = {
        id: workData.id || workData._id || id,
        title: workData.title || workData.name || 'Untitled',
        description: workData.description || workData.desc || workData.details || '',
        category: workData.category || workData.type || 'Uncategorized',
        date: workData.date || workData.createdAt || workData.dateCreated || '',
        image: mainImageUrl || workData.image || workData.imageUrl || workData.photo || workData.photoUrl || workData.imagePath || workData.file || workData.attachment || null,
        location: workData.location || workData.address || undefined,
        client: workData.client || workData.clientName || undefined,
        status: workData.status || 'Completed',
        images: galleryImages || workData.images || workData.photos || undefined,
        features: workData.keyFeatures || workData.features || undefined,
      };
      
      console.log("Processed work for display:", processedWork);
      console.log("Processed work image (mainImage.url):", processedWork.image);
      setWork(processedWork);
    } catch (error) {
      console.error("Failed to fetch work:", error);
      // Navigate back if work not found
      navigate("/engineer/portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await deletePortfolioWork(id);
      navigate("/engineer/portfolio");
    } catch (error) {
      console.error("Failed to delete work:", error);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="engineer">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-hexa-secondary animate-spin" />
          <span className="ml-3 text-hexa-text-light">
            {language === "en" ? "Loading work..." : "جاري تحميل العمل..."}
          </span>
        </div>
      </DashboardLayout>
    );
  }

  if (!work) {
    return (
      <DashboardLayout userType="engineer">
        <div className="text-center py-12">
          <p className="text-hexa-text-light">
            {language === "en" ? "Work not found" : "العمل غير موجود"}
          </p>
          <Button
            onClick={() => navigate("/engineer/portfolio")}
            className="mt-4 bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold"
          >
            {language === "en" ? "Back to Portfolio" : "العودة إلى المعرض"}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

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
              <h1 className="text-3xl font-bold text-hexa-text-dark">{work.title || 'Untitled'}</h1>
              <Badge className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
                {work.status || getDashboardText("completed", language)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-hexa-text-light">
              {work.date && (
                <>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {work.date ? new Date(work.date).toLocaleDateString() : 'No date'}
                  </div>
                  <span>•</span>
                </>
              )}
              {work.category && (
                <Badge variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border">
                  {work.category}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/engineer/portfolio/${work.id || id}/edit`)}
              className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
            >
              <Edit className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
              {language === "en" ? "Edit" : "تعديل"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
              className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-red-500/20 hover:text-red-500 hover:border-red-500 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className={`w-4 h-4 animate-spin ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {language === "en" ? "Deleting..." : "جاري الحذف..."}
                </>
              ) : (
                <>
                  <Trash2 className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {language === "en" ? "Delete" : "حذف"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Image */}
        <Card className="bg-hexa-card border-hexa-border overflow-hidden">
          <div className="h-96 bg-hexa-bg flex items-center justify-center overflow-hidden relative">
            {work.image && typeof work.image === 'string' ? (() => {
              const imageUrl = getImageUrl(work.image);
              console.log("Displaying work image, URL:", imageUrl, "Original:", work.image);
              return imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={work.title || 'Work image'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image load error:", "URL:", imageUrl, "Original:", work.image);
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
              ) : null;
            })() : null}
            <ImageIcon className={`w-24 h-24 text-hexa-text-light opacity-30 ${work.image && typeof work.image === 'string' ? 'hidden' : ''}`} />
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
                {work.description ? (
                  <p className="text-hexa-text-dark leading-relaxed whitespace-pre-line">
                    {work.description}
                  </p>
                ) : (
                  <p className="text-hexa-text-light italic">
                    {language === "en" ? "No description available" : "لا يوجد وصف متاح"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            {work.features && work.features.length > 0 && (
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
            )}

            {/* Additional Images */}
            {work.images && work.images.length > 1 && (
              <Card className="bg-hexa-card border-hexa-border">
                <CardHeader>
                  <CardTitle className="text-hexa-text-dark">
                    {language === "en" ? "Additional Images" : "صور إضافية"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {work.images.slice(1).map((image, idx) => {
                      const imageUrl = getImageUrl(image);
                      return (
                        <div
                          key={idx}
                          className="aspect-square bg-hexa-bg rounded-lg flex items-center justify-center border border-hexa-border hover:border-hexa-secondary/50 transition-colors cursor-pointer overflow-hidden relative"
                        >
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={`${work.title || 'Work'} - Image ${idx + 2}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error("Additional image load error:", imageUrl);
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <ImageIcon className={`w-8 h-8 text-hexa-text-light opacity-30 ${imageUrl ? 'hidden' : ''}`} />
                        </div>
                      );
                    })}
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
                {work.category && (
                  <div>
                    <p className="text-sm text-hexa-text-light mb-1">
                      {getDashboardText("category", language)}
                    </p>
                    <Badge variant="outline" className="bg-hexa-bg text-hexa-text-light border-hexa-border">
                      {work.category}
                    </Badge>
                  </div>
                )}
                {work.date && (
                  <div>
                    <p className="text-sm text-hexa-text-light mb-1">
                      {getDashboardText("workDate", language)}
                    </p>
                    <p className="text-hexa-text-dark font-medium">
                      {work.date ? new Date(work.date).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                )}
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
                {work.status && (
                  <div>
                    <p className="text-sm text-hexa-text-light mb-1">
                      {language === "en" ? "Status" : "الحالة"}
                    </p>
                    <Badge className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
                      {work.status}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-hexa-card border-hexa-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-hexa-text-dark">
              {language === "en" ? "Delete Work" : "حذف العمل"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-hexa-text-light">
              {language === "en" 
                ? "Are you sure you want to delete this work? This action cannot be undone."
                : "هل أنت متأكد من حذف هذا العمل؟ لا يمكن التراجع عن هذا الإجراء."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary/20"
              disabled={deleting}
            >
              {language === "en" ? "Cancel" : "إلغاء"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {language === "en" ? "Deleting..." : "جاري الحذف..."}
                </>
              ) : (
                language === "en" ? "Delete" : "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default WorkDetails;

