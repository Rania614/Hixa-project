import { useMemo, useRef, useState } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
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

type BusinessType = "Contracting" | "Design" | "Finishing" | "Consulting" | "Project Management" | "Other";
type AdType = "عادي" | "مميز";

interface PartnerRequestFormState {
  companyName: string;
  businessType: BusinessType | "";
  description: string;
  phone: string;
  email: string;
  city: string;
  adType: AdType;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

export const CompanyRegistrationModal: React.FC<CompanyRegistrationModalProps> = ({
  open,
  onClose,
  language,
}) => {
  const isAr = language === "ar";

  const [form, setForm] = useState<PartnerRequestFormState>({
    companyName: "",
    businessType: "",
    description: "",
    phone: "",
    email: "",
    city: "",
    adType: "عادي",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioPreviewUrls, setPortfolioPreviewUrls] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement | null>(null);

  const businessTypes = useMemo(
    () => [
      { value: "Contracting", label: { en: "Contracting", ar: "مقاولات" } },
      { value: "Design", label: { en: "Design", ar: "تصميم" } },
      { value: "Finishing", label: { en: "Finishing", ar: "تشطيب" } },
      { value: "Consulting", label: { en: "Consulting", ar: "استشارات" } },
      { value: "Project Management", label: { en: "Project Management", ar: "إدارة المشاريع" } },
      { value: "Other", label: { en: "Other", ar: "أخرى" } },
    ],
    []
  );

  const adTypes = useMemo(
    () => [
      { value: "عادي", label: { en: "Normal", ar: "عادي" } },
      { value: "مميز", label: { en: "Featured", ar: "مميز" } },
    ],
    []
  );

  const setField = (key: keyof PartnerRequestFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value } as PartnerRequestFormState));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateImageFile = (file: File): string | null => {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return isAr ? "حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)" : "Image size too large (max 5MB)";
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return isAr
        ? "نوع الملف غير مدعوم. يرجى رفع صورة بصيغة jpeg, jpg, png, gif, أو webp"
        : "File type not supported. Please upload jpeg, jpg, png, gif, or webp";
    }
    return null;
  };

  const handleLogoPicked = (file: File) => {
    const err = validateImageFile(file);
    if (err) {
      toast.error(err);
      if (logoInputRef.current) logoInputRef.current.value = "";
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreviewUrl(reader.result as string);
    reader.onerror = () => toast.error(isAr ? "فشل قراءة الصورة" : "Failed to read image");
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleLogoPicked(file);
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // enforce max 2
    const sliced = files.slice(0, 2);
    const valid: File[] = [];

    for (const f of sliced) {
      const err = validateImageFile(f);
      if (err) {
        toast.error(err);
        continue;
      }
      valid.push(f);
    }

    // Replace current selection (simpler + matches UI text)
    setPortfolioFiles(valid);
    // revoke old
    portfolioPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPortfolioPreviewUrls(valid.map((f) => URL.createObjectURL(f)));
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index));
    setPortfolioPreviewUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // revoke removed url
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!form.companyName.trim()) next.companyName = isAr ? "اسم الشركة مطلوب" : "Company name is required";
    if (!form.businessType) next.businessType = isAr ? "نوع العمل مطلوب" : "Business type is required";
    if (!form.phone.trim()) next.phone = isAr ? "رقم الهاتف مطلوب" : "Phone number is required";
    if (!form.email.trim()) next.email = isAr ? "البريد الإلكتروني مطلوب" : "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = isAr ? "البريد الإلكتروني غير صحيح" : "Invalid email format";
    if (!form.city.trim()) next.city = isAr ? "المدينة مطلوبة" : "City is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    try {
      setSubmitting(true);

      const fd = new FormData();
      // These keys match what you showed from the DB record
      fd.append("companyName", form.companyName.trim());
      fd.append("businessType", form.businessType);
      fd.append("description", form.description.trim());
      fd.append("phone", form.phone.trim());
      fd.append("email", form.email.trim());
      fd.append("city", form.city.trim());
      fd.append("adType", form.adType);

      // Logo: file upload (backend should store logo URL/path into `logo`)
      if (logoFile) {
        fd.append("logo", logoFile);
      }

      // Optional portfolio images (0-2)
      portfolioFiles.forEach((img) => fd.append("portfolioImages", img));

      await http.post("/partner-requests", fd);

      toast.success(isAr ? "تم إرسال الطلب بنجاح" : "Request submitted successfully");

      // Reset on success only
      setForm({
        companyName: "",
        businessType: "",
        description: "",
        phone: "",
        email: "",
        city: "",
        adType: "عادي",
      });
      setLogoFile(null);
      setLogoPreviewUrl(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
      setPortfolioFiles([]);
      portfolioPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
      setPortfolioPreviewUrls([]);
      if (portfolioInputRef.current) portfolioInputRef.current.value = "";
      setErrors({});

      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (isAr ? "فشل إرسال الطلب" : "Failed to submit request");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none opacity-0"} transition-opacity`}>
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative z-50 w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          dir={isAr ? "rtl" : "ltr"}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-card-foreground">
              {isAr ? "تسجيل شركتك" : "Register Your Company"}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {isAr ? "اسم الشركة" : "Company Name"} <span className="text-red-500">*</span>
              </label>
              <Input
                name="companyName"
                value={form.companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                disabled={submitting}
                className={errors.companyName ? "border-red-500" : ""}
                placeholder={isAr ? "أدخل اسم الشركة" : "Enter company name"}
              />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {isAr ? "نوع العمل" : "Business Type"} <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.businessType}
                onValueChange={(v) => setField("businessType", v)}
                disabled={submitting}
              >
                <SelectTrigger className={errors.businessType ? "border-red-500" : ""}>
                  <SelectValue placeholder={isAr ? "اختر نوع العمل" : "Select business type"} />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label[language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {isAr ? "وصف مختصر" : "Short Description"}
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                disabled={submitting}
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder={isAr ? "أدخل وصف مختصر عن الشركة" : "Enter a short description about the company"}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  {isAr ? "رقم الهاتف" : "Phone Number"} <span className="text-red-500">*</span>
                </label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  disabled={submitting}
                  className={errors.phone ? "border-red-500" : ""}
                  placeholder={isAr ? "+201234567890" : "+1234567890"}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  {isAr ? "البريد الإلكتروني" : "Email"} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  disabled={submitting}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder={isAr ? "email@example.com" : "your.email@example.com"}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {isAr ? "المدينة" : "City"} <span className="text-red-500">*</span>
              </label>
              <Input
                name="city"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                disabled={submitting}
                className={errors.city ? "border-red-500" : ""}
                placeholder={isAr ? "أدخل المدينة" : "Enter city"}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {isAr ? "نوع الإعلان" : "Ad Type"}
              </label>
              <Select value={form.adType} onValueChange={(v) => setField("adType", v)} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {adTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label[language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Logo upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-card-foreground">
                  {isAr ? "شعار الشركة" : "Company Logo"}
                </label>
                <span className="text-xs text-muted-foreground">{isAr ? "اختياري" : "Optional"}</span>
              </div>

              <div className="flex items-center gap-4">
                <label
                  className={`relative flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    submitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {logoPreviewUrl ? (
                    <img
                      src={logoPreviewUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">{isAr ? "رفع" : "Upload"}</span>
                    </>
                  )}

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleLogoChange}
                    disabled={submitting}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>

                {logoPreviewUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={submitting}
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreviewUrl(null);
                      if (logoInputRef.current) logoInputRef.current.value = "";
                    }}
                  >
                    {isAr ? "إزالة" : "Remove"}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{isAr ? "الحد الأقصى 5 ميجابايت" : "Max 5MB"}</p>
            </div>

            {/* Portfolio images (optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-card-foreground">
                {isAr ? "صور المحفظة (اختياري)" : "Portfolio Images (Optional)"}
              </label>

              <label
                className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  submitting ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {isAr
                    ? "رفع 1-2 صور (الحد الأقصى 5 ميجابايت لكل صورة)"
                    : "Upload 1-2 images (max 5MB per image)"}
                </span>
                <input
                  ref={portfolioInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handlePortfolioChange}
                  disabled={submitting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>

              {portfolioPreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {portfolioPreviewUrls.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={preview}
                        alt={`Portfolio ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removePortfolioImage(idx);
                        }}
                        disabled={submitting}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                        aria-label="Remove portfolio image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting} className="px-6">
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="px-6 bg-gold hover:bg-gold-dark text-black font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isAr ? "جاري الإرسال..." : "Submitting..."}
                  </>
                ) : isAr ? (
                  "سجل الآن"
                ) : (
                  "Register Now"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


