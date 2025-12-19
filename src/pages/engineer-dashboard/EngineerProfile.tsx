import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Save, Star, Award, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { http } from "@/services/http";
import { toast } from "@/components/ui/sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  specializations?: string[];
  certifications?: Array<{ name: string; year: string }>;
  rating?: number;
  reviewsCount?: number;
}

const EngineerProfile = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    profileImage: "",
    specializations: [],
    certifications: [],
    rating: 0,
    reviewsCount: 0,
  });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });
  
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<Array<{ name: string; year: string }>>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch profile data from API
  useEffect(() => {
    console.log("🔄 useEffect triggered - fetching profile data...");
    fetchProfile();
  }, []);
  
  // Debug: Log formData changes
  useEffect(() => {
    console.log("📝 formData state changed:", formData);
  }, [formData]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await http.get("/users/me");
      
      console.log("📥 Full response object:", response);
      console.log("📥 response.data:", response.data);
      console.log("📥 response.data type:", typeof response.data);
      console.log("📥 response.data keys:", response.data ? Object.keys(response.data) : "no data");
      
      // Handle different response structures
      // API might return data in response.data.data or response.data.user or directly in response.data
      let data = response.data;
      
      // Check if data is nested
      if (data && data.data) {
        console.log("📥 Data found in response.data.data");
        data = data.data;
      } else if (data && data.user) {
        console.log("📥 Data found in response.data.user");
        data = data.user;
      } else if (data && data.profile) {
        console.log("📥 Data found in response.data.profile");
        data = data.profile;
      }
      
      console.log("📥 Final data object:", data);
      console.log("📥 Final data keys:", data ? Object.keys(data) : "no data");
      console.log("📥 Full data JSON:", JSON.stringify(data, null, 2));
      console.log("📥 Avatar structure:", data?.avatar);
      console.log("📥 Name:", data?.name);
      console.log("📥 Email:", data?.email);
      console.log("📥 Phone:", data?.phone);
      console.log("📥 Location:", data?.location);
      console.log("📥 Bio:", data?.bio);
      
      // Handle avatar - it's an object that might have different properties
      // Check all possible avatar URL properties
      let avatarUrl = "";
      if (data.avatar) {
        if (typeof data.avatar === 'string') {
          avatarUrl = data.avatar;
        } else if (typeof data.avatar === 'object') {
          // Try different possible properties
          avatarUrl = data.avatar.url || 
                     data.avatar.path || 
                     data.avatar.filename || 
                     data.avatar.originalName ||
                     "";
          
          // If avatar object exists but has no URL, it might be uploaded but URL not in object
          // In this case, we might need to construct URL from the avatar object info
          if (!avatarUrl && data.avatar.uploadedAt) {
            console.log("⚠️ Avatar object exists but no URL found:", data.avatar);
          }
        }
      }
      
      // Fallback to other image fields if avatar is not available
      if (!avatarUrl) {
        avatarUrl = data.profileImage || data.image || "";
      }
      
      console.log("📥 Final avatar URL:", avatarUrl);
      
      // Map API data to our form structure
      const mappedProfileData = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || data.phoneNumber || "",
        location: data.location || data.address || "",
        bio: data.bio || data.description || "",
        profileImage: avatarUrl,
        specializations: Array.isArray(data.specializations) ? data.specializations : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        rating: data.averageRating || data.rating || 0,
        reviewsCount: data.reviewsCount || 0,
      };
      
      console.log("📥 Mapped profile data:", mappedProfileData);
      setProfileData(mappedProfileData);
      
      const mappedFormData = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || data.phoneNumber || "",
        location: data.location || data.address || "",
        bio: data.bio || data.description || "",
      };
      
      console.log("📥 Mapped form data:", mappedFormData);
      console.log("📥 Setting formData state with:", mappedFormData);
      
      // Force update formData
      setFormData(mappedFormData);
      setSpecializations(Array.isArray(data.specializations) ? data.specializations : []);
      setCertifications(Array.isArray(data.certifications) ? data.certifications : []);
      
      if (avatarUrl) {
        setImagePreview(avatarUrl);
      }
      
      console.log("✅ Profile data loaded and state updated successfully");
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      
      // Don't show error toast for 401 - the interceptor will handle redirect
      // Don't show error toast for 404 - endpoint might not exist yet
      if (error.response?.status === 401) {
        // Token expired or invalid - interceptor will redirect to login
        setLoading(false);
        return;
      }
      
      if (error.response?.status !== 404) {
        const errorMessage = error.response?.data?.message || error.message || "";
        toast.error(
          language === "en"
            ? `Failed to load profile data${errorMessage ? ": " + errorMessage : ""}`
            : `فشل تحميل بيانات الملف الشخصي${errorMessage ? ": " + errorMessage : ""}`
        );
      }
    } finally {
      setLoading(false);
      console.log("🔄 Loading state set to false");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(
          language === "en"
            ? "Image size must be less than 2MB"
            : "يجب أن يكون حجم الصورة أقل من 2MB"
        );
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(
          language === "en"
            ? "Please select an image file"
            : "يرجى اختيار ملف صورة"
        );
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Always update profile data first (without image) using JSON
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };
      
      // Only add optional fields if they have values
      if (formData.phone) {
        updateData.phone = formData.phone;
      }
      if (formData.location) {
        updateData.location = formData.location;
      }
      if (formData.bio) {
        updateData.bio = formData.bio;
      }
      
      // Add specializations if available
      if (specializations.length > 0) {
        updateData.specializations = specializations;
      }
      
      // Add certifications if available
      if (certifications.length > 0) {
        updateData.certifications = certifications;
      }
      
      console.log("📤 Sending profile data (JSON):", updateData);
      
      // Update profile data first
      let response = await http.put("/users/me", updateData);
      
      // If there's an image, upload it separately
      if (selectedImage) {
        console.log("📤 Uploading avatar image separately...");
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", selectedImage);
        
        // Try to upload avatar - might need a different endpoint
        // For now, try the same endpoint with FormData containing only avatar
        try {
          const avatarResponse = await http.put("/users/me/avatar", avatarFormData);
          console.log("✅ Avatar uploaded successfully:", avatarResponse.data);
        } catch (avatarError: any) {
          console.warn("⚠️ Failed to upload avatar separately:", avatarError);
          // If separate endpoint doesn't work, try with the main endpoint using FormData
          // But only with avatar field
          try {
            const avatarFormDataOnly = new FormData();
            avatarFormDataOnly.append("avatar", selectedImage);
            const avatarResponse2 = await http.put("/users/me", avatarFormDataOnly);
            console.log("✅ Avatar uploaded successfully (alternative method):", avatarResponse2.data);
            // Update response with avatar data
            response.data = { ...response.data, ...avatarResponse2.data };
          } catch (avatarError2: any) {
            console.error("❌ Failed to upload avatar:", avatarError2);
            // Don't fail the whole update if avatar upload fails
            toast.error(
              language === "en"
                ? "Profile updated but avatar upload failed"
                : "تم تحديث الملف الشخصي لكن فشل رفع الصورة"
            );
          }
        }
      }
      
      // Update local state with response
      const updatedData = response.data;
      
      // Handle avatar from response - it's an object with url property
      let avatarUrl = "";
      if (updatedData.avatar) {
        if (typeof updatedData.avatar === 'string') {
          avatarUrl = updatedData.avatar;
        } else if (updatedData.avatar.url) {
          avatarUrl = updatedData.avatar.url;
        } else if (updatedData.avatar.path) {
          avatarUrl = updatedData.avatar.path;
        }
      }
      
      // Fallback to other image fields
      if (!avatarUrl) {
        avatarUrl = updatedData.profileImage || updatedData.image || imagePreview || "";
      }
      
      // Update profileData with new data
      setProfileData((prev) => ({
        ...prev,
        name: updatedData.name || formData.name,
        email: updatedData.email || formData.email,
        phone: updatedData.phone || formData.phone,
        location: updatedData.location || formData.location,
        bio: updatedData.bio || formData.bio,
        profileImage: avatarUrl,
        specializations: Array.isArray(updatedData.specializations) ? updatedData.specializations : specializations,
        certifications: Array.isArray(updatedData.certifications) ? updatedData.certifications : certifications,
        rating: updatedData.averageRating || updatedData.rating || prev.rating,
        reviewsCount: updatedData.reviewsCount || prev.reviewsCount,
      }));
      
      // Update image preview if we got a new image URL
      if (avatarUrl) {
        setImagePreview(avatarUrl);
      }
      
      toast.success(
        language === "en"
          ? "Profile updated successfully"
          : "تم تحديث الملف الشخصي بنجاح"
      );
      
      // Clear selected image after successful save
      setSelectedImage(null);
      
      // Refresh profile data
      await fetchProfile();
      
    } catch (error: any) {
      console.error("Error updating profile:", error);
      console.error("Error response data:", error.response?.data);
      
      // Don't show error toast for 401 - the interceptor will handle redirect
      if (error.response?.status === 401) {
        // Token expired or invalid - interceptor will redirect to login
        setSaving(false);
        return;
      }
      
      // Get detailed error message
      let errorMessage = "";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.errors) {
          // Handle validation errors
          const errors = error.response.data.errors;
          if (Array.isArray(errors)) {
            errorMessage = errors.join(", ");
          } else if (typeof errors === 'object') {
            errorMessage = Object.values(errors).flat().join(", ");
          }
        }
      }
      
      if (!errorMessage) {
        errorMessage = error.message || "";
      }
      
      toast.error(
        language === "en"
          ? `Failed to update profile${errorMessage ? ": " + errorMessage : ""}`
          : `فشل تحديث الملف الشخصي${errorMessage ? ": " + errorMessage : ""}`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="engineer">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-hexa-secondary" />
            <p className="text-hexa-text-light">
              {language === "en" ? "Loading profile..." : "جاري تحميل الملف الشخصي..."}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-6 max-w-5xl mx-auto">
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
                {getDashboardText("profilePage", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("profilePage", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Manage your profile and showcase your expertise" : "إدارة ملفك الشخصي وعرض خبرتك"}
          </p>
        </div>

        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader className="pb-6">
            <CardTitle className="text-hexa-text-dark text-xl">{language === "en" ? "Profile Information" : "معلومات الملف الشخصي"}</CardTitle>
            <CardDescription className="text-hexa-text-light mt-2">
              {language === "en" ? "Update your personal information" : "تحديث معلوماتك الشخصية"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-6 md:px-8 pb-8">
            <div className="flex items-start gap-6 pb-6 border-b border-hexa-border">
              <Avatar className="w-24 h-24 flex-shrink-0">
                {imagePreview || profileData.profileImage ? (
                  <AvatarImage src={imagePreview || profileData.profileImage} alt="Profile" />
                ) : null}
                <AvatarFallback className="bg-hexa-secondary text-black text-2xl">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-hexa-text-dark mb-3">
                  {language === "en" ? "Profile Picture" : "صورة الملف الشخصي"}
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary mb-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {language === "en" ? "Change Photo" : "تغيير الصورة"}
                </Button>
                <p className="text-sm text-hexa-text-light">
                  {language === "en" ? "JPG, PNG or GIF. Max size 2MB" : "JPG أو PNG أو GIF. الحد الأقصى للحجم 2MB"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Full Name" : "الاسم الكامل"}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  placeholder={language === "en" ? "Enter your full name" : "أدخل اسمك الكامل"}
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Email" : "البريد الإلكتروني"}</Label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 transform -translate-y-1/2 text-hexa-text-light w-4 h-4 ${language === "ar" ? "right-3" : "left-3"}`} />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`${language === "ar" ? "pr-10" : "pl-10"} bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11`}
                    placeholder={language === "en" ? "Enter your email" : "أدخل بريدك الإلكتروني"}
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Phone Number" : "رقم الهاتف"}</Label>
                <div className="relative">
                  <Phone className={`absolute top-1/2 transform -translate-y-1/2 text-hexa-text-light w-4 h-4 ${language === "ar" ? "right-3" : "left-3"}`} />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`${language === "ar" ? "pr-10" : "pl-10"} bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11`}
                    placeholder={language === "en" ? "Enter your phone number" : "أدخل رقم هاتفك"}
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Location" : "الموقع"}</Label>
                <div className="relative">
                  <MapPin className={`absolute top-1/2 transform -translate-y-1/2 text-hexa-text-light w-4 h-4 ${language === "ar" ? "right-3" : "left-3"}`} />
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className={`${language === "ar" ? "pr-10" : "pl-10"} bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11`}
                    placeholder={language === "en" ? "Enter your location" : "أدخل موقعك"}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Bio" : "نبذة"}</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="min-h-[120px] bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light"
                placeholder={language === "en" ? "Tell us about yourself and your expertise..." : "أخبرنا عن نفسك وخبرتك..."}
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-hexa-text-dark text-base font-medium">{getDashboardText("specializations", language)}</Label>
              <div className="flex flex-wrap gap-2">
                {specializations.length > 0 ? (
                  specializations.map((spec, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm py-1.5 px-3 bg-hexa-bg text-hexa-text-light border-hexa-border">
                    {spec}
                  </Badge>
                  ))
                ) : (
                  <p className="text-sm text-hexa-text-light">
                    {language === "en" ? "No specializations added" : "لم يتم إضافة تخصصات"}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-hexa-text-dark text-base font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                {language === "en" ? "Certifications" : "الشهادات"}
              </Label>
              <div className="space-y-2">
                {certifications.length > 0 ? (
                  certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-hexa-border rounded-lg bg-hexa-bg">
                    <span className="text-hexa-text-dark">{cert.name}</span>
                    <span className="text-sm text-hexa-text-light">{cert.year}</span>
                  </div>
                  ))
                ) : (
                  <p className="text-sm text-hexa-text-light">
                    {language === "en" ? "No certifications added" : "لم يتم إضافة شهادات"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-hexa-bg rounded-lg border border-hexa-border">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold text-hexa-text-dark">
                  {profileData.rating?.toFixed(1) || "0.0"}
                </span>
              </div>
              <div>
                <p className="text-sm text-hexa-text-light">
                  {language === "en" ? "Average Rating" : "متوسط التقييم"}
                </p>
                <p className="text-sm text-hexa-text-light">
                  {language === "en"
                    ? `Based on ${profileData.reviewsCount || 0} reviews`
                    : `بناءً على ${profileData.reviewsCount || 0} تقييم`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-hexa-border">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11 px-6"
              >
                {saving ? (
                  <>
                    <Loader2 className={`w-4 h-4 animate-spin ${language === "ar" ? "ml-2" : "mr-2"}`} />
                    {language === "en" ? "Saving..." : "جاري الحفظ..."}
                  </>
                ) : (
                  <>
                <Save className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                {language === "en" ? "Save Changes" : "حفظ التغييرات"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EngineerProfile;

