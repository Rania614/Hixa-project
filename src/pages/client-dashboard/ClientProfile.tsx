import React from "react";
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
                    defaultValue="Ahmed Al-Saud" 
                    className="bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Email" : "البريد الإلكتروني"}</Label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 transform -translate-y-1/2 text-hexa-text-light w-4 h-4 ${language === "ar" ? "right-3" : "left-3"}`} />
                    <Input 
                      type="email" 
                      defaultValue="ahmed@example.com" 
                      className={`${language === "ar" ? "pr-10" : "pl-10"} bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11`}
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Phone Number" : "رقم الهاتف"}</Label>
                  <div className="relative">
                    <Phone className={`absolute top-1/2 transform -translate-y-1/2 text-hexa-text-light w-4 h-4 ${language === "ar" ? "right-3" : "left-3"}`} />
                    <Input 
                      type="tel" 
                      defaultValue="+966 50 123 4567" 
                      className={`${language === "ar" ? "pr-10" : "pl-10"} bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11`}
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Location" : "الموقع"}</Label>
                  <div className="relative">
                    <MapPin className={`absolute top-1/2 transform -translate-y-1/2 text-hexa-text-light w-4 h-4 ${language === "ar" ? "right-3" : "left-3"}`} />
                    <Input 
                      defaultValue="Riyadh, Saudi Arabia" 
                      className={`${language === "ar" ? "pr-10" : "pl-10"} bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11`}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2.5">
                  <Label className="text-hexa-text-dark text-base font-medium">{language === "en" ? "Bio" : "نبذة"}</Label>
                  <textarea
                    className="w-full min-h-[120px] p-4 border-hexa-border rounded-lg resize-none bg-hexa-bg text-hexa-text-dark placeholder:text-hexa-text-light border focus:outline-none focus:ring-2 focus:ring-hexa-secondary/50 focus:border-hexa-secondary transition-all"
                    placeholder={language === "en" ? "Tell us about yourself..." : "أخبرنا عن نفسك..."}
                    defaultValue="Experienced project manager with a passion for innovative engineering solutions."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-hexa-border">
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary h-11 px-6"
                >
                  {language === "en" ? "Cancel" : "إلغاء"}
                </Button>
                <Button className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black font-semibold h-11 px-6">
                  <Save className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {language === "en" ? "Save Changes" : "حفظ التغييرات"}
                </Button>
              </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;

