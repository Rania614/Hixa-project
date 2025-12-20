import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
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

const ClientProfile = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: "Ahmed Al-Saud",
      email: "ahmed@example.com",
      countryCode: "SA",
      phone: "+966501234567",
      location: "Riyadh, Saudi Arabia",
      bio: "Experienced project manager with a passion for innovative engineering solutions.",
    },
  });
  
  const onSubmit = (data: any) => {
    console.log("Form data:", data);
    // TODO: Implement API call to update profile
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-start gap-6 pb-6 border-b border-hexa-border">
                <Avatar className="w-24 h-24 flex-shrink-0">
                  <AvatarFallback className="bg-hexa-secondary text-black text-2xl">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-hexa-text-dark mb-3">
                    {language === "en" ? "Profile Picture" : "صورة الملف الشخصي"}
                  </h3>
                  <Button 
                    type="button"
                    variant="outline"
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
                <Button type="submit" className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11 px-6">
                  <Save className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {language === "en" ? "Save Changes" : "حفظ التغييرات"}
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

