import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Save, Lock, Loader2 } from "lucide-react";
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
import { profileApi } from "@/services/profileApi";
import { toast } from "@/components/ui/sonner";

// Helper function to get full image URL
const getImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base = import.meta.env.VITE_API_BASE_URL || "/api";
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = url.startsWith("/") ? url : `/${url}`;
  return `${trimmedBase}${trimmedPath}`;
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

const ClientProfile = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      email: "",
      countryCode: "SA",
      phone: "",
      location: "",
      bio: "",
    },
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log("📤 Fetching profile from GET /users/me");
      const profile = await profileApi.getProfile();
      
      console.log("📥 Profile data:", profile);
      
      // Handle avatar
      let avatarUrl = "";
      if (profile.avatar) {
        if (typeof profile.avatar === 'string') {
          avatarUrl = profile.avatar;
        } else if (typeof profile.avatar === 'object' && profile.avatar.url) {
          avatarUrl = profile.avatar.url;
        }
      }
      
      // Convert to full URL if needed
      if (avatarUrl) {
        avatarUrl = getImageUrl(avatarUrl);
        setImagePreview(avatarUrl);
      }
      
      // Extract country code from phone if available
      let countryCode = "SA";
      let phoneNumber = profile.phone || "";
      
      if (phoneNumber && phoneNumber.startsWith("+")) {
        const detectedCountry = getCountryFromPhone(phoneNumber);
        if (detectedCountry) {
          countryCode = detectedCountry;
        }
      }
      
      // Update form values
      setValue("name", profile.name || "");
      setValue("email", profile.email || "");
      setValue("countryCode", countryCode);
      setValue("phone", phoneNumber);
      setValue("location", profile.location || "");
      setValue("bio", profile.bio || "");
      
      console.log("✅ Profile data loaded successfully");
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      
      // Don't show error toast for 401 - the interceptor will handle redirect
      if (error.response?.status === 401) {
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

  const onSubmit = async (data: any) => {
    try {
      setSaving(true);
      
      // Prepare update data
      const updateData: any = {
        name: data.name,
        email: data.email,
      };
      
      // Only add optional fields if they have values
      if (data.phone) {
        updateData.phone = data.phone;
      }
      if (data.location) {
        updateData.location = data.location;
      }
      if (data.bio) {
        updateData.bio = data.bio;
      }
      
      console.log("📤 Updating profile:", updateData);
      console.log("📤 Selected image:", selectedImage);
      
      // Update profile with or without avatar
      const updatedProfile = await profileApi.updateProfile(
        updateData,
        selectedImage || undefined
      );
      
      console.log("✅ Profile updated successfully:", updatedProfile);
      
      toast.success(
        language === "en"
          ? "Profile updated successfully"
          : "تم تحديث الملف الشخصي بنجاح"
      );
      
      // Reset selected image after successful upload
      if (selectedImage) {
        setSelectedImage(null);
        if (updatedProfile.avatar?.url) {
          const avatarUrl = getImageUrl(updatedProfile.avatar.url);
          setImagePreview(avatarUrl);
        }
      }
      
      // Refresh profile data
      await fetchProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "";
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
      await profileApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
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
      console.error("Error changing password:", error);
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

  return (
    <DashboardLayout userType="client">
      <div className="space-y-6 max-w-5xl mx-auto">
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
                {getDashboardText("profileSettings", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("profileSettings", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Manage your profile and account settings" : "إدارة ملفك الشخصي وإعدادات الحساب"}
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-hexa-secondary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-start gap-6 pb-6 border-b border-hexa-border">
                  <Avatar className="w-24 h-24 flex-shrink-0">
                    {imagePreview ? (
                      <AvatarImage src={imagePreview} alt="Profile" />
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
                      onClick={() => fileInputRef.current?.click()}
                      className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary mb-2"
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
                    {...control.register("name")}
                    className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Email" : "البريد الإلكتروني"}</Label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 transform -translate-y-1/2 text-hexa-text-light w-4 h-4 ${language === "ar" ? "right-3" : "left-3"}`} />
                    <Input 
                      type="email" 
                      {...control.register("email")}
                      className={`${language === "ar" ? "pr-10" : "pl-10"} bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11`}
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
                <div className="md:col-span-2 space-y-2.5">
                  <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Bio" : "نبذة"}</Label>
                  <textarea
                    {...control.register("bio")}
                    className="w-full min-h-[120px] p-4 border-hexa-border rounded-lg resize-none bg-hexa-bg text-hexa-text-dark placeholder:text-hexa-text-light border focus:outline-none focus:ring-2 focus:ring-hexa-secondary/50 focus:border-hexa-secondary transition-all"
                    placeholder={language === "en" ? "Tell us about yourself..." : "أخبرنا عن نفسك..."}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-hexa-border">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary h-11 px-6"
                >
                  {language === "en" ? "Cancel" : "إلغاء"}
                </Button>
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
            )}
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

export default ClientProfile;

