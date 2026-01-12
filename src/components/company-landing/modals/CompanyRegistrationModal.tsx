import React, { useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { http } from "@/services/http";
import { toast } from "@/components/ui/sonner";

interface CompanyRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  language: "en" | "ar";
}

export const CompanyRegistrationModal: React.FC<CompanyRegistrationModalProps> = ({
  open,
  onClose,
  language,
}) => {
  const [formData, setFormData] = useState({
    companyName: "",
    businessType: "",
    shortDescription: "",
    phoneNumber: "",
    email: "",
    city: "",
    adType: "Normal",
  });

  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAr = language === "ar";

  const businessTypes = [
    { value: "Contracting", label: { en: "Contracting", ar: "مقاولات" } },
    { value: "Design", label: { en: "Design", ar: "تصميم" } },
    { value: "Finishing", label: { en: "Finishing", ar: "تشطيب" } },
    { value: "Consulting", label: { en: "Consulting", ar: "استشارات" } },
    {
      value: "Project Management",
      label: { en: "Project Management", ar: "إدارة المشاريع" },
    },
    { value: "Other", label: { en: "Other", ar: "أخرى" } },
  ];

  const adTypes = [
    { value: "Normal", label: { en: "Normal", ar: "عادي" } },
    { value: "Featured", label: { en: "Featured", ar: "مميز" } },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(
          isAr
            ? "حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)"
            : "Image size too large (max 5MB)"
        );
        return;
      }
      setCompanyLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (errors.companyLogo) {
        setErrors((prev) => ({ ...prev, companyLogo: "" }));
      }
    }
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      toast.error(
        isAr
          ? "يمكنك رفع صورة أو صورتين فقط"
          : "You can upload 1-2 images only"
      );
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(
          isAr
            ? "حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)"
            : "Image size too large (max 5MB)"
        );
        return;
      }
    });

    setPortfolioImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPortfolioPreviews(previews);
  };

  const removePortfolioImage = (index: number) => {
    const newImages = portfolioImages.filter((_, i) => i !== index);
    const newPreviews = portfolioPreviews.filter((_, i) => i !== index);
    setPortfolioImages(newImages);
    setPortfolioPreviews(newPreviews);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = isAr
        ? "اسم الشركة مطلوب"
        : "Company name is required";
    }

    if (!formData.businessType) {
      newErrors.businessType = isAr
        ? "نوع العمل مطلوب"
        : "Business type is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = isAr
        ? "رقم الهاتف مطلوب"
        : "Phone number is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = isAr ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = isAr
        ? "البريد الإلكتروني غير صحيح"
        : "Invalid email format";
    }

    if (!formData.city.trim()) {
      newErrors.city = isAr ? "المدينة مطلوبة" : "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("businessType", formData.businessType);
      formDataToSend.append("shortDescription", formData.shortDescription);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("adType", formData.adType);

      if (companyLogo) {
        formDataToSend.append("companyLogo", companyLogo);
      }

      portfolioImages.forEach((image, index) => {
        formDataToSend.append(`portfolioImage${index + 1}`, image);
      });

      // Submit to API - adjust endpoint as needed
      await http.post("/companies/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        isAr
          ? "تم إرسال طلب التسجيل بنجاح"
          : "Registration request submitted successfully"
      );

      // Reset form
      setFormData({
        companyName: "",
        businessType: "",
        shortDescription: "",
        phoneNumber: "",
        email: "",
        city: "",
        adType: "Normal",
      });
      setCompanyLogo(null);
      setPortfolioImages([]);
      setLogoPreview(null);
      setPortfolioPreviews([]);
      setErrors({});

      onClose();
    } catch (error: any) {
      console.error("Error submitting registration:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        (isAr ? "فشل إرسال الطلب" : "Failed to submit registration");
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div
        className="relative z-50 w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-card-foreground">
            {isAr ? "تسجيل شركتك" : "Register Your Company"}
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              {isAr ? "اسم الشركة" : "Company Name"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className={errors.companyName ? "border-red-500" : ""}
              placeholder={
                isAr ? "أدخل اسم الشركة" : "Enter company name"
              }
            />
            {errors.companyName && (
              <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
            )}
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              {isAr ? "نوع العمل" : "Business Type"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => handleSelectChange("businessType", value)}
            >
              <SelectTrigger
                className={errors.businessType ? "border-red-500" : ""}
              >
                <SelectValue
                  placeholder={
                    isAr ? "اختر نوع العمل" : "Select business type"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessType && (
              <p className="text-red-500 text-xs mt-1">
                {errors.businessType}
              </p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              {isAr ? "وصف مختصر" : "Short Description"}
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder={
                isAr
                  ? "أدخل وصف مختصر عن الشركة"
                  : "Enter a short description about the company"
              }
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              {isAr ? "رقم الهاتف" : "Phone Number"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              className={errors.phoneNumber ? "border-red-500" : ""}
              placeholder={isAr ? "+201234567890" : "+1234567890"}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              {isAr ? "البريد الإلكتروني" : "Email"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={errors.email ? "border-red-500" : ""}
              placeholder={isAr ? "email@example.com" : "your.email@example.com"}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              {isAr ? "المدينة" : "City"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className={errors.city ? "border-red-500" : ""}
              placeholder={isAr ? "أدخل المدينة" : "Enter city"}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          {/* Company Logo */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              {isAr ? "شعار الشركة" : "Company Logo"}
            </label>
            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">
                      {isAr ? "رفع" : "Upload"}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  disabled={submitting}
                />
              </label>
              {logoPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCompanyLogo(null);
                    setLogoPreview(null);
                  }}
                  disabled={submitting}
                >
                  {isAr ? "إزالة" : "Remove"}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isAr
                ? "الحد الأقصى 5 ميجابايت"
                : "Max 5MB"}
            </p>
          </div>

          {/* Portfolio Images */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              {isAr ? "صور المحفظة" : "Portfolio Images"} ({isAr ? "اختياري" : "Optional"})
            </label>
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {isAr
                    ? "رفع 1-2 صور (الحد الأقصى 5 ميجابايت لكل صورة)"
                    : "Upload 1-2 images (max 5MB per image)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePortfolioChange}
                  className="hidden"
                  disabled={submitting || portfolioImages.length >= 2}
                />
              </label>

              {/* Portfolio Previews */}
              {portfolioPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {portfolioPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removePortfolioImage(index)}
                        disabled={submitting}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ad Type */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              {isAr ? "نوع الإعلان" : "Ad Type"}
            </label>
            <Select
              value={formData.adType}
              onValueChange={(value) => handleSelectChange("adType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {adTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="px-6"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-6 bg-gold hover:bg-gold-dark text-black font-semibold disabled:opacity-50"
            >
              {submitting
                ? isAr
                  ? "جاري الإرسال..."
                  : "Submitting..."
                : isAr
                ? "سجل الآن"
                : "Register Now"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

