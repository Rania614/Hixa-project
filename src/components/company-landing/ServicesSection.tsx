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
  const isAr = language === 'ar';

  return (
    // تم تغيير الخلفية لدرجة البيج الدافئة المطفأة #F5F2ED لتطابق سكشن الشركاء
    <section id="services" className="py-20 px-4 sm:px-6 bg-[#F5F2ED]" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto">
        <div className="text-center mb-16">
          {/* عنوان السكشن بلون أسود دافئ */}
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1A1A1A]">
            {servicesMetadata 
              ? (language === 'en' 
                  ? (servicesMetadata.title_en || servicesMetadata.title) 
                  : (servicesMetadata.title_ar || servicesMetadata.title))
              : getFieldValue(services, "title", language) || 
               (language === 'en' ? 'Our Services' : 'خدماتنا')}
          </h2>
          {/* خط ذهبي صغير تحت العنوان لزيادة الفخامة */}
          <div className="w-16 h-1 bg-gold mx-auto mb-6 opacity-80"></div>
          
          <p className="text-lg sm:text-xl text-[#5A5A5A] max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
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
              // ملاحظة: تأكدي أن renderServiceCard بداخله كروت بخلفية بيضاء أو شفافة لتتناسب مع البيج
              return renderServiceCard(
                item.service, 
                index, 
                item.details, 
                item.serviceId
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-[#5A5A5A]">
                {language === 'en' ? 'No services available' : 'لا توجد خدمات متاحة'}
              </p>
              {isLoading && (
                <div className="mt-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                  <p className="text-sm text-[#5A5A5A] mt-2">
                    {language === 'en' ? 'Loading services...' : 'جاري تحميل الخدمات...'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* زر "اطلب الآن" بتصميم متناسق مع البيج والذهبي */}
        <div className="flex justify-center mt-16">
          <Button
            onClick={onOpenGeneralOrderModal}
            className="bg-[#1A1A1A] hover:bg-gold text-gold hover:text-black font-bold py-6 px-12 text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-gold/20"
          >
            {language === 'en' ? 'Order Now' : 'اطلب الآن'}
          </Button>
        </div>
      </div>
    </section>
  );
};