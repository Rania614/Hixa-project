import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Save, Star, Award, Loader2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { profileApi } from "@/services/profileApi";
import { toast } from "@/components/ui/sonner";
import { http } from "@/services/http";
import { CountryPhoneInput } from "@/components/shared/CountryPhoneInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Helper function to get full image URL
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath || imagePath.trim() === '') return '';
  
  const trimmedPath = imagePath.trim();
  
  // If it's already a full URL (http:// or https://), return as is
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }
  
  // If it's a data URL (base64), return as is
  if (trimmedPath.startsWith('data:')) {
    return trimmedPath;
  }
  
  // If it starts with /, it's an absolute path from the API base
  if (trimmedPath.startsWith('/')) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    // Remove trailing slash from base URL if exists
    const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    return `${base}${trimmedPath}`;
  }
  
  // Otherwise, treat as relative path
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  return `${base}/${trimmedPath}`;
};

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
  
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      email: "",
      countryCode: "SA",
      phone: "",
      city: "",
      location: "",
      bio: "",
    },
  });
  
  const formData = watch();
  
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<Array<{ name: string; year: string }>>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch profile data from API
  useEffect(() => {
    
    fetchProfile();
  }, []);
  
  // Debug: Log formData changes
  useEffect(() => {
    
  }, [formData]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const data = await profileApi.getProfile();
      
      
      
      
      
      
      
      
      
      
      
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
                     data.avatar.src ||
                     "";
          
          // If avatar object exists but has no URL, it might be uploaded but URL not in object
          // In this case, we might need to construct URL from the avatar object info
          if (!avatarUrl && data.avatar.uploadedAt) {
            
            // Try to construct URL from filename if available
            if (data.avatar.filename) {
              avatarUrl = data.avatar.filename;
            }
          }
        }
      }
      
      // Fallback to other image fields if avatar is not available
      if (!avatarUrl) {
        avatarUrl = data.profileImage || data.image || "";
      }
      
      // Convert to full URL if it's a relative path
      if (avatarUrl) {
        avatarUrl = getImageUrl(avatarUrl);
      }
      
      
      
      
      
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
      
      
      
      setProfileData(mappedProfileData);
      
      // Extract country code - prefer from data.countryCode, otherwise from phone
      let countryCode = data.countryCode || "SA";
      let phoneNumber = data.phone || data.phoneNumber || "";
      
      // If countryCode not in data, try to detect from phone
      if (!data.countryCode && phoneNumber && phoneNumber.startsWith("+")) {
        const detectedCountry = getCountryFromPhone(phoneNumber);
        if (detectedCountry) {
          countryCode = detectedCountry;
        }
      }
      
      const mappedFormData = {
        name: data.name || "",
        email: data.email || "",
        countryCode,
        phone: phoneNumber,
        city: data.city || "",
        location: data.location || data.address || "",
        bio: data.bio || data.description || "",
      };
      
      
      
      // Update form values
      setValue("name", mappedFormData.name);
      setValue("email", mappedFormData.email);
      setValue("countryCode", mappedFormData.countryCode);
      setValue("phone", mappedFormData.phone);
      setValue("city", mappedFormData.city);
      setValue("location", mappedFormData.location);
      setValue("bio", mappedFormData.bio);
      setSpecializations(Array.isArray(data.specializations) ? data.specializations : []);
      setCertifications(Array.isArray(data.certifications) ? data.certifications : []);
      
      if (avatarUrl) {
        
        setImagePreview(avatarUrl);
      } else {
        
      }
      
      
    } catch (error: any) {
      
      
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
      
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setValue(field as any, value);
  };
  
  // Helper function to get country from phone
  const getCountryFromPhone = (phone: string): string | null => {
    if (!phone || !phone.startsWith("+")) return null;
    const countryOptions = [
      { code: "EG", dialCode: "+20" },
      { code: "SA", dialCode: "+966" },
      { code: "AE", dialCode: "+971" },
      { code: "KW", dialCode: "+965" },
      { code: "QA", dialCode: "+974" },
    ];
    for (const option of countryOptions) {
      if (phone.startsWith(option.dialCode)) {
        return option.code;
      }
    }
    return null;
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

  const handleSave = async (data: any) => {
    try {
      setSaving(true);
      
      // Helper function to get country name from country code
      const getCountryNameFromCode = (code: string): string => {
        const countryMap: Record<string, string> = {
          SA: "السعودية",
          AE: "الإمارات",
          KW: "الكويت",
          QA: "قطر",
          BH: "البحرين",
          OM: "عُمان",
          EG: "مصر",
          JO: "الأردن",
          LB: "لبنان",
          SY: "سوريا",
          YE: "اليمن",
          SD: "السودان",
          LY: "ليبيا",
        };
        return countryMap[code] || "";
      };
      
      // Prepare update data
      const updateData: any = {
        name: data.name,
        email: data.email,
      };
      
      // Add phone and countryCode if available
      if (data.phone) {
        updateData.phone = data.phone;
      }
      if (data.countryCode) {
        updateData.countryCode = data.countryCode;
        // Also set country name from country code
        const countryName = getCountryNameFromCode(data.countryCode);
        if (countryName) {
          updateData.country = countryName;
        }
      }
      
      // Add city if available
      if (data.city) {
        updateData.city = data.city;
      }
      
      // Add location if available (for backward compatibility)
      if (data.location) {
        updateData.location = data.location;
      }
      if (data.bio) {
        updateData.bio = data.bio;
      }
      
      // Add specializations if available
      if (specializations.length > 0) {
        updateData.specializations = specializations;
      }
      
      // Add certifications if available
      if (certifications.length > 0) {
        updateData.certifications = certifications;
      }
      
      
      
      
      // Update profile with or without avatar using profileApi
      const updatedProfile = await profileApi.updateProfile(
        updateData,
        selectedImage || undefined
      );
      
      
      
      // Handle avatar from response - it's an object with url property
      let avatarUrl = "";
      if (updatedProfile.avatar) {
        if (typeof updatedProfile.avatar === 'string') {
          avatarUrl = updatedProfile.avatar;
        } else if (typeof updatedProfile.avatar === 'object') {
          avatarUrl = updatedProfile.avatar.url || 
                     updatedProfile.avatar.path || 
                     updatedProfile.avatar.filename ||
                     updatedProfile.avatar.src ||
                     "";
        }
      }
      
      // Fallback to other image fields
      if (!avatarUrl) {
        avatarUrl = updatedProfile.profileImage || updatedProfile.image || "";
      }
      
      // Convert to full URL if it's a relative path
      if (avatarUrl) {
        avatarUrl = getImageUrl(avatarUrl);
      } else if (imagePreview) {
        // Keep the preview if no URL from server yet
        avatarUrl = imagePreview;
      }
      
      // Reset selected image after successful upload
      if (selectedImage) {
        setSelectedImage(null);
        if (avatarUrl) {
          setImagePreview(avatarUrl);
        }
      }
      
      // Update profileData with new data
      setProfileData((prev) => ({
        ...prev,
        name: updatedProfile.name || data.name,
        email: updatedProfile.email || data.email,
        phone: updatedProfile.phone || data.phone,
        location: updatedProfile.location || data.location,
        bio: updatedProfile.bio || data.bio,
        profileImage: avatarUrl,
        specializations: Array.isArray(updatedProfile.specializations) ? updatedProfile.specializations : specializations,
        certifications: Array.isArray(updatedProfile.certifications) ? updatedProfile.certifications : certifications,
        rating: updatedProfile.averageRating || updatedProfile.rating || prev.rating,
        reviewsCount: updatedProfile.reviewsCount || prev.reviewsCount,
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

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error(
        language === "en"
          ? "Please fill all password fields"
          : "يرجى ملء جميع حقول كلمة المرور"
      );
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(
        language === "en"
          ? "New password and confirmation do not match"
          : "كلمة المرور الجديدة والتأكيد غير متطابقين"
      );
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(
        language === "en"
          ? "Password must be at least 6 characters"
          : "يجب أن تكون كلمة المرور 6 أحرف على الأقل"
      );
      return;
    }

    try {
      setChangingPassword(true);
      await http.put("/users/me/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmPassword,
      });

      toast.success(
        language === "en"
          ? "Password changed successfully"
          : "تم تغيير كلمة المرور بنجاح"
      );

      // Reset password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "";
      toast.error(
        language === "en"
          ? `Failed to change password${errorMessage ? ": " + errorMessage : ""}`
          : `فشل تغيير كلمة المرور${errorMessage ? ": " + errorMessage : ""}`
      );
    } finally {
      setChangingPassword(false);
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
            <form onSubmit={handleSubmit(handleSave)} className="space-y-8">
            <div className="flex items-start gap-6 pb-6 border-b border-hexa-border">
              <Avatar className="w-24 h-24 flex-shrink-0">
                {imagePreview || profileData.profileImage ? (
                  <AvatarImage 
                    src={imagePreview || profileData.profileImage} 
                    alt="Profile"
                    onError={(e) => {
                      
                      // Hide the image on error, fallback will show
                      e.currentTarget.style.display = 'none';
                    }}
                  />
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
                  type="button"
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
              <CountryPhoneInput
                control={control}
                countryCodeName="countryCode"
                phoneName="phone"
                cityName="city"
                label={language === "en" ? "Contact Information" : "معلومات الاتصال"}
                errors={errors}
                className="md:col-span-2"
              />
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

            {/* <div className="flex items-center gap-4 p-4 bg-hexa-bg rounded-lg border border-hexa-border">
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
            </div> */}

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-hexa-border">
              <Button
                type="submit"
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
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader className="pb-6">
            <CardTitle className="text-hexa-text-dark text-xl flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {language === "en" ? "Change Password" : "تغيير كلمة المرور"}
            </CardTitle>
            <CardDescription className="text-hexa-text-light mt-2">
              {language === "en" 
                ? "Update your password to keep your account secure" 
                : "قم بتحديث كلمة المرور للحفاظ على أمان حسابك"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 md:px-8 pb-8">
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2.5">
                <Label className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Current Password" : "كلمة المرور الحالية"} *
                </Label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  placeholder={language === "en" ? "Enter current password" : "أدخل كلمة المرور الحالية"}
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "New Password" : "كلمة المرور الجديدة"} *
                </Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  placeholder={language === "en" ? "Enter new password" : "أدخل كلمة المرور الجديدة"}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-hexa-text-dark text-base font-medium">
                  {language === "en" ? "Confirm New Password" : "تأكيد كلمة المرور الجديدة"} *
                </Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  placeholder={language === "en" ? "Confirm new password" : "أكد كلمة المرور الجديدة"}
                  required
                  minLength={6}
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-hexa-border">
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11 px-6"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className={`w-4 h-4 animate-spin ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {language === "en" ? "Changing..." : "جاري التغيير..."}
                    </>
                  ) : (
                    <>
                      <Lock className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {language === "en" ? "Change Password" : "تغيير كلمة المرور"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EngineerProfile;

