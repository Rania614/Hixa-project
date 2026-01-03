import React from "react";
import { Button } from "@/components/ui/button";

interface ServicesSectionProps {
  servicesMetadata: any;
  services: any;
  language: "en" | "ar";
  getFieldValue: (entity: any, field: string, lang: "en" | "ar") => string | undefined;
  allServices: any[];
  renderServiceCard: (service: any, index: number, serviceDetails: any[], serviceId: string | null) => React.ReactNode;
  onOpenGeneralOrderModal: () => void;
  isLoading: boolean;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  servicesMetadata,
  services,
  language,
  getFieldValue,
  allServices,
  renderServiceCard,
  onOpenGeneralOrderModal,
  isLoading,
}) => {
  return (
    <section id="services" className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/95">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {servicesMetadata 
              ? (language === 'en' 
                  ? (servicesMetadata.title_en || servicesMetadata.title) 
                  : (servicesMetadata.title_ar || servicesMetadata.title))
              : getFieldValue(services, "title", language) || 
             (language === 'en' ? 'Our Services' : 'خدماتنا')}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto">
            {servicesMetadata 
              ? (language === 'en' 
                  ? (servicesMetadata.subtitle_en || servicesMetadata.subtitle) 
                  : (servicesMetadata.subtitle_ar || servicesMetadata.subtitle))
              : getFieldValue(services, "subtitle", language) || 
             (language === 'en' 
              ? 'We provide cutting-edge solutions tailored to your business needs'
              : 'نوفر حلولاً متطورة مصممة خصيصاً لاحتياجات عملك')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {allServices.length > 0 ? (
            allServices.map((item: any, index: number) => {
              return renderServiceCard(
                item.service, 
                index, 
                item.details, 
                item.serviceId
              );
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                {language === 'en' ? 'No services available' : 'لا توجد خدمات متاحة'}
              </p>
              {isLoading && (
                <div className="mt-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === 'en' ? 'Loading services...' : 'جاري تحميل الخدمات...'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* General Order Now Button - Centered below services */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={onOpenGeneralOrderModal}
            className="bg-gold hover:bg-gold-dark text-black font-semibold py-3 px-8 text-lg"
          >
            {language === 'en' ? 'Order Now' : 'اطلب الآن'}
          </Button>
        </div>
      </div>
    </section>
  );
};

