import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  selectedService: any;
  language: "en" | "ar";
  getFieldValue: (entity: any, field: string, lang: "en" | "ar") => string | undefined;
  servicesDetailsMap: { [serviceId: string]: any[] };
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  orderDetails: string;
  setOrderDetails: (details: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  open,
  onClose,
  selectedService,
  language,
  getFieldValue,
  servicesDetailsMap,
  email,
  setEmail,
  phone,
  setPhone,
  orderDetails,
  setOrderDetails,
  submitting,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-card-foreground">
            {language === 'en' ? 'Order Service' : 'طلب الخدمة'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Service Description */}
          {selectedService && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">
                {getFieldValue(selectedService, "title", language) || selectedService?.name || "Service"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getFieldValue(selectedService, "description", language) || selectedService?.details || ""}
              </p>
            </div>
          )}

          {/* Four Sections - Display Only (for selected service) */}
          {selectedService && (
            <div className="mb-6 space-y-6">
              {(() => {
                const selectedServiceId = selectedService?._id || selectedService?.id;
                let serviceSections: any[] = [];
                
                if (selectedServiceId && servicesDetailsMap[selectedServiceId]) {
                  serviceSections = servicesDetailsMap[selectedServiceId];
                } else {
                  serviceSections = [];
                }
                
                return serviceSections.slice(0, 4).map((section: any, index: number) => {
                  const sectionTitle = getFieldValue(section, "title", language) || section?.title_en || section?.title_ar || "";
                  const sectionDetails = getFieldValue(section, "details", language) || section?.details_en || section?.details_ar || "";
                  const sectionImage = section?.image || section?.imageUrl || "";
                  
                  return (
                    <div key={index} className="bg-muted/30 rounded-xl p-6 border border-border space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-card-foreground">
                          {sectionTitle || (language === 'en' ? `Section ${index + 1}` : `القسم ${index + 1}`)}
                        </h3>
                      </div>

                      {/* Image Display */}
                      {sectionImage ? (
                        <div>
                          <img
                            src={sectionImage}
                            alt={sectionTitle || `Section ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-muted/50 rounded-lg border border-border flex items-center justify-center">
                          <p className="text-muted-foreground text-sm">
                            {language === 'en' ? 'No image' : 'لا توجد صورة'}
                          </p>
                        </div>
                      )}

                      {/* Details Display */}
                      {sectionDetails ? (
                        <div>
                          <p className="text-card-foreground text-sm leading-relaxed whitespace-pre-wrap">
                            {sectionDetails}
                          </p>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm italic">
                          {language === 'en' ? 'No details available' : 'لا توجد تفاصيل متاحة'}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* Order Form - Email and Details Only */}
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              {language === 'en' ? 'Submit Your Order' : 'إرسال طلبك'}
            </h3>
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {language === 'en' ? 'Email' : 'البريد الإلكتروني'} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder={language === 'en' ? 'your.email@example.com' : 'بريدك.الإلكتروني@example.com'}
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {language === 'en' ? 'Phone Number' : 'رقم التليفون'} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder={language === 'en' ? '+1234567890' : '+201234567890'}
              />
            </div>

            {/* Order Details Textarea */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {language === 'en' ? 'Order Details' : 'تفاصيل الطلب'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={orderDetails}
                onChange={(e) => setOrderDetails(e.target.value)}
                required
                rows={6}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                placeholder={language === 'en' ? 'Please describe your order requirements...' : 'يرجى وصف متطلبات طلبك...'}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-6 bg-gold hover:bg-gold-dark text-black font-semibold"
            >
              {submitting 
                ? (language === 'en' ? 'Submitting...' : 'جاري الإرسال...')
                : (language === 'en' ? 'Order Now' : 'اطلب الآن')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

